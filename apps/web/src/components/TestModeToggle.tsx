/**
 * TestModeToggle Component
 *
 * A segmented control for switching between "Read Aloud Test" and "Open-Ended Test" modes.
 * Styled with a tactical/aviation-inspired aesthetic reminiscent of cockpit switches.
 */

import type { TestMode } from "@rsta/shared";
import { useCallback, useRef, KeyboardEvent } from "react";
import "./TestModeToggle.css";

interface TestModeToggleProps {
  /** Current test mode */
  mode: TestMode;
  /** Callback when mode changes */
  onModeChange: (mode: TestMode) => void;
  /** Whether the toggle is disabled */
  disabled?: boolean;
}

export function TestModeToggle({
  mode,
  onModeChange,
  disabled = false,
}: TestModeToggleProps) {
  const readAloudRef = useRef<HTMLButtonElement>(null);
  const openEndedRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>, currentMode: TestMode) => {
      if (disabled) return;

      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        const newMode = currentMode === "read-aloud" ? "open-ended" : "read-aloud";
        onModeChange(newMode);

        // Focus the newly selected button
        if (newMode === "read-aloud") {
          readAloudRef.current?.focus();
        } else {
          openEndedRef.current?.focus();
        }
      }
    },
    [disabled, onModeChange]
  );

  return (
    <div
      className="test-mode-toggle"
      role="tablist"
      aria-label="Test Mode Selection"
    >
      {/* Background glow effect */}
      <div className="toggle-glow" aria-hidden="true" />

      {/* Slider indicator */}
      <div
        className={`toggle-slider ${mode === "open-ended" ? "toggle-slider--right" : ""}`}
        aria-hidden="true"
      />

      <button
        ref={readAloudRef}
        type="button"
        role="tab"
        id="tab-read-aloud"
        aria-selected={mode === "read-aloud"}
        aria-controls="panel-read-aloud"
        tabIndex={mode === "read-aloud" ? 0 : -1}
        className={`toggle-option ${mode === "read-aloud" ? "toggle-option--active" : ""}`}
        onClick={() => !disabled && onModeChange("read-aloud")}
        onKeyDown={(e) => handleKeyDown(e, "read-aloud")}
        disabled={disabled}
      >
        <span className="toggle-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
            <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
            <line x1="12" y1="19" x2="12" y2="22" />
            <line x1="8" y1="22" x2="16" y2="22" />
          </svg>
        </span>
        <span className="toggle-label">Read Aloud</span>
        <span className="toggle-sublabel">MCQ Response</span>
      </button>

      <button
        ref={openEndedRef}
        type="button"
        role="tab"
        id="tab-open-ended"
        aria-selected={mode === "open-ended"}
        aria-controls="panel-open-ended"
        tabIndex={mode === "open-ended" ? 0 : -1}
        className={`toggle-option ${mode === "open-ended" ? "toggle-option--active" : ""}`}
        onClick={() => !disabled && onModeChange("open-ended")}
        onKeyDown={(e) => handleKeyDown(e, "open-ended")}
        disabled={disabled}
      >
        <span className="toggle-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <line x1="9" y1="9" x2="15" y2="9" />
            <line x1="9" y1="13" x2="13" y2="13" />
          </svg>
        </span>
        <span className="toggle-label">Open-Ended</span>
        <span className="toggle-sublabel">Free Response</span>
      </button>
    </div>
  );
}

export default TestModeToggle;
