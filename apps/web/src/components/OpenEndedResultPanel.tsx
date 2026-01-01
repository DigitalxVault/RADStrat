/**
 * OpenEndedResultPanel Component
 *
 * Displays the AI-generated scoring results for open-ended responses.
 * Shows score breakdown (accuracy, fluency, structure), overall score,
 * AI feedback, and radio protocol notes.
 */

import type { OpenAIScoreResult } from "@rsta/shared";
import { useIsAIScoring } from "../state/sessionStore";
import "./OpenEndedResultPanel.css";

interface OpenEndedResultPanelProps {
  /** AI scoring result */
  result: OpenAIScoreResult;
}

export function OpenEndedResultPanel({ result }: OpenEndedResultPanelProps) {
  const isAIScoring = useIsAIScoring();

  if (isAIScoring) {
    return (
      <div className="oer-panel oer-panel--loading">
        <div className="oer-loading">
          <div className="oer-loading-spinner" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20" />
            </svg>
          </div>
          <span className="oer-loading-text">Analyzing response...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="oer-panel">
      {/* Overall score - prominent display */}
      <div className="oer-overall">
        <div className="oer-overall-score-container">
          <div
            className={`oer-overall-score ${getScoreClass(result.overall)}`}
            role="meter"
            aria-valuenow={result.overall}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Overall score: ${result.overall} out of 100`}
          >
            <span className="oer-score-value">{result.overall}</span>
            <span className="oer-score-max">/100</span>
          </div>
          <span className="oer-overall-label">OVERALL SCORE</span>
        </div>
        <div className="oer-overall-ring" aria-hidden="true">
          <svg viewBox="0 0 120 120">
            <circle
              className="oer-ring-bg"
              cx="60"
              cy="60"
              r="52"
              fill="none"
              strokeWidth="8"
            />
            <circle
              className={`oer-ring-progress ${getScoreClass(result.overall)}`}
              cx="60"
              cy="60"
              r="52"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              style={{
                strokeDasharray: `${(result.overall / 100) * 327} 327`,
                transform: "rotate(-90deg)",
                transformOrigin: "center",
              }}
            />
          </svg>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="oer-breakdown">
        <h3 className="oer-section-title">SCORE BREAKDOWN</h3>
        <div className="oer-metrics">
          <ScoreMetric
            label="Accuracy"
            sublabel="Content Match"
            score={result.accuracy}
            weight={50}
          />
          <ScoreMetric
            label="Fluency"
            sublabel="Speech Quality"
            score={result.fluency}
            weight={30}
          />
          <ScoreMetric
            label="Structure"
            sublabel="Radio Protocol"
            score={result.structure}
            weight={20}
          />
        </div>
      </div>

      {/* AI Feedback */}
      {result.feedback && (
        <div className="oer-feedback">
          <h3 className="oer-section-title">
            <span className="oer-title-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </span>
            AI FEEDBACK
          </h3>
          <p className="oer-feedback-text">{result.feedback}</p>
        </div>
      )}

      {/* Radio Protocol Notes */}
      {result.radioProtocolNotes && (
        <div className="oer-protocol-notes">
          <h3 className="oer-section-title">
            <span className="oer-title-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
                <line x1="12" y1="19" x2="12" y2="22" />
              </svg>
            </span>
            RADIO PROTOCOL NOTES
          </h3>
          <p className="oer-protocol-text">{result.radioProtocolNotes}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Individual score metric display
 */
interface ScoreMetricProps {
  label: string;
  sublabel: string;
  score: number;
  weight: number;
}

function ScoreMetric({ label, sublabel, score, weight }: ScoreMetricProps) {
  return (
    <div className="oer-metric">
      <div className="oer-metric-header">
        <span className="oer-metric-label">{label}</span>
        <span className="oer-metric-weight">{weight}%</span>
      </div>
      <span className="oer-metric-sublabel">{sublabel}</span>
      <div className="oer-metric-bar">
        <div
          className={`oer-metric-fill ${getScoreClass(score)}`}
          style={{ width: `${score}%` }}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label}: ${score} out of 100`}
        />
      </div>
      <span className={`oer-metric-score ${getScoreClass(score)}`}>
        {score}
      </span>
    </div>
  );
}

/**
 * Get CSS class based on score value
 */
function getScoreClass(score: number): string {
  if (score >= 80) return "oer-score--excellent";
  if (score >= 60) return "oer-score--good";
  if (score >= 40) return "oer-score--fair";
  return "oer-score--poor";
}

export default OpenEndedResultPanel;
