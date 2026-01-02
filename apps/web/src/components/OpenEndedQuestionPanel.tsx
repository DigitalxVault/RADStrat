/**
 * OpenEndedQuestionPanel Component
 *
 * Displays the scenario prompt for open-ended test mode.
 * Shows the scenario without MCQ choices - user responds freely.
 * After recording, reveals the expected answer for comparison.
 */

import type { Question } from "@rsta/shared";
import { useRecordingState, useOpenEndedResult } from "../state/sessionStore";
import "./OpenEndedQuestionPanel.css";

interface OpenEndedQuestionPanelProps {
  /** Current question */
  question: Question;
  /** User's spoken transcript (shown after recording) */
  transcript?: string;
}

export function OpenEndedQuestionPanel({
  question,
  transcript,
}: OpenEndedQuestionPanelProps) {
  const recordingState = useRecordingState();
  const openEndedResult = useOpenEndedResult();

  const isCompleted = recordingState === "completed";
  const hasTranscript = transcript && transcript.trim().length > 0;

  return (
    <div className="open-ended-panel">
      {/* Header badge */}
      <div className="oep-header">
        <span className="oep-badge">
          <span className="oep-badge-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </span>
          Open-Ended Response
        </span>
        <span className="oep-structure-mode">
          {formatStructureMode(question.structureMode)}
        </span>
      </div>

      {/* Scenario prompt */}
      <div className="oep-scenario">
        <h2 className="oep-scenario-label">SCENARIO</h2>
        <p className="oep-scenario-text">{question.prompt}</p>
      </div>

      {/* Instruction */}
      {!isCompleted && (
        <div className="oep-instruction">
          <span className="oep-instruction-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </span>
          <span className="oep-instruction-text">
            Press the talk button and respond as you would on the radio.
            Speak clearly and follow proper radio protocol.
          </span>
        </div>
      )}

      {/* Results section - shown after recording */}
      {isCompleted && (
        <div className="oep-results">
          {/* User's response */}
          <div className="oep-response-section">
            <h3 className="oep-section-label">
              <span className="oep-label-icon oep-label-icon--user" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              YOUR RESPONSE
            </h3>
            <div className="oep-response-box oep-response-box--user">
              {hasTranscript ? (
                <p className="oep-response-text">{transcript}</p>
              ) : (
                <p className="oep-response-empty">No speech detected</p>
              )}
            </div>
          </div>

          {/* Expected response */}
          <div className="oep-response-section">
            <h3 className="oep-section-label">
              <span className="oep-label-icon oep-label-icon--expected" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </span>
              EXPECTED RESPONSE
            </h3>
            <div className="oep-response-box oep-response-box--expected">
              <p className="oep-response-text">{question.expectedSpokenAnswer}</p>
            </div>
          </div>

          {/* Filler words count (from AI result) */}
          {openEndedResult && (
            <div className="oep-filler-section">
              <div className="oep-filler-count">
                <span className="oep-filler-number">
                  {openEndedResult.fillerCount}
                </span>
                <span className="oep-filler-label">Filler Words</span>
              </div>
              {openEndedResult.fillerWords.length > 0 && (
                <div className="oep-filler-list">
                  {openEndedResult.fillerWords.map((word, index) => (
                    <span key={`${word}-${index}`} className="oep-filler-tag">
                      {word}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Format structure mode for display
 */
function formatStructureMode(mode: string): string {
  switch (mode) {
    case "full":
      return "Full Transmission";
    case "ack_short":
      return "Short Acknowledgment";
    case "clarify_request":
      return "Clarification Request";
    default:
      return mode;
  }
}

export default OpenEndedQuestionPanel;
