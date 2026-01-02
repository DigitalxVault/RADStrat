# Prompts Directory

This directory contains markdown files that control AI model behavior for the R/T Trainer application. Edit these files to adjust scoring criteria, leniency rules, and evaluation behavior without modifying the codebase.

## Files

### `scoring.md`
Controls how the AI evaluates trainee radio communications.

**Sections**:
- **Scoring Dimensions**: Accuracy (50%), Fluency (30%), Structure (20%) definitions
- **Leniency Rules**: STT formatting tolerance (digit/word equivalence, punctuation, etc.)
- **Output Format**: JSON schema for evaluation results
- **Feedback Guidelines**: How to provide constructive feedback
- **Example Evaluations**: Reference cases for consistent scoring

**When to edit**:
- Adjust scoring weights or criteria
- Add new leniency rules for STT variations
- Update filler word list
- Modify feedback tone or content

### `scenarios.md` (Future)
Will contain scenario-specific prompts for different training contexts.

### `feedback-templates.md` (Future)
Will contain reusable feedback phrases and improvement suggestions.

---

## How Prompts Are Loaded

The `promptLoader.ts` utility reads these markdown files at runtime and injects them into API calls. This allows:

1. **No code changes** for prompt updates
2. **Version control** of prompt changes via Git
3. **Easy A/B testing** of different prompt strategies
4. **Clear separation** between logic and content

---

## Best Practices

1. **Keep examples up to date**: When adding leniency rules, add corresponding examples
2. **Test edge cases**: After editing, test with known transcript variations
3. **Document changes**: Use Git commit messages to explain why prompts changed
4. **Backup before major changes**: Copy the file before significant edits

---

## Leniency Quick Reference

| Variation Type | Example | Treatment |
|---------------|---------|-----------|
| Digit vs. word | "27" / "two seven" | Equivalent |
| Callsign number | "Bowser 1" / "Bowser One" | Equivalent |
| Punctuation | "ATC," / "ATC" | Equivalent |
| Case | "atc" / "ATC" | Equivalent |
| Hyphenation | "seven-zero" / "seven zero" | Equivalent |
| Wrong number | "27" / "25" | PENALIZE |
| Wrong callsign | "Bowser One" / "Bowser Two" | PENALIZE |
| Missing element | no "hold short" | PENALIZE |
