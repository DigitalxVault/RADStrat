/**
 * useConnectionPool Hook
 *
 * React hook for managing the pre-connected WebSocket connection pool.
 * Automatically initializes connections when the question changes,
 * enabling zero-delay speech capture when user clicks TALK.
 */

import { useEffect, useCallback } from 'react';
import {
  useConnectionPoolStore,
  useConnectionPoolReady,
  useConnectionPoolInitializing,
  useConnectionPoolError,
} from '../state/connectionPoolStore';
import { useSessionStore } from '../state/sessionStore';

// ============================================================================
// HOOK
// ============================================================================

export function useConnectionPool() {
  // Connection pool state
  const isReady = useConnectionPoolReady();
  const isInitializing = useConnectionPoolInitializing();
  const error = useConnectionPoolError();

  // Connection pool actions
  const initialize = useConnectionPoolStore((state) => state.initialize);
  const teardown = useConnectionPoolStore((state) => state.teardown);
  const resetAdaptersForNewRecording = useConnectionPoolStore(
    (state) => state.resetAdaptersForNewRecording
  );
  const getAdapter = useConnectionPoolStore((state) => state.getAdapter);
  const isFullyReady = useConnectionPoolStore((state) => state.isFullyReady);
  const clearError = useConnectionPoolStore((state) => state.clearError);

  // Session state
  const questionBank = useSessionStore((state) => state.questionBank);
  const currentQuestionIndex = useSessionStore((state) => state.currentQuestionIndex);
  const recordingState = useSessionStore((state) => state.recordingState);

  // Initialize connection pool when question changes
  useEffect(() => {
    // Only initialize when:
    // 1. We have a question bank loaded
    // 2. Not currently recording
    if (questionBank && recordingState === 'idle') {
      console.log('[useConnectionPool] Initializing for question', currentQuestionIndex + 1);
      initialize();
    }
  }, [questionBank, currentQuestionIndex, recordingState, initialize]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('[useConnectionPool] Unmounting, tearing down connections');
      teardown();
    };
  }, [teardown]);

  // Reset adapters when recording completes (prepare for next recording)
  useEffect(() => {
    if (recordingState === 'completed') {
      // Small delay to ensure final transcripts are processed
      const timeoutId = setTimeout(() => {
        resetAdaptersForNewRecording();
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [recordingState, resetAdaptersForNewRecording]);

  // Memoized getters
  const getOpenAIAdapter = useCallback(() => getAdapter('openai'), [getAdapter]);
  const getElevenLabsAdapter = useCallback(() => getAdapter('elevenlabs'), [getAdapter]);

  return {
    // State
    isReady,
    isInitializing,
    error,

    // Getters
    getOpenAIAdapter,
    getElevenLabsAdapter,
    isFullyReady,

    // Actions
    initialize,
    teardown,
    resetForRecording: resetAdaptersForNewRecording,
    clearError,
  };
}

export default useConnectionPool;
