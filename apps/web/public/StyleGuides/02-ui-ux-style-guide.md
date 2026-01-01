# GenAI R/T Trainer - UI/UX Style Guide

> **Version**: 1.0
> **Last Updated**: December 2024
> **Project**: RSAF Ground R/T Training Simulator

---

## 1. Design Philosophy

### 1.1 Core UX Principles

| Principle | Description |
|-----------|-------------|
| **Task-Focused** | Every screen serves a single primary objective |
| **Progressive Disclosure** | Complexity revealed only when needed |
| **Immediate Feedback** | Every action has visible response within 100ms |
| **Error Prevention** | Design prevents errors before correction is needed |
| **Recovery Support** | Clear paths to retry, undo, or get help |

### 1.2 Training-Specific Principles

1. **Scaffolded Learning** - Start guided, progressively reduce assistance
2. **Safe Failure** - Wrong answers are learning opportunities, not punishments
3. **Spaced Repetition** - System tracks and resurfaces weak areas
4. **Contextual Help** - Hints available but not intrusive
5. **Performance Visibility** - Clear progress indicators at all times

---

## 2. Screen Architecture

### 2.1 Screen Inventory

```
SCREEN HIERARCHY
├── SPLASH_SCREEN
│   └── Auto-transition to Training Hub
├── TRAINING_HUB_SCREEN
│   ├── Mode Selection
│   ├── Role Selection
│   ├── Scenario Selection
│   └── Progress Dashboard
├── QUIZ_SCREEN (Mode 1: Theory MCQ)
│   └── Question → Answer → Feedback loop
├── VOICE_MCQ_SCREEN (Mode 2: Voice MCQ)
│   └── Question → Voice Input → Evaluation loop
├── SCENARIO_SCREEN (Mode 3: Scenario Awareness)
│   └── Briefing → Simulation → Debrief flow
├── DEBRIEF_SCREEN
│   └── Performance summary and recommendations
├── SETTINGS_SCREEN
│   └── Audio, Voice, Accessibility options
└── HELP_SCREEN
    └── R/T Reference, Tutorials
```

### 2.2 Screen Flow Diagram

```
                    ┌─────────────────┐
                    │  SPLASH_SCREEN  │
                    └────────┬────────┘
                             │ (auto 2s)
                             ▼
                    ┌─────────────────┐
            ┌──────►│ TRAINING_HUB    │◄──────┐
            │       │    SCREEN       │       │
            │       └────────┬────────┘       │
            │                │                │
            │    ┌───────────┼───────────┐    │
            │    ▼           ▼           ▼    │
        ┌───┴────┐    ┌──────────┐   ┌───┴───┐
        │ QUIZ   │    │ VOICE    │   │SCENARIO│
        │ SCREEN │    │ MCQ      │   │ SCREEN │
        └───┬────┘    │ SCREEN   │   └───┬───┘
            │         └────┬─────┘       │
            │              │             │
            └──────────────┼─────────────┘
                           ▼
                    ┌─────────────────┐
                    │ DEBRIEF_SCREEN  │
                    └────────┬────────┘
                             │
                             ▼
                    (Return to Hub)
```

---

## 3. Screen Specifications

### 3.1 TRAINING_HUB_SCREEN

**Purpose**: Central navigation and progress dashboard

**Layout Type**: Dashboard with sidebar navigation

```
┌──────────────────────────────────────────────────────────────────┐
│ [Logo] GenAI R/T Trainer          [User] SGT Tan  [⚙️] Settings  │  ← Top Bar (64px)
├────────────┬─────────────────────────────────────────────────────┤
│            │                                                     │
│  MODES     │   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │
│  --------  │   │   THEORY    │ │  VOICE MCQ  │ │  SCENARIO   │  │
│  ○ Theory  │   │    MCQ      │ │             │ │  AWARENESS  │  │
│  ○ Voice   │   │  [icon]     │ │  [icon]     │ │  [icon]     │  │
│  ○ Scenario│   │  32 Qs      │ │  24 Qs      │ │  8 Scenes   │  │
│            │   │  ████░░ 75% │ │  ██░░░░ 40% │ │  █░░░░░ 20% │  │
│  ROLES     │   └─────────────┘ └─────────────┘ └─────────────┘  │
│  --------  │                                                     │
│  ○ Bowser  │   ┌─────────────────────────────────────────────┐  │
│  ○ Security│   │  CONTINUE TRAINING                          │  │
│  ○ AFE     │   │  ──────────────────────────────────────     │  │
│  ○ Fire    │   │  Last: Voice MCQ - Runway Crossing          │  │
│  ○ Contract│   │  Score: 85% | Time: 12:34                   │  │
│            │   │                           [Continue →]       │  │
│  PROGRESS  │   └─────────────────────────────────────────────┘  │
│  --------  │                                                     │
│  [View All]│   ┌──────────────────┐  ┌──────────────────────┐   │
│            │   │ DAILY GOAL       │  │ RECOMMENDATIONS      │   │
│  HELP      │   │ ████████░░ 80%   │  │ • Practice: Holdshort│   │
│  --------  │   │ 8/10 exercises   │  │ • Review: Callsigns  │   │
│  [?] Guide │   └──────────────────┘  └──────────────────────┘   │
│            │                                                     │
└────────────┴─────────────────────────────────────────────────────┘
     160px                        Remaining Width
```

**Regions**:
| Region | Width | Content |
|--------|-------|---------|
| Top Bar | 100%, 64px height | Logo, Title, User Profile, Settings |
| Left Nav | 160px fixed | Mode/Role/Scenario selection, Progress link |
| Main Area | Fluid | Mode cards, Continue panel, Recommendations |

**Interactions**:
- Mode cards: Click to enter mode → shows role selection if needed
- Continue button: Resumes last incomplete session
- Left nav items: Filter main content by selection

---

### 3.2 QUIZ_SCREEN (Theory MCQ)

**Purpose**: Test recognition of correct R/T phraseology

**Layout Type**: Centered single-column

```
┌──────────────────────────────────────────────────────────────────┐
│ [←] Back    Theory MCQ: Runway Crossing         Q 5/10  [?] Hint │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│                    ┌────────────────────────────┐                │
│                    │  QUESTION                  │                │
│                    │  ═══════════════════       │                │
│                    │  [🔊 icon]                 │                │
│                    │                            │                │
│                    │  Ground Controller says:   │                │
│                    │  "Hotel 70, hold position. │                │
│                    │   Standby."                │                │
│                    │                            │                │
│                    │  What is the correct       │                │
│                    │  response?                 │                │
│                    │                            │                │
│                    └────────────────────────────┘                │
│                                                                  │
│                    ┌────────────────────────────┐                │
│                    │ A │ Hotel 70, roger,       │ ←── Option    │
│                    │   │ holding position.      │                │
│                    └────────────────────────────┘                │
│                    ┌────────────────────────────┐                │
│                    │ B │ Copy, I'm going        │                │
│                    │   │ anyway.                │                │
│                    └────────────────────────────┘                │
│                    ┌────────────────────────────┐                │
│                    │ C │ Say again?             │                │
│                    └────────────────────────────┘                │
│                    ┌────────────────────────────┐                │
│                    │ D │ Unable to comply,      │                │
│                    │   │ standing by.           │                │
│                    └────────────────────────────┘                │
│                                                                  │
│                    ████████░░░░░░░░░░  Progress: 5/10            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**States**:
| State | Visual Change |
|-------|---------------|
| Default | All options neutral (Slate-700 bg) |
| Hover | Option bg → Slate-600 |
| Selected | Option border → Cyan-Info, awaiting confirm |
| Correct | Selected option → Green bg + checkmark |
| Incorrect | Selected → Red bg + X, Correct → Green highlight |

**Feedback Flow**:
1. User selects option → 200ms delay → Show result
2. Correct: Green flash, "+1" animation, auto-advance (1.5s)
3. Incorrect: Red shake, show correct answer, "Next" button appears

---

### 3.3 VOICE_MCQ_SCREEN

**Purpose**: Train exact spoken R/T phrasing

**Layout Type**: Two-column split

```
┌──────────────────────────────────────────────────────────────────┐
│ [←] Back    Voice MCQ: Taxi Clearance          Q 3/8   [?] Help  │
├────────────────────────────────┬─────────────────────────────────┤
│                                │                                 │
│  QUESTION                      │  VOICE INPUT                    │
│  ═══════════════════           │  ════════════                   │
│                                │                                 │
│  [🔊] Play Audio               │       ┌─────────────────┐       │
│                                │       │                 │       │
│  Ground Controller says:       │       │    🎤           │       │
│  "Hotel 70, taxi via Alpha,    │       │   [MIC]         │       │
│   hold short Runway 02."       │       │                 │       │
│                                │       │  Tap to Speak   │       │
│  Select the correct response   │       └─────────────────┘       │
│  and SPEAK it exactly:         │                                 │
│                                │  ┌─────────────────────────┐    │
│  ┌──────────────────────────┐  │  │ LIVE TRANSCRIPT         │    │
│  │ A │ Hotel 70, taxi via   │  │  │ ─────────────────────── │    │
│  │   │ Alpha, hold short    │  │  │                         │    │
│  │   │ Runway 02.           │  │  │ "Hotel 70, taxi via..." │    │
│  └──────────────────────────┘  │  │                         │    │
│  ┌──────────────────────────┐  │  │ [Listening...]          │    │
│  │ B │ Copy, taxiing.       │  │  └─────────────────────────┘    │
│  └──────────────────────────┘  │                                 │
│  ┌──────────────────────────┐  │  ┌─────────────────────────┐    │
│  │ C │ Roger, Alpha to 02.  │  │  │ QUALITY MATRIX          │    │
│  └──────────────────────────┘  │  │ Clarity    ████░░░░ 60% │    │
│  ┌──────────────────────────┐  │  │ Pace       █████░░░ 70% │    │
│  │ D │ Unable, standing by. │  │  │ Structure  ██████░░ 80% │    │
│  └──────────────────────────┘  │  │ Callsign   ████████ 100%│    │
│                                │  └─────────────────────────┘    │
│                                │                                 │
│                                │  [🔄 Retry]      [Next →]       │
│                                │                                 │
└────────────────────────────────┴─────────────────────────────────┘
        50% Width                         50% Width
```

**Mic Button States**:
| State | Visual | Animation |
|-------|--------|-----------|
| `idle` | Gray outline, mic icon | None |
| `listening` | Cyan fill, pulsing glow | Scale pulse 1.0 → 1.1 |
| `processing` | Cyan fill, spinner | Rotation |
| `success` | Green fill, checkmark | Pop + glow |
| `fail` | Red fill, X icon | Shake |

**Voice Evaluation Flow**:
1. User taps mic → `listening` state
2. Speech detected → Live transcript updates
3. Silence (2s) or tap again → `processing` state
4. AI evaluates → Display Quality Matrix scores
5. Match threshold met → `success`, auto-advance
6. Below threshold → `fail`, show expected answer, offer retry

---

### 3.4 SCENARIO_SCREEN

**Purpose**: Real-time R/T practice in simulated context

**Layout Type**: HUD overlay on 3D simulation

```
┌──────────────────────────────────────────────────────────────────┐
│ ┌────────────────┐                          ┌─────────────────┐  │
│ │ 🚔 SEC TROOPER │                          │    MINIMAP      │  │
│ │ ─────────────  │                          │  ┌───────────┐  │  │
│ │ Objective:     │                          │  │     ✈     │  │  │
│ │ Cross Runway   │                          │  │  ---●---  │  │  │
│ │ to Hangar B    │                          │  │     |     │  │  │
│ │                │                          │  │    [H]    │  │  │
│ │ ⏱️ 0:45        │                          │  └───────────┘  │  │
│ └────────────────┘                          └─────────────────┘  │
│                                                                  │
│                                                                  │
│            ┌─────────────────────────────────────┐               │
│            │        [3D SIMULATION VIEW]         │               │
│            │                                     │               │
│            │     Control Tower visible           │               │
│            │     Runway crossing ahead           │               │
│            │     Vehicle at hold position        │               │
│            │                                     │               │
│            └─────────────────────────────────────┘               │
│                                                                  │
│ ┌─────────────────────────┐  ┌─────────────────────────────────┐ │
│ │ RADIO LOG               │  │                                 │ │
│ │ ───────────────         │  │  ATC: "Hotel 70, hold position. │ │
│ │ 10:23 GND: Hotel 70...  │  │        Standby."                │ │
│ │ 10:24 YOU: Roger...     │  │                                 │ │
│ │ 10:25 GND: Hotel 70...  │  └─────────────────────────────────┘ │
│ └─────────────────────────┘                                      │
│                                                                  │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │  A │ Hotel 70, roger, holding. │  B │ Copy, crossing now.   │ │
│ │  C │ Say again?                │  D │ Unable to comply.     │ │
│ └────────────────────────────┬────────────────┬────────────────┘ │
│                              │     🎤         │                  │
│                              │    [MIC]       │                  │
│                              └────────────────┘                  │
└──────────────────────────────────────────────────────────────────┘
```

**HUD Regions**:
| Region | Position | Content | Opacity |
|--------|----------|---------|---------|
| Role Badge | Top-left | Role icon, objective, timer | 90% |
| Minimap | Top-right | Simplified airfield view | 80% |
| Radio Log | Bottom-left | Scrolling message history | 85% |
| Instruction Banner | Bottom-center | Current ATC instruction | 95% |
| Options + Mic | Bottom | MCQ options, mic button | 100% |

**Scenario Flow**:
1. **Briefing** → Modal overlay with scenario context
2. **Simulation** → Real-time interaction with ATC prompts
3. **Decision Point** → Options appear, timer starts
4. **Voice Response** → User speaks selected answer
5. **Branch** → Correct/incorrect affects scenario progression
6. **Debrief** → Summary modal with scores

---

### 3.5 DEBRIEF_SCREEN

**Purpose**: Performance summary and learning reinforcement

**Layout Type**: Centered modal over blurred background

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│         ┌────────────────────────────────────────────┐           │
│         │                                            │           │
│         │  SESSION COMPLETE                          │           │
│         │  ═══════════════════                       │           │
│         │                                            │           │
│         │  ┌────────────┐  Overall Score             │           │
│         │  │            │                            │           │
│         │  │    85%     │  ████████░░  GOOD          │           │
│         │  │            │                            │           │
│         │  └────────────┘                            │           │
│         │                                            │           │
│         │  ──────────────────────────────────────    │           │
│         │                                            │           │
│         │  BREAKDOWN                                 │           │
│         │  Accuracy      ████████░░  80%             │           │
│         │  Voice Clarity ███████░░░  70%             │           │
│         │  Response Time █████████░  90%             │           │
│         │  R/T Structure ████████░░  85%             │           │
│         │                                            │           │
│         │  ──────────────────────────────────────    │           │
│         │                                            │           │
│         │  AREAS TO IMPROVE                          │           │
│         │  • Readback: Include full callsign         │           │
│         │  • Pace: Slightly too fast on clearances   │           │
│         │                                            │           │
│         │  ──────────────────────────────────────    │           │
│         │                                            │           │
│         │  [🔄 Retry Scenario]  [📊 View Details]    │           │
│         │                                            │           │
│         │            [Continue to Hub →]             │           │
│         │                                            │           │
│         └────────────────────────────────────────────┘           │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 4. Responsive Behavior

### 4.1 Target Resolutions

| Platform | Resolution | Aspect | Scale Factor |
|----------|------------|--------|--------------|
| Desktop (Primary) | 1920x1080 | 16:9 | 1.0x |
| Desktop (Min) | 1280x720 | 16:9 | 0.75x |
| Tablet Landscape | 1024x768 | 4:3 | Custom |
| Tablet Portrait | 768x1024 | 3:4 | Stack layout |

### 4.2 Breakpoint Strategy

```
DESKTOP FULL (≥1920px)
├── Full two-column layouts
├── All panels visible
└── Standard spacing

DESKTOP STANDARD (1280-1919px)
├── Reduced sidebar width
├── Compact cards
└── Tighter spacing (0.875x)

TABLET LANDSCAPE (768-1279px)
├── Collapsible sidebar
├── Stacked panels on Voice MCQ
└── Overlay minimap

TABLET PORTRAIT (<768px)
├── Full-width single column
├── Bottom sheet for options
└── Floating mic button
```

### 4.3 Safe Areas

- **Top**: 64px minimum for status bar / notch
- **Bottom**: 48px minimum for home indicator
- **Sides**: 24px minimum padding

---

## 5. Interaction Patterns

### 5.1 Navigation

| Pattern | Gesture/Input | Behavior |
|---------|---------------|----------|
| Back | Back button / Escape / Swipe right | Return to previous screen |
| Tab Switch | Click tab / Number keys | Switch between tabs |
| Scroll | Mouse wheel / Touch drag | Scroll content |
| Quick Actions | Keyboard shortcuts | See Accessibility section |

### 5.2 Selection

| Pattern | Trigger | Feedback |
|---------|---------|----------|
| Option Select | Click/Tap | Highlight + haptic (if available) |
| Confirm | Double-click / Enter | Execute action |
| Cancel | Right-click / Escape | Deselect / Close |

### 5.3 Voice Input

| Pattern | Trigger | Feedback |
|---------|---------|----------|
| Start Recording | Tap mic / Hold Space | Visual state change + audio cue |
| Stop Recording | Release / Tap again / 2s silence | Processing indicator |
| Retry | Tap retry button | Reset mic state |

### 5.4 Feedback Timing

| Event | Delay | Rationale |
|-------|-------|-----------|
| Hover effect | 0ms | Immediate responsiveness |
| Selection confirm | 100ms | Prevent accidental double-tap |
| Correct answer reveal | 200ms | Allow visual processing |
| Auto-advance | 1500ms | Time to read feedback |
| Error shake | 500ms total | Clear error indication |

---

## 6. Accessibility

### 6.1 WCAG 2.1 AA Compliance

| Requirement | Implementation |
|-------------|----------------|
| **Color Contrast** | All text ≥4.5:1 ratio |
| **Focus Indicators** | 2px Cyan outline on all focusable |
| **Text Scaling** | Support 100%-200% zoom |
| **Screen Reader** | All images have alt text, ARIA labels |
| **Keyboard Navigation** | Full keyboard support |
| **Motion** | Respect reduced-motion preference |

### 6.2 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Next focusable element |
| `Shift+Tab` | Previous focusable element |
| `Enter` | Activate focused element |
| `Escape` | Close modal / Cancel |
| `Space` | Hold to record voice |
| `1-4` | Select option A-D |
| `R` | Replay audio |
| `H` | Toggle hint |
| `?` | Open help |

### 6.3 Voice Accessibility

- **Alternative Input**: All voice exercises have keyboard fallback
- **Visual Transcript**: Real-time display of recognized speech
- **Retry Without Penalty**: Practice mode allows unlimited retries
- **Audio Cues**: State changes announced via audio

---

## 7. Loading & Empty States

### 7.1 Loading States

| Context | Visual |
|---------|--------|
| Initial Load | Splash screen with progress bar |
| Screen Transition | Fade + skeleton placeholders |
| Data Fetch | Spinner in affected area only |
| Voice Processing | Pulsing mic with "Processing..." |

### 7.2 Empty States

| Screen | Empty Message | Action |
|--------|---------------|--------|
| Progress (no data) | "Start training to see your progress" | [Start Training] CTA |
| Scenario Select (locked) | "Complete Theory mode to unlock" | Shows locked icon |
| Radio Log (start) | "Waiting for communication..." | Pulsing indicator |

### 7.3 Error States

| Error Type | Display | Recovery |
|------------|---------|----------|
| Network Error | Banner: "Connection lost" | [Retry] button |
| Voice Error | Mic shows error state | "Mic not detected" + [Retry] |
| Session Timeout | Modal: "Session expired" | [Resume] or [Restart] |
| Save Failed | Toast: "Progress not saved" | Auto-retry + manual [Retry] |

---

## 8. Animation Specifications

### 8.1 Screen Transitions

| Transition | Animation | Duration |
|------------|-----------|----------|
| Hub → Mode | Slide left + fade | 300ms |
| Mode → Hub | Slide right + fade | 300ms |
| Open Modal | Scale 0.95→1 + fade | 200ms |
| Close Modal | Scale 1→0.95 + fade | 150ms |

### 8.2 Component Animations

| Component | State Change | Animation |
|-----------|--------------|-----------|
| Button | hover | Scale 1→1.02, 100ms |
| Button | press | Scale 1→0.98, 50ms |
| Option | select | Border glow fade in, 200ms |
| Mic | idle→listening | Scale pulse + glow, loop |
| Progress Bar | update | Width tween, 500ms ease-out |
| Score | reveal | Count up from 0, 1000ms |

### 8.3 Feedback Animations

| Feedback | Animation | Duration |
|----------|-----------|----------|
| Correct | Green flash + checkmark pop | 300ms |
| Incorrect | Red shake (3 cycles) + X pop | 500ms |
| Level Up | Scale pop + particles | 800ms |
| Achievement | Slide down + bounce | 600ms |

---

## 9. Audio Design

### 9.1 UI Sound Palette

| Event | Sound Type | Notes |
|-------|------------|-------|
| Button Click | Soft click | 50ms, low volume |
| Option Select | Subtle tone | Ascending pitch |
| Correct Answer | Success chime | Major chord |
| Incorrect Answer | Error tone | Descending, not harsh |
| Mic Start | Radio static burst | Authentic R/T feel |
| Mic Stop | Radio click | Brief closure sound |
| Timer Warning | Soft beep | At 5s, 3s, 1s remaining |
| Achievement | Fanfare (short) | Celebratory but brief |

### 9.2 Voice Audio

| Audio Type | Format | Notes |
|------------|--------|-------|
| ATC Instructions | Pre-recorded TTS | Realistic radio filter |
| Example Phrases | Clear recording | For learning comparison |
| Feedback Voice | TTS | Optional voice feedback |

---

## 10. Localization Considerations

### 10.1 Text Expansion

| Language | Expansion Factor |
|----------|------------------|
| English (base) | 1.0x |
| Malay | 1.2x |
| Chinese | 0.8x (but larger font) |
| Tamil | 1.3x |

### 10.2 Layout Accommodation

- All text containers allow 30% overflow
- Dynamic font sizing for long labels
- Icons paired with text for universal understanding
- R/T phraseology remains in English (standard)

---

## Appendix A: Screen Checklist

### Pre-Development Checklist

For each screen, verify:
- [ ] All states documented (default, hover, active, disabled, error)
- [ ] Loading state defined
- [ ] Empty state defined
- [ ] Error state defined
- [ ] Keyboard navigation specified
- [ ] Screen reader labels defined
- [ ] Responsive breakpoints tested
- [ ] Animation specifications complete
- [ ] Audio cues defined

### Post-Development Checklist

- [ ] Color contrast meets WCAG AA
- [ ] All interactive elements focusable
- [ ] Tab order is logical
- [ ] Animations respect reduced-motion
- [ ] Touch targets ≥44px
- [ ] Loading states implemented
- [ ] Error handling tested
- [ ] Performance: 60fps animations
