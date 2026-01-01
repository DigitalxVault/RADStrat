/**
 * Connection Pool Store
 *
 * Manages pre-established WebSocket connections for zero-delay speech capture.
 * Tokens are fetched and connections are established when questions load,
 * so TALK button only needs mic permission + chunker start (~100-300ms total).
 */

import { create } from 'zustand';
import { OpenAIRealtimeAdapter } from '../providers/openaiRealtime';
import { ElevenLabsRealtimeAdapter } from '../providers/elevenlabsRealtime';
import type { BaseProviderAdapter } from '../providers/base';

// ============================================================================
// TYPES
// ============================================================================

interface TokenInfo {
  token: string;
  websocketUrl: string;
  expiresAt: number;
}

interface ConnectionPoolState {
  // Tokens
  openaiToken: TokenInfo | null;
  elevenlabsToken: TokenInfo | null;

  // Pre-connected adapters
  openaiAdapter: BaseProviderAdapter | null;
  elevenlabsAdapter: BaseProviderAdapter | null;

  // Status
  isInitializing: boolean;
  isReady: boolean;
  error: string | null;

  // Reconnect tracking
  reconnectAttempts: number;
}

interface ConnectionPoolActions {
  /** Initialize connection pool - fetch tokens and establish connections */
  initialize: () => Promise<void>;

  /** Teardown all connections and clear tokens */
  teardown: () => void;

  /** Reset adapters for new recording without disconnecting */
  resetAdaptersForNewRecording: () => void;

  /** Get a pre-connected adapter by provider */
  getAdapter: (provider: 'openai' | 'elevenlabs') => BaseProviderAdapter | null;

  /** Check if both adapters are ready */
  isFullyReady: () => boolean;

  /** Clear error state */
  clearError: () => void;
}

type ConnectionPoolStore = ConnectionPoolState & ConnectionPoolActions;

// ============================================================================
// CONSTANTS
// ============================================================================

const TOKEN_REFRESH_BUFFER_MS = 60000; // Refresh when < 60s remaining
const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_DELAY_MS = 1000;

// API endpoints
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
const OPENAI_TOKEN_URL = `${API_BASE_URL}/api/token/openai`;
const ELEVENLABS_TOKEN_URL = `${API_BASE_URL}/api/token/elevenlabs`;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a token is expired or about to expire
 */
function isTokenExpired(token: TokenInfo | null): boolean {
  if (!token) return true;
  return Date.now() >= token.expiresAt - TOKEN_REFRESH_BUFFER_MS;
}

/**
 * Fetch OpenAI realtime token from server
 */
async function fetchOpenAIToken(): Promise<TokenInfo> {
  const response = await fetch(OPENAI_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch OpenAI token: ${response.status}`);
  }

  const data = await response.json();
  return {
    token: data.token,
    websocketUrl: data.websocketUrl,
    expiresAt: data.expiresAt,
  };
}

/**
 * Fetch ElevenLabs realtime token from server
 */
async function fetchElevenLabsToken(): Promise<TokenInfo> {
  const response = await fetch(ELEVENLABS_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ElevenLabs token: ${response.status}`);
  }

  const data = await response.json();
  return {
    token: data.token,
    websocketUrl: data.websocketUrl,
    expiresAt: data.expiresAt,
  };
}

/**
 * Create and connect OpenAI adapter
 */
async function createOpenAIAdapter(token: TokenInfo): Promise<OpenAIRealtimeAdapter> {
  const adapter = new OpenAIRealtimeAdapter();

  adapter.configure({
    token: token.token,
    websocketUrl: token.websocketUrl,
    model: 'gpt-4o-realtime-preview',
    language: 'en',
  });

  await adapter.connect();
  return adapter;
}

/**
 * Create and connect ElevenLabs adapter
 */
async function createElevenLabsAdapter(token: TokenInfo): Promise<ElevenLabsRealtimeAdapter> {
  const adapter = new ElevenLabsRealtimeAdapter();

  adapter.configure({
    token: token.token,
    websocketUrl: token.websocketUrl,
    language: 'en',
  });

  await adapter.connect();
  return adapter;
}

// ============================================================================
// STORE
// ============================================================================

export const useConnectionPoolStore = create<ConnectionPoolStore>((set, get) => ({
  // Initial state
  openaiToken: null,
  elevenlabsToken: null,
  openaiAdapter: null,
  elevenlabsAdapter: null,
  isInitializing: false,
  isReady: false,
  error: null,
  reconnectAttempts: 0,

  /**
   * Initialize connection pool - fetch tokens and establish connections
   */
  initialize: async () => {
    const state = get();

    // Already initializing or ready
    if (state.isInitializing) {
      console.log('[ConnectionPool] Already initializing, skipping');
      return;
    }

    // Check if already ready with valid tokens
    if (state.isReady && !isTokenExpired(state.openaiToken) && !isTokenExpired(state.elevenlabsToken)) {
      console.log('[ConnectionPool] Already ready with valid tokens');
      return;
    }

    set({ isInitializing: true, error: null });
    console.log('[ConnectionPool] Initializing...');

    try {
      // Fetch tokens in parallel
      console.log('[ConnectionPool] Fetching tokens...');
      const [openaiResult, elevenlabsResult] = await Promise.allSettled([
        fetchOpenAIToken(),
        fetchElevenLabsToken(),
      ]);

      // Process OpenAI token
      let openaiToken: TokenInfo | null = null;
      if (openaiResult.status === 'fulfilled') {
        openaiToken = openaiResult.value;
        console.log('[ConnectionPool] OpenAI token acquired');
      } else {
        console.error('[ConnectionPool] OpenAI token fetch failed:', openaiResult.reason);
      }

      // Process ElevenLabs token
      let elevenlabsToken: TokenInfo | null = null;
      if (elevenlabsResult.status === 'fulfilled') {
        elevenlabsToken = elevenlabsResult.value;
        console.log('[ConnectionPool] ElevenLabs token acquired');
      } else {
        console.error('[ConnectionPool] ElevenLabs token fetch failed:', elevenlabsResult.reason);
      }

      // Update tokens
      set({ openaiToken, elevenlabsToken });

      // Establish WebSocket connections in parallel
      console.log('[ConnectionPool] Establishing WebSocket connections...');
      const connectionPromises: Promise<void>[] = [];

      let openaiAdapter: BaseProviderAdapter | null = null;
      let elevenlabsAdapter: BaseProviderAdapter | null = null;

      if (openaiToken) {
        connectionPromises.push(
          createOpenAIAdapter(openaiToken).then((adapter) => {
            openaiAdapter = adapter;
            console.log('[ConnectionPool] OpenAI adapter connected');
          }).catch((err) => {
            console.error('[ConnectionPool] OpenAI adapter connection failed:', err);
          })
        );
      }

      if (elevenlabsToken) {
        connectionPromises.push(
          createElevenLabsAdapter(elevenlabsToken).then((adapter) => {
            elevenlabsAdapter = adapter;
            console.log('[ConnectionPool] ElevenLabs adapter connected');
          }).catch((err) => {
            console.error('[ConnectionPool] ElevenLabs adapter connection failed:', err);
          })
        );
      }

      await Promise.all(connectionPromises);

      // Check if at least one adapter connected
      const hasConnection = openaiAdapter !== null || elevenlabsAdapter !== null;

      set({
        openaiAdapter,
        elevenlabsAdapter,
        isInitializing: false,
        isReady: hasConnection,
        error: hasConnection ? null : 'Failed to establish any connections',
        reconnectAttempts: 0,
      });

      if (hasConnection) {
        console.log('[ConnectionPool] Ready - connections pre-established');
      } else {
        console.error('[ConnectionPool] Failed to establish any connections');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[ConnectionPool] Initialization failed:', errorMessage);

      const attempts = get().reconnectAttempts + 1;

      if (attempts < MAX_RECONNECT_ATTEMPTS) {
        set({
          isInitializing: false,
          reconnectAttempts: attempts,
          error: `Connection failed, retrying (${attempts}/${MAX_RECONNECT_ATTEMPTS})...`,
        });

        // Retry after delay
        setTimeout(() => {
          get().initialize();
        }, RECONNECT_DELAY_MS * attempts);
      } else {
        set({
          isInitializing: false,
          isReady: false,
          error: `Failed to initialize after ${MAX_RECONNECT_ATTEMPTS} attempts: ${errorMessage}`,
        });
      }
    }
  },

  /**
   * Teardown all connections and clear tokens
   */
  teardown: () => {
    const state = get();
    console.log('[ConnectionPool] Tearing down...');

    // Disconnect adapters
    if (state.openaiAdapter) {
      try {
        state.openaiAdapter.disconnect();
      } catch (e) {
        console.error('[ConnectionPool] Error disconnecting OpenAI adapter:', e);
      }
    }

    if (state.elevenlabsAdapter) {
      try {
        state.elevenlabsAdapter.disconnect();
      } catch (e) {
        console.error('[ConnectionPool] Error disconnecting ElevenLabs adapter:', e);
      }
    }

    set({
      openaiToken: null,
      elevenlabsToken: null,
      openaiAdapter: null,
      elevenlabsAdapter: null,
      isInitializing: false,
      isReady: false,
      error: null,
      reconnectAttempts: 0,
    });

    console.log('[ConnectionPool] Teardown complete');
  },

  /**
   * Reset adapters for new recording without disconnecting
   */
  resetAdaptersForNewRecording: () => {
    const state = get();
    console.log('[ConnectionPool] Resetting adapters for new recording...');

    // Reset transcript state on adapters without disconnecting
    if (state.openaiAdapter) {
      state.openaiAdapter.resetForNewRecording?.();
    }

    if (state.elevenlabsAdapter) {
      state.elevenlabsAdapter.resetForNewRecording?.();
    }

    console.log('[ConnectionPool] Adapters reset for new recording');
  },

  /**
   * Get a pre-connected adapter by provider
   */
  getAdapter: (provider: 'openai' | 'elevenlabs'): BaseProviderAdapter | null => {
    const state = get();
    return provider === 'openai' ? state.openaiAdapter : state.elevenlabsAdapter;
  },

  /**
   * Check if both adapters are ready
   */
  isFullyReady: (): boolean => {
    const state = get();
    const openaiReady = state.openaiAdapter?.isConnected() ?? false;
    const elevenlabsReady = state.elevenlabsAdapter?.isConnected() ?? false;
    return openaiReady && elevenlabsReady;
  },

  /**
   * Clear error state
   */
  clearError: () => {
    set({ error: null });
  },
}));

// ============================================================================
// SELECTORS (for React components)
// ============================================================================

export const useConnectionPoolReady = () =>
  useConnectionPoolStore((state) => state.isReady);

export const useConnectionPoolInitializing = () =>
  useConnectionPoolStore((state) => state.isInitializing);

export const useConnectionPoolError = () =>
  useConnectionPoolStore((state) => state.error);

export const useOpenAIAdapter = () =>
  useConnectionPoolStore((state) => state.openaiAdapter);

export const useElevenLabsAdapter = () =>
  useConnectionPoolStore((state) => state.elevenlabsAdapter);
