/**
 * RepeatQuestionButton Component
 *
 * Button to repeat the current question for practice improvement.
 * Resets recording state but keeps the same question and selected choice.
 */

import clsx from "clsx";

export interface RepeatQuestionButtonProps {
  /** Callback when button is clicked */
  onClick: () => void;
  /** Whether button is disabled */
  disabled?: boolean;
  /** Optional additional CSS classes */
  className?: string;
}

export function RepeatQuestionButton({
  onClick,
  disabled = false,
  className,
}: RepeatQuestionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        // Base button styling
        "flex items-center justify-center gap-2 rounded-card px-6 py-3",
        "text-body-m font-semibold transition-all duration-state",
        // Focus state
        "focus:outline-none focus:ring-2 focus:ring-amber-warning focus:ring-offset-2 focus:ring-offset-slate-900",
        {
          // Enabled state - Secondary button (Amber/Orange)
          "bg-amber-warning text-slate-900 hover:bg-amber-400 active:opacity-90":
            !disabled,
          // Hover scale
          "hover:scale-[1.02]": !disabled,
          // Disabled state
          "cursor-not-allowed bg-slate-600 text-slate-400": disabled,
        },
        className
      )}
    >
      {/* Repeat/Refresh icon */}
      <svg
        className={clsx("h-5 w-5", disabled && "opacity-50")}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
      <span>Repeat Question</span>
    </button>
  );
}

export default RepeatQuestionButton;
