/**
 * Session Store - Central Zustand State Management
 *
 * Manages:
 * - Question bank and current question navigation
 * - Selected choice tracking
 * - Recording state machine (idle -> listening -> processing -> completed)
 * - Provider results (OpenAI and ElevenLabs)
 * - Computed scores and metrics
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  QuestionBank,
  Question,
  ProviderResult,
  ProviderStatus,
  RecordingState,
  ProviderMetrics,
  ScoringBreakdown,
  WordTiming,
  TestMode,
  OpenAIScoreResult,
} from "@rsta/shared";
import {
  calculateAccuracy,
  calculateFluency,
  calculateStructure,
  calculateOverall,
} from "../scoring";
import { scoreWithOpenAI } from "../services/openaiChatScoring";
import appConfig from "../data/app_config.json";

// ============================================================================
// Types
// ============================================================================

export type ProviderId = "openai" | "elevenlabs";

/**
 * Initial provider result state
 */
function createInitialProviderResult(): ProviderResult {
  return {
    status: "idle",
    transcript: {
      interimText: "",
      committedText: "",
      finalText: "",
    },
    words: undefined,
    durationMs: 0,
    fillers: [],
    metrics: null,
    breakdown: null,
    cost: null,
    errors: undefined,
  };
}

/**
 * Session store state interface
 */
export interface SessionState {
  // ---- Question Bank ----
  /** Loaded question bank */
  questionBank: QuestionBank | null;
  /** Current question index */
  currentQuestionIndex: number;
  /** Selected choice index (0-3) or null if none selected */
  selectedChoiceIndex: number | null;

  // ---- Recording State ----
  /** Current recording state */
  recordingState: RecordingState;
  /** Recording duration in milliseconds */
  recordingDurationMs: number;
  /** Recording start timestamp */
  recordingStartTime: number | null;

  // ---- Provider Results ----
  /** OpenAI provider result */
  openaiResult: ProviderResult;
  /** ElevenLabs provider result */
  elevenlabsResult: ProviderResult;

  // ---- Test Mode ----
  /** Current test mode */
  testMode: TestMode;
  /** Open-ended AI scoring result */
  openEndedResult: OpenAIScoreResult | null;
  /** Whether AI scoring is in progress */
  isAIScoring: boolean;
}

/**
 * Session store actions interface
 */
export interface SessionActions {
  // ---- Bank Management ----
  /** Load a question bank */
  loadBank: (bank: QuestionBank) => void;

  // ---- Choice Selection ----
  /** Select a choice option */
  selectChoice: (index: number) => void;
  /** Clear selected choice */
  clearChoice: () => void;

  // ---- Recording Control ----
  /** Start recording */
  startRecording: () => void;
  /** Stop recording and begin processing */
  stopRecording: () => void;
  /** Set recording as completed */
  setRecordingCompleted: () => void;
  /** Update recording duration */
  updateRecordingDuration: (durationMs: number) => void;

  // ---- Provider Management ----
  /** Update provider status */
  updateProviderStatus: (provider: ProviderId, status: ProviderStatus) => void;
  /** Update provider transcript (interim or final) */
  updateProviderTranscript: (
    provider: ProviderId,
    transcript: {
      interimText?: string;
      committedText?: string;
      finalText?: string;
    }
  ) => void;
  /** Update provider words (timing data) */
  updateProviderWords: (provider: ProviderId, words: WordTiming[]) => void;
  /** Update provider duration */
  updateProviderDuration: (provider: ProviderId, durationMs: number) => void;
  /** Set provider error */
  setProviderError: (provider: ProviderId, error: string) => void;
  /** Reset provider to initial state */
  resetProvider: (provider: ProviderId) => void;

  // ---- Scoring ----
  /** Compute scores for a provider using its transcript and word data */
  computeScores: (provider: ProviderId) => void;

  // ---- Navigation ----
  /** Move to next question */
  nextQuestion: () => void;
  /** Move to previous question */
  previousQuestion: () => void;
  /** Jump to a specific question */
  goToQuestion: (index: number) => void;
  /** Repeat current question (reset recording state, keep question) */
  repeatQuestion: () => void;

  // ---- Session Management ----
  /** Reset entire session (keep bank, reset progress) */
  resetSession: () => void;
  /** Clear everything including bank */
  clearAll: () => void;

  // ---- Test Mode ----
  /** Set test mode */
  setTestMode: (mode: TestMode) => void;
  /** Score open-ended response using AI */
  scoreOpenEndedResponse: (transcript: string) => Promise<void>;

  // ---- Computed Getters ----
  /** Get current question */
  getCurrentQuestion: () => Question | null;
  /** Check if selected choice is correct */
  isCorrect: () => boolean | null;
  /** Check if user can start talking (choice selected + idle) */
  canTalk: () => boolean;
  /** Check if user can proceed to next question */
  canNext: () => boolean;
  /** Check if session is complete (last question done) */
  isSessionComplete: () => boolean;
  /** Get session progress (current/total) */
  getProgress: () => { current: number; total: number };
}

export type SessionStore = SessionState & SessionActions;

// ============================================================================
// Initial State
// ============================================================================

const initialState: SessionState = {
  questionBank: null,
  currentQuestionIndex: 0,
  selectedChoiceIndex: null,
  recordingState: "idle",
  recordingDurationMs: 0,
  recordingStartTime: null,
  openaiResult: createInitialProviderResult(),
  elevenlabsResult: createInitialProviderResult(),
  testMode: "read-aloud",
  openEndedResult: null,
  isAIScoring: false,
};

// ============================================================================
// Store Implementation
// ============================================================================

export const useSessionStore = create<SessionStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      ...initialState,

      // ========================================================================
      // Bank Management
      // ========================================================================

      loadBank: (bank: QuestionBank) => {
        set(
          {
            questionBank: bank,
            currentQuestionIndex: 0,
            selectedChoiceIndex: null,
            recordingState: "idle",
            recordingDurationMs: 0,
            recordingStartTime: null,
            openaiResult: createInitialProviderResult(),
            elevenlabsResult: createInitialProviderResult(),
          },
          false,
          "loadBank"
        );
      },

      // ========================================================================
      // Choice Selection
      // ========================================================================

      selectChoice: (index: number) => {
        const { recordingState } = get();
        // Prevent selection change during recording if configured
        if (
          appConfig.featureFlags.lockSelectionDuringRecording &&
          recordingState !== "idle"
        ) {
          return;
        }

        if (index >= 0 && index <= 3) {
          set({ selectedChoiceIndex: index }, false, "selectChoice");
        }
      },

      clearChoice: () => {
        set({ selectedChoiceIndex: null }, false, "clearChoice");
      },

      // ========================================================================
      // Recording Control
      // ========================================================================

      startRecording: () => {
        const { selectedChoiceIndex, recordingState, questionBank, testMode } = get();

        // Guard: must have bank loaded
        if (!questionBank) {
          console.warn("Cannot start recording: no question bank loaded");
          return;
        }

        // Guard: must have a choice selected (only in read-aloud mode)
        if (testMode === "read-aloud" && selectedChoiceIndex === null) {
          console.warn("Cannot start recording: no choice selected");
          return;
        }

        // Guard: must be in idle state
        if (recordingState !== "idle") {
          console.warn("Cannot start recording: not in idle state");
          return;
        }

        set(
          {
            recordingState: "listening",
            recordingStartTime: Date.now(),
            recordingDurationMs: 0,
            // Reset provider results for new recording
            openaiResult: {
              ...createInitialProviderResult(),
              status: "connecting",
            },
            elevenlabsResult: {
              ...createInitialProviderResult(),
              status: "connecting",
            },
            // Reset open-ended result for new recording
            openEndedResult: null,
            isAIScoring: false,
          },
          false,
          "startRecording"
        );
      },

      stopRecording: () => {
        const { recordingState, recordingStartTime } = get();

        if (recordingState !== "listening") {
          console.warn("Cannot stop recording: not currently listening");
          return;
        }

        // Calculate final duration
        const durationMs = recordingStartTime
          ? Date.now() - recordingStartTime
          : 0;

        set(
          {
            recordingState: "processing",
            recordingDurationMs: durationMs,
            recordingStartTime: null,
          },
          false,
          "stopRecording"
        );
      },

      setRecordingCompleted: () => {
        set({ recordingState: "completed" }, false, "setRecordingCompleted");
      },

      updateRecordingDuration: (durationMs: number) => {
        set({ recordingDurationMs: durationMs }, false, "updateRecordingDuration");
      },

      // ========================================================================
      // Provider Management
      // ========================================================================

      updateProviderStatus: (provider: ProviderId, status: ProviderStatus) => {
        const resultKey = provider === "openai" ? "openaiResult" : "elevenlabsResult";
        const currentResult = get()[resultKey];

        set(
          {
            [resultKey]: {
              ...currentResult,
              status,
            },
          },
          false,
          `updateProviderStatus/${provider}`
        );
      },

      updateProviderTranscript: (
        provider: ProviderId,
        transcript: {
          interimText?: string;
          committedText?: string;
          finalText?: string;
        }
      ) => {
        const resultKey = provider === "openai" ? "openaiResult" : "elevenlabsResult";
        const currentResult = get()[resultKey];

        set(
          {
            [resultKey]: {
              ...currentResult,
              transcript: {
                ...currentResult.transcript,
                ...transcript,
              },
            },
          },
          false,
          `updateProviderTranscript/${provider}`
        );
      },

      updateProviderWords: (provider: ProviderId, words: WordTiming[]) => {
        const resultKey = provider === "openai" ? "openaiResult" : "elevenlabsResult";
        const currentResult = get()[resultKey];

        set(
          {
            [resultKey]: {
              ...currentResult,
              words,
            },
          },
          false,
          `updateProviderWords/${provider}`
        );
      },

      updateProviderDuration: (provider: ProviderId, durationMs: number) => {
        const resultKey = provider === "openai" ? "openaiResult" : "elevenlabsResult";
        const currentResult = get()[resultKey];

        set(
          {
            [resultKey]: {
              ...currentResult,
              durationMs,
            },
          },
          false,
          `updateProviderDuration/${provider}`
        );
      },

      setProviderError: (provider: ProviderId, error: string) => {
        const resultKey = provider === "openai" ? "openaiResult" : "elevenlabsResult";
        const currentResult = get()[resultKey];

        set(
          {
            [resultKey]: {
              ...currentResult,
              status: "error",
              errors: [...(currentResult.errors || []), error],
            },
          },
          false,
          `setProviderError/${provider}`
        );
      },

      resetProvider: (provider: ProviderId) => {
        const resultKey = provider === "openai" ? "openaiResult" : "elevenlabsResult";

        set(
          {
            [resultKey]: createInitialProviderResult(),
          },
          false,
          `resetProvider/${provider}`
        );
      },

      // ========================================================================
      // Scoring
      // ========================================================================

      computeScores: (provider: ProviderId) => {
        const state = get();
        const resultKey = provider === "openai" ? "openaiResult" : "elevenlabsResult";
        const result = state[resultKey];
        const currentQuestion = state.getCurrentQuestion();

        if (!currentQuestion) {
          console.warn("Cannot compute scores: no current question");
          return;
        }

        // Get final transcript
        const transcript =
          result.transcript.finalText ||
          result.transcript.committedText ||
          result.transcript.interimText;

        if (!transcript) {
          console.warn("Cannot compute scores: no transcript available");
          return;
        }

        // Get expected answer based on selected choice or expected spoken answer
        const expected =
          state.selectedChoiceIndex !== null
            ? currentQuestion.options[state.selectedChoiceIndex]
            : currentQuestion.expectedSpokenAnswer;

        // Calculate accuracy score (pure text similarity)
        const accuracyResult = calculateAccuracy(transcript, expected);

        // Calculate fluency score (filler word detection)
        const fluencyResult = calculateFluency(transcript);

        // Calculate structure score (radio protocol adherence)
        const structureResult = calculateStructure(
          transcript,
          currentQuestion.structureMode,
          currentQuestion.expectedKeywords
        );

        // Calculate overall score with new weights: 50% accuracy, 30% fluency, 20% structure
        const overall = calculateOverall(
          accuracyResult.score,
          fluencyResult.score,
          structureResult.score
        );

        // Create metrics object
        const metrics: ProviderMetrics = {
          accuracy: accuracyResult.score,
          fluency: fluencyResult.score,
          structure: structureResult.score,
          overall,
        };

        // Create breakdown object
        const breakdown: ScoringBreakdown = {
          accuracy: accuracyResult.breakdown,
          fluency: fluencyResult.breakdown,
          structure: structureResult.breakdown,
        };

        // Calculate cost estimate
        const costRate = appConfig.costRates[provider];
        const durationMinutes = result.durationMs / 60000;
        const estimatedCost = costRate * durationMinutes;

        // Update provider result with fillers from fluency breakdown
        set(
          {
            [resultKey]: {
              ...result,
              status: "completed",
              fillers: fluencyResult.breakdown.fillers,
              metrics,
              breakdown,
              cost: {
                currency: "USD",
                amount: estimatedCost,
                method: "estimate",
              },
            },
          },
          false,
          `computeScores/${provider}`
        );

        // Check if both providers are completed and update recording state
        const updatedState = get();
        if (
          updatedState.openaiResult.status === "completed" &&
          updatedState.elevenlabsResult.status === "completed"
        ) {
          set({ recordingState: "completed" }, false, "allProvidersCompleted");
        }
      },

      // ========================================================================
      // Navigation
      // ========================================================================

      nextQuestion: () => {
        const { questionBank, currentQuestionIndex } = get();

        if (!questionBank) return;

        const nextIndex = currentQuestionIndex + 1;
        if (nextIndex < questionBank.questions.length) {
          set(
            {
              currentQuestionIndex: nextIndex,
              selectedChoiceIndex: null,
              recordingState: "idle",
              recordingDurationMs: 0,
              recordingStartTime: null,
              openaiResult: createInitialProviderResult(),
              elevenlabsResult: createInitialProviderResult(),
              openEndedResult: null,
              isAIScoring: false,
            },
            false,
            "nextQuestion"
          );
        }
      },

      previousQuestion: () => {
        const { currentQuestionIndex } = get();

        if (currentQuestionIndex > 0) {
          set(
            {
              currentQuestionIndex: currentQuestionIndex - 1,
              selectedChoiceIndex: null,
              recordingState: "idle",
              recordingDurationMs: 0,
              recordingStartTime: null,
              openaiResult: createInitialProviderResult(),
              elevenlabsResult: createInitialProviderResult(),
              openEndedResult: null,
              isAIScoring: false,
            },
            false,
            "previousQuestion"
          );
        }
      },

      goToQuestion: (index: number) => {
        const { questionBank } = get();

        if (!questionBank) return;

        if (index >= 0 && index < questionBank.questions.length) {
          set(
            {
              currentQuestionIndex: index,
              selectedChoiceIndex: null,
              recordingState: "idle",
              recordingDurationMs: 0,
              recordingStartTime: null,
              openaiResult: createInitialProviderResult(),
              elevenlabsResult: createInitialProviderResult(),
              openEndedResult: null,
              isAIScoring: false,
            },
            false,
            "goToQuestion"
          );
        }
      },

      repeatQuestion: () => {
        // Reset recording state but keep current question and selected choice
        set(
          {
            recordingState: "idle",
            recordingDurationMs: 0,
            recordingStartTime: null,
            openaiResult: createInitialProviderResult(),
            elevenlabsResult: createInitialProviderResult(),
            openEndedResult: null,
            isAIScoring: false,
          },
          false,
          "repeatQuestion"
        );
      },

      // ========================================================================
      // Session Management
      // ========================================================================

      resetSession: () => {
        const { questionBank } = get();
        set(
          {
            ...initialState,
            questionBank, // Keep the loaded bank
          },
          false,
          "resetSession"
        );
      },

      clearAll: () => {
        set(initialState, false, "clearAll");
      },

      // ========================================================================
      // Test Mode
      // ========================================================================

      setTestMode: (mode: TestMode) => {
        const { testMode } = get();
        if (mode === testMode) return;

        // Reset state when switching modes
        set(
          {
            testMode: mode,
            selectedChoiceIndex: null,
            recordingState: "idle",
            recordingDurationMs: 0,
            recordingStartTime: null,
            openaiResult: createInitialProviderResult(),
            elevenlabsResult: createInitialProviderResult(),
            openEndedResult: null,
            isAIScoring: false,
          },
          false,
          "setTestMode"
        );
      },

      scoreOpenEndedResponse: async (transcript: string) => {
        const state = get();
        const currentQuestion = state.getCurrentQuestion();

        if (!currentQuestion) {
          console.warn("Cannot score: no current question");
          return;
        }

        if (!transcript || transcript.trim().length === 0) {
          console.warn("Cannot score: empty transcript");
          return;
        }

        // Set scoring in progress
        set({ isAIScoring: true }, false, "scoreOpenEndedResponse/start");

        try {
          const result = await scoreWithOpenAI({
            transcript,
            expectedAnswer: currentQuestion.expectedSpokenAnswer,
            scenarioPrompt: currentQuestion.prompt,
            structureMode: currentQuestion.structureMode,
          });

          set(
            {
              openEndedResult: result,
              isAIScoring: false,
              recordingState: "completed",
            },
            false,
            "scoreOpenEndedResponse/success"
          );
        } catch (error) {
          console.error("AI scoring failed:", error);
          set(
            {
              isAIScoring: false,
              openEndedResult: {
                accuracy: 0,
                fluency: 0,
                structure: 0,
                overall: 0,
                feedback: `Scoring failed: ${error instanceof Error ? error.message : "Unknown error"}`,
                fillerWords: [],
                fillerCount: 0,
                radioProtocolNotes: "Unable to evaluate due to scoring error.",
              },
              recordingState: "completed",
            },
            false,
            "scoreOpenEndedResponse/error"
          );
        }
      },

      // ========================================================================
      // Computed Getters
      // ========================================================================

      getCurrentQuestion: () => {
        const { questionBank, currentQuestionIndex } = get();
        if (!questionBank || currentQuestionIndex >= questionBank.questions.length) {
          return null;
        }
        return questionBank.questions[currentQuestionIndex];
      },

      isCorrect: () => {
        const { selectedChoiceIndex } = get();
        const currentQuestion = get().getCurrentQuestion();

        if (selectedChoiceIndex === null || !currentQuestion) {
          return null;
        }

        return selectedChoiceIndex === currentQuestion.correctIndex;
      },

      canTalk: () => {
        const { selectedChoiceIndex, recordingState, questionBank, testMode } = get();
        // In open-ended mode, no choice selection required
        if (testMode === "open-ended") {
          return questionBank !== null && recordingState === "idle";
        }
        // In read-aloud mode, must have choice selected
        return (
          questionBank !== null &&
          selectedChoiceIndex !== null &&
          recordingState === "idle"
        );
      },

      canNext: () => {
        const { recordingState, questionBank, currentQuestionIndex } = get();
        if (!questionBank) return false;

        // Must have completed recording
        if (recordingState !== "completed") return false;

        // Must not be at the last question
        return currentQuestionIndex < questionBank.questions.length - 1;
      },

      isSessionComplete: () => {
        const { questionBank, currentQuestionIndex, recordingState } = get();
        if (!questionBank) return false;

        return (
          currentQuestionIndex === questionBank.questions.length - 1 &&
          recordingState === "completed"
        );
      },

      getProgress: () => {
        const { questionBank, currentQuestionIndex } = get();
        if (!questionBank) {
          return { current: 0, total: 0 };
        }
        return {
          current: currentQuestionIndex + 1,
          total: questionBank.questions.length,
        };
      },
    }),
    { name: "SessionStore" }
  )
);

// ============================================================================
// Selector Hooks (for optimized re-renders)
// ============================================================================

/** Select current question index */
export const useCurrentQuestionIndex = () =>
  useSessionStore((state) => state.currentQuestionIndex);

/** Select selected choice index */
export const useSelectedChoiceIndex = () =>
  useSessionStore((state) => state.selectedChoiceIndex);

/** Select recording state */
export const useRecordingState = () =>
  useSessionStore((state) => state.recordingState);

/** Select OpenAI result */
export const useOpenAIResult = () =>
  useSessionStore((state) => state.openaiResult);

/** Select ElevenLabs result */
export const useElevenLabsResult = () =>
  useSessionStore((state) => state.elevenlabsResult);

/** Select question bank */
export const useQuestionBank = () =>
  useSessionStore((state) => state.questionBank);

/** Select test mode */
export const useTestMode = () =>
  useSessionStore((state) => state.testMode);

/** Select open-ended result */
export const useOpenEndedResult = () =>
  useSessionStore((state) => state.openEndedResult);

/** Select AI scoring state */
export const useIsAIScoring = () =>
  useSessionStore((state) => state.isAIScoring);

export default useSessionStore;
