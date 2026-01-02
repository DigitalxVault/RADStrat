/**
 * ScoreBreakdown Component
 *
 * Displays scoring metrics (Accuracy, Fluency, Structure, Overall) with progress bars
 * and expandable breakdown details.
 *
 * Scoring Model:
 * - Accuracy (50%): Pure text similarity - did they say the right words?
 * - Fluency (30%): Clean speech - no filler words like "um", "uh", "like"
 * - Structure (20%): Radio protocol adherence
 */

import { useState } from "react";
import clsx from "clsx";
import type { ScoringBreakdown } from "@rsta/shared";

export interface ScoreBreakdownProps {
  /** Accuracy score (0-100) - text similarity */
  accuracy: number;
  /** Fluency score (0-100) - clean speech without fillers */
  fluency: number;
  /** Structure score (0-100) - radio protocol adherence */
  structure: number;
  /** Overall score (0-100) - weighted combination */
  overall: number;
  /** Detailed breakdown data (optional) */
  breakdown?: ScoringBreakdown;
  /** Compact mode (less padding, no expandable) */
  compact?: boolean;
  /** Optional additional CSS classes */
  className?: string;
}

function getScoreColor(score: number): string {
  if (score >= 90) return "bg-green-success";
  if (score >= 70) return "bg-cyan-info";
  if (score >= 40) return "bg-amber-warning";
  return "bg-red-critical";
}

function getScoreTextColor(score: number): string {
  if (score >= 90) return "text-green-light";
  if (score >= 70) return "text-cyan-light";
  if (score >= 40) return "text-amber-light";
  return "text-red-light";
}

interface ScoreRowProps {
  label: string;
  score: number;
  weight?: string;
}

function ScoreRow({ label, score, weight }: ScoreRowProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 text-body-s text-slate-400">
        {label}
        {weight && <span className="text-slate-500 ml-1">({weight})</span>}
      </span>
      <div className="flex-1 h-2 rounded-full bg-slate-700 overflow-hidden">
        <div
          className={clsx(
            "h-full rounded-full transition-all duration-screen ease-out",
            getScoreColor(score)
          )}
          style={{ width: `${score}%` }}
        />
      </div>
      <span
        className={clsx(
          "w-12 text-right text-body-s font-medium tabular-nums",
          getScoreTextColor(score)
        )}
      >
        {Math.round(score)}%
      </span>
    </div>
  );
}

export function ScoreBreakdown({
  accuracy,
  fluency,
  structure,
  overall,
  breakdown,
  compact = false,
  className,
}: ScoreBreakdownProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={clsx(
        "rounded-button bg-slate-700",
        compact ? "p-3" : "p-4",
        className
      )}
    >
      {/* Header */}
      {!compact && (
        <>
          <h4 className="mb-3 text-caption font-medium uppercase tracking-wide text-slate-400">
            Quality Matrix
          </h4>
          <div className="mb-3 h-px bg-slate-600" />
        </>
      )}

      {/* Score Rows */}
      <div className={clsx("space-y-2", compact ? "space-y-1.5" : "space-y-2")}>
        <ScoreRow label="Accuracy" score={accuracy} weight="50%" />
        <ScoreRow label="Fluency" score={fluency} weight="30%" />
        <ScoreRow label="Structure" score={structure} weight="20%" />
      </div>

      {/* Divider before overall */}
      <div className={clsx("h-px bg-slate-600", compact ? "my-2" : "my-3")} />

      {/* Overall Score */}
      <div className="flex items-center gap-3">
        <span className="w-24 text-body-s font-semibold text-slate-200">Overall</span>
        <div className="flex-1 h-3 rounded-full bg-slate-600 overflow-hidden">
          <div
            className={clsx(
              "h-full rounded-full transition-all duration-screen ease-out",
              getScoreColor(overall)
            )}
            style={{ width: `${overall}%` }}
          />
        </div>
        <span
          className={clsx(
            "w-12 text-right text-body-m font-bold tabular-nums",
            getScoreTextColor(overall)
          )}
        >
          {Math.round(overall)}%
        </span>
      </div>

      {/* Expandable Details (non-compact mode with breakdown data) */}
      {!compact && breakdown && (
        <>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={clsx(
              "mt-3 flex w-full items-center justify-center gap-2",
              "rounded-button py-2 text-body-s text-slate-400",
              "hover:bg-slate-600 hover:text-slate-200",
              "transition-colors duration-state"
            )}
          >
            <span>{isExpanded ? "Hide Details" : "Show Details"}</span>
            <svg
              className={clsx(
                "h-4 w-4 transition-transform duration-state",
                isExpanded && "rotate-180"
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {isExpanded && (
            <div className="mt-3 space-y-4 border-t border-slate-600 pt-3">
              {/* Accuracy Breakdown */}
              <div>
                <h5 className="mb-2 text-caption font-medium uppercase tracking-wide text-slate-400">
                  Accuracy Details
                </h5>
                <div className="space-y-1 text-body-s">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Text Similarity</span>
                    <span className="text-slate-200 tabular-nums">
                      {Math.round(breakdown.accuracy.similarityScore * 100)}%
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="text-slate-400 text-caption">Your text:</span>
                    <p className="mt-1 text-slate-300 text-body-s italic">
                      "{breakdown.accuracy.normalizedTranscript || "(empty)"}"
                    </p>
                  </div>
                  <div className="mt-2">
                    <span className="text-slate-400 text-caption">Expected:</span>
                    <p className="mt-1 text-slate-300 text-body-s italic">
                      "{breakdown.accuracy.normalizedExpected || "(empty)"}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Fluency Breakdown */}
              <div>
                <h5 className="mb-2 text-caption font-medium uppercase tracking-wide text-slate-400">
                  Fluency Details
                </h5>
                <div className="space-y-1 text-body-s">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Filler Words Detected</span>
                    <span className={clsx(
                      "tabular-nums",
                      breakdown.fluency.totalFillers > 0 ? "text-amber-light" : "text-green-light"
                    )}>
                      {breakdown.fluency.totalFillers}
                    </span>
                  </div>
                  {breakdown.fluency.totalFillers > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Penalty Applied</span>
                        <span className="text-red-light tabular-nums">
                          -{breakdown.fluency.fillerPenalty} points
                        </span>
                      </div>
                      <div className="mt-2">
                        <span className="text-slate-400">Fillers Found:</span>
                        <ul className="mt-1 list-inside list-disc text-amber-light">
                          {breakdown.fluency.fillers.map((f, i) => (
                            <li key={i}>
                              "{f.word}" × {f.count}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                  {breakdown.fluency.totalFillers === 0 && (
                    <div className="text-green-light">
                      No filler words detected - clean speech!
                    </div>
                  )}
                </div>
              </div>

              {/* Structure Breakdown */}
              <div>
                <h5 className="mb-2 text-caption font-medium uppercase tracking-wide text-slate-400">
                  Structure Details
                </h5>
                <div className="space-y-1 text-body-s">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mode</span>
                    <span className="text-slate-200 capitalize">
                      {breakdown.structure.mode.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Receiver Present</span>
                    <span
                      className={
                        breakdown.structure.receiverPresent
                          ? "text-green-light"
                          : "text-red-light"
                      }
                    >
                      {breakdown.structure.receiverPresent ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sender Present</span>
                    <span
                      className={
                        breakdown.structure.senderPresent
                          ? "text-green-light"
                          : "text-red-light"
                      }
                    >
                      {breakdown.structure.senderPresent ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Order Correct</span>
                    <span
                      className={
                        breakdown.structure.orderCorrect
                          ? "text-green-light"
                          : "text-red-light"
                      }
                    >
                      {breakdown.structure.orderCorrect ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Closing Phrase</span>
                    <span
                      className={
                        breakdown.structure.closingPresent
                          ? "text-green-light"
                          : "text-amber-light"
                      }
                    >
                      {breakdown.structure.closingType !== "none"
                        ? `"${breakdown.structure.closingType}"`
                        : "None"}
                    </span>
                  </div>
                  {breakdown.structure.violations.length > 0 && (
                    <div className="mt-2">
                      <span className="text-slate-400">Violations:</span>
                      <ul className="mt-1 list-inside list-disc text-amber-light">
                        {breakdown.structure.violations.map((v, i) => (
                          <li key={i}>{v}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ScoreBreakdown;
