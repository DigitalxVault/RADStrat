/**
 * Main Application Component
 *
 * Radio Speech-To-Text Analyzer (RSTA)
 * Wires together all components with Zustand state management
 * and dual STT provider integration.
 */

import { useEffect, useRef, useCallback } from 'react';

// Components
import {
  QuestionPanel,
  ChoicesGrid,
  PushToTalkControls,
  ProviderPanel,
  NextQuestionButton,
  RepeatQuestionButton,
  CorrectnessIndicator,
  BankLoader,
} from './components';
import { TestModeToggle } from './components/TestModeToggle';
import { OpenEndedQuestionPanel } from './components/OpenEndedQuestionPanel';
import { OpenEndedResultPanel } from './components/OpenEndedResultPanel';

// State
import { useSessionStore } from './state/sessionStore';

// Hooks
import { useDualSTT } from './hooks/useDualSTT';
import { useConnectionPool } from './hooks/useConnectionPool';

// Types
import type { QuestionBank } from '@rsta/shared';

// Data
import defaultQuestionBank from './data/question_bank.json';

// ============================================================================
// OPTION LETTERS
// ============================================================================

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;

// ============================================================================
// APP COMPONENT
// ============================================================================

function App() {
  // ---- Session State ----
  const questionBank = useSessionStore((state) => state.questionBank);
  const currentQuestionIndex = useSessionStore((state) => state.currentQuestionIndex);
  const selectedChoiceIndex = useSessionStore((state) => state.selectedChoiceIndex);
  const recordingState = useSessionStore((state) => state.recordingState);
  const recordingDurationMs = useSessionStore((state) => state.recordingDurationMs);
  const openaiResult = useSessionStore((state) => state.openaiResult);
  const elevenlabsResult = useSessionStore((state) => state.elevenlabsResult);
  const testMode = useSessionStore((state) => state.testMode);
  const openEndedResult = useSessionStore((state) => state.openEndedResult);
  const isAIScoring = useSessionStore((state) => state.isAIScoring);

  // ---- Session Actions ----
  const loadBank = useSessionStore((state) => state.loadBank);
  const selectChoice = useSessionStore((state) => state.selectChoice);
  const nextQuestion = useSessionStore((state) => state.nextQuestion);
  const repeatQuestion = useSessionStore((state) => state.repeatQuestion);
  const getCurrentQuestion = useSessionStore((state) => state.getCurrentQuestion);
  const isCorrect = useSessionStore((state) => state.isCorrect);
  const canTalk = useSessionStore((state) => state.canTalk);
  const canNext = useSessionStore((state) => state.canNext);
  const getProgress = useSessionStore((state) => state.getProgress);
  const isSessionComplete = useSessionStore((state) => state.isSessionComplete);
  const setTestMode = useSessionStore((state) => state.setTestMode);
  const scoreOpenEndedResponse = useSessionStore((state) => state.scoreOpenEndedResponse);

  // ---- Connection Pool Hook (pre-establishes WebSocket connections) ----
  const {
    isReady: _poolIsReady,
    isInitializing: poolIsInitializing,
    error: poolError,
  } = useConnectionPool();

  // ---- Dual STT Hook ----
  const {
    startRecording,
    stopRecording,
    isRecording,
    error: sttError,
  } = useDualSTT();

  // ---- Recording Duration Timer ----
  const durationIntervalRef = useRef<number | null>(null);
  const updateRecordingDuration = useSessionStore((state) => state.updateRecordingDuration);
  const recordingStartTime = useSessionStore((state) => state.recordingStartTime);

  useEffect(() => {
    if (recordingState === 'listening' && recordingStartTime) {
      durationIntervalRef.current = window.setInterval(() => {
        const elapsed = Date.now() - recordingStartTime;
        updateRecordingDuration(elapsed);
      }, 100);
    } else {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [recordingState, recordingStartTime, updateRecordingDuration]);

  // ---- Auto-load Default Bank ----
  useEffect(() => {
    if (!questionBank) {
      loadBank(defaultQuestionBank as QuestionBank);
    }
  }, [questionBank, loadBank]);

  // ---- Computed Values ----
  const currentQuestion = getCurrentQuestion();
  const progress = getProgress();
  const correctnessResult = isCorrect();
  const talkEnabled = canTalk();
  const nextEnabled = canNext();
  const sessionComplete = isSessionComplete();
  const isLastQuestion = currentQuestionIndex === (questionBank?.questions.length ?? 1) - 1;
  const isOpenEndedMode = testMode === 'open-ended';

  // Get transcript for open-ended mode (from OpenAI result)
  const userTranscript = openaiResult.transcript.finalText ||
    openaiResult.transcript.committedText ||
    openaiResult.transcript.interimText || '';

  // ---- Handlers ----
  const handleBankLoad = useCallback((bank: QuestionBank) => {
    loadBank(bank);
  }, [loadBank]);

  const handleChoiceSelect = useCallback((index: 0 | 1 | 2 | 3) => {
    selectChoice(index);
  }, [selectChoice]);

  const handleTalkStart = useCallback(async () => {
    await startRecording();
  }, [startRecording]);

  const handleTalkEnd = useCallback(() => {
    stopRecording();
  }, [stopRecording]);

  const handleNextQuestion = useCallback(() => {
    nextQuestion();
  }, [nextQuestion]);

  const handleRepeatQuestion = useCallback(() => {
    repeatQuestion();
  }, [repeatQuestion]);

  const handleModeChange = useCallback((mode: typeof testMode) => {
    setTestMode(mode);
  }, [setTestMode]);

  // Effect to trigger AI scoring after recording completes in open-ended mode
  useEffect(() => {
    if (
      isOpenEndedMode &&
      recordingState === 'processing' &&
      openaiResult.status === 'completed' &&
      !isAIScoring &&
      !openEndedResult
    ) {
      const transcript = openaiResult.transcript.finalText ||
        openaiResult.transcript.committedText || '';
      if (transcript) {
        scoreOpenEndedResponse(transcript);
      }
    }
  }, [
    isOpenEndedMode,
    recordingState,
    openaiResult.status,
    openaiResult.transcript.finalText,
    openaiResult.transcript.committedText,
    isAIScoring,
    openEndedResult,
    scoreOpenEndedResponse,
  ]);

  // ---- Render Loading State ----
  if (!questionBank || !currentQuestion) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
        <div className="w-full max-w-lg">
          <h1 className="text-display-m font-bold text-slate-200 text-center mb-8">
            Radio Speech-To-Text Analyzer
          </h1>
          <BankLoader onBankLoaded={handleBankLoad} />
        </div>
      </div>
    );
  }

  // ---- Render Session Complete State ----
  if (sessionComplete && recordingState === 'completed') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
        <div className="w-full max-w-lg text-center">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-success/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-green-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-display-m font-bold text-slate-200 mb-2">
              Session Complete!
            </h1>
            <p className="text-body-l text-slate-400">
              You've completed all {progress.total} questions.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary px-8 py-3"
          >
            Start New Session
          </button>
        </div>
      </div>
    );
  }

  // ---- Main Application Render ----
  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 px-6 py-4">
        <div className="mx-auto max-w-7xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-heading-2 font-bold text-slate-200">
                Radio Speech-To-Text Analyzer
              </h1>
              <p className="text-body-s text-slate-400 mt-1">
                RSAF Ground Radio/Telephone Training
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-body-s text-slate-400">
                {questionBank.name}
              </span>
              <span className="rounded-button bg-slate-700 px-3 py-1 text-body-s font-medium text-cyan-light tabular-nums">
                {progress.current} / {progress.total}
              </span>
            </div>
          </div>
          {/* Test Mode Toggle */}
          <div className="flex justify-center">
            <TestModeToggle
              mode={testMode}
              onModeChange={handleModeChange}
              disabled={recordingState !== 'idle'}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Question + Choices / Open-Ended Panel */}
          <div className="lg:col-span-5 space-y-6">
            {isOpenEndedMode ? (
              /* Open-Ended Mode Content */
              <OpenEndedQuestionPanel
                question={currentQuestion}
                transcript={userTranscript}
              />
            ) : (
              /* Read Aloud Mode Content */
              <>
                {/* Question Panel */}
                <QuestionPanel
                  prompt={currentQuestion.prompt}
                  currentIndex={progress.current}
                  totalQuestions={progress.total}
                />

                {/* Expected Phrase (if available) */}
                {currentQuestion.expectedSpokenAnswer && (
                  <div className="rounded-card bg-slate-800 p-4 border border-slate-700">
                    <p className="text-caption uppercase tracking-wider text-slate-400 mb-2">
                      Expected Phrase
                    </p>
                    <p className="rt-phrase text-mono-m text-cyan-light">
                      "{currentQuestion.expectedSpokenAnswer}"
                    </p>
                  </div>
                )}

                {/* Choices Grid */}
                <div className="rounded-card bg-slate-800 p-5">
                  <h3 className="text-heading-3 font-semibold text-slate-200 mb-4">
                    Select Your Response
                  </h3>
                  <ChoicesGrid
                    options={currentQuestion.options as [string, string, string, string]}
                    selectedIndex={selectedChoiceIndex}
                    onSelect={handleChoiceSelect}
                    disabled={recordingState !== 'idle'}
                  />
                </div>

                {/* Correctness Indicator (after completed) */}
                {recordingState === 'completed' && correctnessResult !== null && (
                  <CorrectnessIndicator
                    isCorrect={correctnessResult}
                    correctOptionText={currentQuestion.options[currentQuestion.correctIndex]}
                    correctOptionLetter={OPTION_LETTERS[currentQuestion.correctIndex]}
                  />
                )}
              </>
            )}
          </div>

          {/* Center Column: Push-to-Talk Controls */}
          <div className="lg:col-span-2 flex items-start justify-center">
            <div className="sticky top-8 w-full">
              <PushToTalkControls
                onTalkStart={handleTalkStart}
                onTalkEnd={handleTalkEnd}
                isRecording={isRecording}
                durationMs={recordingDurationMs}
                disabled={!talkEnabled}
                providerStatus={{
                  openai: openaiResult.status,
                  elevenlabs: elevenlabsResult.status,
                }}
              />

              {/* STT/Pool Error Display */}
              {(sttError || poolError) && (
                <div className="mt-4 rounded-button bg-red-critical/10 border border-red-critical/30 p-3">
                  <p className="text-body-s text-red-light">{sttError || poolError}</p>
                </div>
              )}

              {/* Connection Pool Status */}
              {poolIsInitializing && recordingState === 'idle' && (
                <div className="mt-4 rounded-button bg-cyan-light/10 border border-cyan-light/30 p-3">
                  <p className="text-body-s text-cyan-light">Preparing connections...</p>
                </div>
              )}

              {/* Help Text */}
              <div className="mt-4 text-center">
                <p className="text-caption text-slate-500">
                  {poolIsInitializing && recordingState === 'idle' ? (
                    // Connection pool initializing
                    'Connecting to speech services...'
                  ) : isOpenEndedMode ? (
                    // Open-ended mode help text
                    recordingState === 'idle'
                      ? 'Press Talk to respond'
                      : recordingState === 'listening'
                      ? 'Speak your response, then press End'
                      : recordingState === 'processing' || isAIScoring
                      ? 'Analyzing your response...'
                      : 'Response evaluated'
                  ) : (
                    // Read-aloud mode help text
                    !talkEnabled && recordingState === 'idle'
                      ? 'Select a choice to enable recording'
                      : recordingState === 'idle'
                      ? 'Press Talk to start recording'
                      : recordingState === 'listening'
                      ? 'Speak clearly, then press End'
                      : recordingState === 'processing'
                      ? 'Processing your response...'
                      : 'Recording complete'
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Provider Panels / AI Scoring Results */}
          <div className="lg:col-span-5 space-y-6">
            {isOpenEndedMode ? (
              /* Open-Ended Mode: AI Scoring Results */
              <>
                {/* AI Scoring Header */}
                <div className="flex items-center justify-between">
                  <h2 className="text-heading-3 font-semibold text-slate-200">
                    AI Evaluation
                  </h2>
                  {(isAIScoring || openEndedResult) && (
                    <span className="text-caption text-slate-400">
                      {isAIScoring ? 'Scoring...' : 'Results ready'}
                    </span>
                  )}
                </div>

                {/* AI Scoring Result Panel */}
                {(isAIScoring || openEndedResult) && (
                  <OpenEndedResultPanel
                    result={openEndedResult || {
                      accuracy: 0,
                      fluency: 0,
                      structure: 0,
                      overall: 0,
                      feedback: '',
                      fillerWords: [],
                      fillerCount: 0,
                    }}
                  />
                )}

                {/* Show transcription while processing */}
                {recordingState !== 'idle' && !openEndedResult && (
                  <div className="rounded-card bg-slate-800 p-5 border border-slate-700">
                    <h3 className="text-caption uppercase tracking-wider text-slate-400 mb-3">
                      Live Transcription
                    </h3>
                    <p className="text-body-m text-slate-300 font-mono">
                      {openaiResult.transcript.interimText ||
                        openaiResult.transcript.committedText ||
                        (isRecording ? 'Listening...' : 'Waiting for speech...')}
                    </p>
                  </div>
                )}

                {/* Navigation Buttons */}
                {recordingState === 'completed' && openEndedResult && (
                  <div className="flex justify-end gap-3 pt-4">
                    <RepeatQuestionButton
                      onClick={handleRepeatQuestion}
                    />
                    <NextQuestionButton
                      onClick={handleNextQuestion}
                      disabled={!nextEnabled && !sessionComplete}
                      isLastQuestion={isLastQuestion}
                    />
                  </div>
                )}
              </>
            ) : (
              /* Read Aloud Mode: Provider Comparison */
              <>
                {/* Provider Comparison Header */}
                <div className="flex items-center justify-between">
                  <h2 className="text-heading-3 font-semibold text-slate-200">
                    STT Comparison
                  </h2>
                  {recordingState === 'completed' && (
                    <span className="text-caption text-slate-400">
                      Side-by-side results
                    </span>
                  )}
                </div>

                {/* OpenAI Panel */}
                <ProviderPanel
                  providerId="openai"
                  result={openaiResult}
                  isRecording={isRecording}
                />

                {/* ElevenLabs Panel */}
                <ProviderPanel
                  providerId="elevenlabs"
                  result={elevenlabsResult}
                  isRecording={isRecording}
                />

                {/* Navigation Buttons */}
                {recordingState === 'completed' && (
                  <div className="flex justify-end gap-3 pt-4">
                    <RepeatQuestionButton
                      onClick={handleRepeatQuestion}
                    />
                    <NextQuestionButton
                      onClick={handleNextQuestion}
                      disabled={!nextEnabled && !sessionComplete}
                      isLastQuestion={isLastQuestion}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-700 bg-slate-800/50 px-6 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between text-caption text-slate-500">
          <span>RSTA v1.0.0 - Radio Speech-To-Text Analyzer</span>
          <div className="flex items-center gap-4">
            <a
              href="/StyleGuides/preview.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-light hover:text-cyan-DEFAULT transition-colors underline underline-offset-2"
            >
              Style Guide
            </a>
            <span>MAGES STUDIO</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
