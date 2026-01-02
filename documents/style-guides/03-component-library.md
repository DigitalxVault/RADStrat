# GenAI R/T Trainer - Component Library

> **Version**: 1.0
> **Last Updated**: December 2024
> **Target Platform**: Unity UI (uGUI / UI Toolkit)

---

## 1. Component Architecture

### 1.1 Component Hierarchy

```
COMPONENTS
├── ATOMS (Basic building blocks)
│   ├── Typography (Text styles)
│   ├── Icons
│   ├── Badges
│   └── Indicators
│
├── MOLECULES (Combined atoms)
│   ├── Buttons
│   ├── Cards
│   ├── Inputs
│   └── Panels
│
├── ORGANISMS (Complex components)
│   ├── QuestionCard
│   ├── OptionsList
│   ├── MicButton
│   ├── LiveTranscript
│   ├── QualityMatrixPanel
│   ├── RadioLogPanel
│   └── DebriefModal
│
└── TEMPLATES (Screen layouts)
    ├── DashboardLayout
    ├── TwoColumnLayout
    └── HUDOverlayLayout
```

### 1.2 Naming Convention

```
[ComponentName]_[Variant]_[State]

Examples:
- Button_Primary_Default
- Button_Primary_Hover
- MicButton_Listening
- OptionCard_Selected
- OptionCard_Correct
```

---

## 2. Atoms

### 2.1 Typography Components

#### Text Styles

| Style Name | Font | Size | Weight | Line Height | Color |
|------------|------|------|--------|-------------|-------|
| `Text_DisplayXL` | Inter | 48px | Bold | 1.1 | Slate-200 |
| `Text_DisplayL` | Inter | 36px | Bold | 1.2 | Slate-200 |
| `Text_H1` | Inter | 28px | SemiBold | 1.3 | Slate-200 |
| `Text_H2` | Inter | 24px | SemiBold | 1.3 | Slate-200 |
| `Text_H3` | Inter | 20px | SemiBold | 1.4 | Slate-200 |
| `Text_BodyL` | Inter | 18px | Regular | 1.5 | Slate-200 |
| `Text_BodyM` | Inter | 16px | Regular | 1.5 | Slate-200 |
| `Text_BodyS` | Inter | 14px | Regular | 1.5 | Slate-400 |
| `Text_Caption` | Inter | 12px | Regular | 1.4 | Slate-400 |
| `Text_MonoL` | JetBrains Mono | 18px | Regular | 1.6 | Slate-200 |
| `Text_MonoM` | JetBrains Mono | 16px | Regular | 1.6 | Slate-200 |
| `Text_Callsign` | JetBrains Mono | 16px | Bold | 1.4 | Cyan-Info |

**Unity Implementation**:
```csharp
[CreateAssetMenu(fileName = "TextStyle", menuName = "RTTrainer/TextStyle")]
public class TextStyleSO : ScriptableObject
{
    public TMP_FontAsset font;
    public float fontSize;
    public FontStyles fontStyle;
    public float lineSpacing;
    public Color color;
}
```

---

### 2.2 Icon Set

#### Core Icons (24x24 base)

| Icon ID | Description | Usage |
|---------|-------------|-------|
| `ico_radio` | Walkie-talkie | R/T context indicator |
| `ico_mic` | Microphone | Voice input |
| `ico_mic_off` | Mic with slash | Muted state |
| `ico_volume` | Speaker | Audio output |
| `ico_volume_off` | Speaker with slash | Audio muted |
| `ico_timer` | Clock | Time limit |
| `ico_check` | Checkmark | Success/correct |
| `ico_x` | X mark | Error/incorrect |
| `ico_alert` | Triangle ! | Warning |
| `ico_info` | Circle i | Information |
| `ico_plane` | Aircraft | Aircraft reference |
| `ico_vehicle` | Car/truck | Ground vehicle |
| `ico_tower` | Control tower | ATC reference |
| `ico_runway` | Parallel lines | Runway |
| `ico_map` | Folded map | Minimap |
| `ico_settings` | Gear | Settings |
| `ico_user` | Person | Profile |
| `ico_play` | Triangle | Start/play |
| `ico_retry` | Circular arrow | Retry |
| `ico_back` | Left arrow | Navigate back |
| `ico_next` | Right arrow | Navigate forward |
| `ico_hint` | Lightbulb | Hint available |

**Icon Sizing**:
| Size | Pixels | Usage |
|------|--------|-------|
| Small | 16x16 | Inline with text |
| Medium | 24x24 | Buttons, labels |
| Large | 32x32 | Feature icons |
| XLarge | 48x48 | Hero sections |

---

### 2.3 Badges

#### Badge_Role

```
┌───────────────────┐
│ [icon] ROLE NAME  │
└───────────────────┘
```

| Prop | Type | Options |
|------|------|---------|
| `role` | enum | Bowser, SecurityTrooper, AFE, Contractor, FireTender |
| `size` | enum | Small, Medium, Large |

**Role Colors**:
| Role | Background | Icon |
|------|------------|------|
| Bowser | `#3D5A3D` | fuel truck |
| SecurityTrooper | `#2D2D4A` | shield |
| AFE | `#4A4A2D` | wrench |
| Contractor | `#4A4A4A` | hard hat |
| FireTender | `#5A2D2D` | fire |

---

### 2.4 Indicators

#### Indicator_Progress

```
████████░░░░░░░░  75%
```

| Prop | Type | Description |
|------|------|-------------|
| `value` | float (0-1) | Progress percentage |
| `showLabel` | bool | Show percentage text |
| `color` | Color | Fill color (default: Cyan-Info) |
| `size` | enum | Thin (4px), Medium (8px), Thick (12px) |

#### Indicator_Timer

```
⏱️ 0:45
```

| Prop | Type | Description |
|------|------|-------------|
| `seconds` | int | Time remaining |
| `warningThreshold` | int | Seconds to show warning (default: 5) |
| `criticalThreshold` | int | Seconds to show critical (default: 3) |

**States**:
- Normal: Slate-400 color
- Warning: Amber-Warning color + pulse
- Critical: Red-Critical color + faster pulse

---

## 3. Molecules

### 3.1 Button Components

#### Button_Primary

```
┌─────────────────────────┐
│      Button Text        │
└─────────────────────────┘
```

| Prop | Type | Description |
|------|------|-------------|
| `text` | string | Button label |
| `icon` | Sprite | Optional left icon |
| `iconPosition` | enum | Left, Right |
| `size` | enum | Small, Medium, Large |
| `state` | enum | Default, Hover, Pressed, Disabled |

**Size Specifications**:
| Size | Height | Padding | Font Size |
|------|--------|---------|-----------|
| Small | 32px | 12px 16px | 14px |
| Medium | 40px | 12px 20px | 16px |
| Large | 48px | 16px 24px | 18px |

**State Colors**:
| State | Background | Border | Text |
|-------|------------|--------|------|
| Default | Cyan-Info | none | Slate-900 |
| Hover | Cyan-Light | none | Slate-900 |
| Pressed | Cyan-Info (90%) | none | Slate-900 |
| Disabled | Slate-600 | none | Slate-400 |

#### Button_Secondary

Same structure, different colors:
| State | Background | Border | Text |
|-------|------------|--------|------|
| Default | Transparent | Slate-600 | Slate-200 |
| Hover | Slate-700 | Slate-500 | Slate-200 |
| Pressed | Slate-800 | Slate-500 | Slate-200 |
| Disabled | Transparent | Slate-700 | Slate-500 |

#### Button_Ghost

No background, text + icon only:
| State | Text Color |
|-------|------------|
| Default | Slate-400 |
| Hover | Slate-200 |
| Pressed | Cyan-Info |
| Disabled | Slate-600 |

---

### 3.2 Card Components

#### Card_Base

```
┌────────────────────────────────┐
│                                │
│         [CONTENT]              │
│                                │
└────────────────────────────────┘
```

| Prop | Type | Description |
|------|------|-------------|
| `padding` | int | Internal padding (default: 16) |
| `radius` | int | Corner radius (default: 16) |
| `elevation` | enum | None, Low, Medium, High |
| `interactive` | bool | Has hover/press states |

**Elevation Shadows**:
| Level | Shadow |
|-------|--------|
| None | none |
| Low | 0 1px 3px rgba(0,0,0,0.3) |
| Medium | 0 4px 6px rgba(0,0,0,0.4) |
| High | 0 10px 20px rgba(0,0,0,0.5) |

---

### 3.3 Input Components

#### Input_Text

```
┌────────────────────────────────┐
│ Placeholder text...            │
└────────────────────────────────┘
```

| Prop | Type | Description |
|------|------|-------------|
| `placeholder` | string | Hint text |
| `value` | string | Current value |
| `state` | enum | Default, Focus, Error, Disabled |
| `icon` | Sprite | Optional left icon |

**State Styles**:
| State | Border | Background |
|-------|--------|------------|
| Default | Slate-600 | Slate-800 |
| Focus | Cyan-Info (2px) | Slate-800 |
| Error | Red-Critical (2px) | Slate-800 |
| Disabled | Slate-700 | Slate-700 |

---

## 4. Organisms

### 4.1 QuestionCard

**Purpose**: Display question text with context and audio playback

```
┌────────────────────────────────────────┐
│  [🔊] Play Audio                       │
│                                        │
│  QUESTION                              │
│  ═══════════════════                   │
│                                        │
│  Ground Controller says:               │
│  "Hotel 70, taxi via Alpha,            │
│   hold short Runway 02."               │
│                                        │
│  What is the correct response?         │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ [💡] Hint Available              │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

**Props**:
| Prop | Type | Description |
|------|------|-------------|
| `questionText` | string | Main question content |
| `contextTag` | string | Category label |
| `difficulty` | enum | Easy, Medium, Hard |
| `hintAvailable` | bool | Show hint button |
| `audioClip` | AudioClip | Optional audio prompt |
| `atcText` | string | Quoted ATC instruction |

**Sub-Components**:
- `AudioPlayButton`: Play/pause toggle for audio
- `HintButton`: Expandable hint section
- `DifficultyBadge`: Color-coded difficulty indicator

**Unity Prefab Structure**:
```
QuestionCard (Panel)
├── Header (HorizontalLayout)
│   ├── AudioPlayButton
│   └── ContextBadge
├── Content (VerticalLayout)
│   ├── QuestionLabel (Text_H2)
│   ├── ATCQuote (Card_Base)
│   │   └── ATCText (Text_MonoM)
│   └── PromptLabel (Text_BodyM)
└── Footer (HorizontalLayout)
    └── HintPanel (Expandable)
```

---

### 4.2 OptionsList

**Purpose**: Display MCQ options with selection states

```
┌────────────────────────────────┐
│ A │ Hotel 70, roger,           │  ← Option (Default)
│   │ holding position.          │
└────────────────────────────────┘
┌────────────────────────────────┐
│ B │ Copy, I'm going            │  ← Option (Hover)
│   │ anyway.                    │
└────────────────────────────────┘
┌────────────────────────────────┐
│ C │ Say again?                 │  ← Option (Selected)
└────────────────────────────────┘
┌────────────────────────────────┐
│ D │ Unable to comply,          │  ← Option (Disabled)
│   │ standing by.               │
└────────────────────────────────┘
```

**Props**:
| Prop | Type | Description |
|------|------|-------------|
| `options` | List<Option> | Array of option data |
| `selectedOptionId` | string | Currently selected |
| `showLetters` | bool | Show A/B/C/D labels |
| `revealMode` | enum | None, ShowCorrect, ShowAll |
| `interactable` | bool | Allow selection |

**Option Data Structure**:
```csharp
[System.Serializable]
public class OptionData
{
    public string id;          // "A", "B", "C", "D"
    public string text;        // Option text
    public bool isCorrect;     // Is this the correct answer
}
```

**Option States**:
| State | Background | Border | Letter BG |
|-------|------------|--------|-----------|
| Default | Slate-700 | Slate-600 | Slate-600 |
| Hover | Slate-600 | Slate-500 | Slate-500 |
| Selected | Slate-700 | Cyan-Info (2px) | Cyan-Info |
| Correct | Green-Success/20% | Green-Success | Green-Success |
| Incorrect | Red-Critical/20% | Red-Critical | Red-Critical |
| Disabled | Slate-800 | Slate-700 | Slate-700 |

**Unity Prefab Structure**:
```
OptionsList (VerticalLayout)
├── OptionItem_A
│   ├── LetterBadge ("A")
│   └── OptionText
├── OptionItem_B
├── OptionItem_C
└── OptionItem_D
```

---

### 4.3 MicButton

**Purpose**: Voice input control with visual feedback

```
     ┌─────────────────┐
     │                 │
     │    🎤           │
     │   [MIC]         │
     │                 │
     │  Tap to Speak   │
     └─────────────────┘
```

**Props**:
| Prop | Type | Description |
|------|------|-------------|
| `state` | enum | Idle, Listening, Processing, Success, Fail |
| `showLabel` | bool | Show text label below |
| `size` | enum | Medium (64px), Large (80px) |

**State Specifications**:

| State | Icon | Background | Animation | Label |
|-------|------|------------|-----------|-------|
| Idle | mic | Slate-700 | None | "Tap to Speak" |
| Listening | mic | Cyan-Info | Pulse + Glow | "Listening..." |
| Processing | spinner | Cyan-Info | Rotate | "Processing..." |
| Success | check | Green-Success | Pop | "Got it!" |
| Fail | x | Red-Critical | Shake | "Try Again" |

**Animation Specs**:
| Animation | Duration | Easing | Details |
|-----------|----------|--------|---------|
| Pulse | 1000ms | ease-in-out | Scale 1.0 → 1.1 → 1.0, loop |
| Glow | 1000ms | ease-in-out | Shadow opacity 0.3 → 0.6 → 0.3 |
| Rotate | 1000ms | linear | 360° rotation, loop |
| Pop | 300ms | ease-out | Scale 0.8 → 1.1 → 1.0 |
| Shake | 500ms | ease-in-out | X offset -5 → 5 → -5 → 0, 3 cycles |

**Unity Prefab Structure**:
```
MicButton (Button)
├── Background (Image, circular)
├── GlowEffect (Image, larger circle, additive)
├── IconContainer
│   ├── MicIcon (active when idle/listening)
│   ├── SpinnerIcon (active when processing)
│   ├── CheckIcon (active when success)
│   └── XIcon (active when fail)
└── Label (Text_Caption)
```

---

### 4.4 LiveTranscript

**Purpose**: Real-time display of speech-to-text output

```
┌─────────────────────────────┐
│ LIVE TRANSCRIPT             │
│ ─────────────────────────── │
│                             │
│ "Hotel 70, taxi via..."     │
│                             │
│ [Listening...]              │
└─────────────────────────────┘
```

**Props**:
| Prop | Type | Description |
|------|------|-------------|
| `text` | string | Current transcript |
| `confidence` | float | Recognition confidence (0-1) |
| `isListening` | bool | Show listening indicator |
| `highlightErrors` | bool | Mark low-confidence words |

**Visual Rules**:
- Font: `Text_MonoL` (JetBrains Mono, 18px)
- Low confidence words (<0.7): Amber-Warning color
- Very low confidence (<0.5): Red-Critical color + underline
- Listening indicator: Pulsing "..." animation

**Unity Prefab Structure**:
```
LiveTranscript (Panel)
├── Header
│   └── TitleLabel ("LIVE TRANSCRIPT")
├── Divider
├── TranscriptArea (ScrollRect)
│   └── TranscriptText (TextMeshPro)
└── StatusIndicator
    └── ListeningDots (animated)
```

---

### 4.5 QualityMatrixPanel

**Purpose**: Display voice quality evaluation scores

```
┌─────────────────────────────┐
│ QUALITY MATRIX              │
│ ─────────────────────────── │
│ Clarity    ████░░░░ 60%     │
│ Pace       █████░░░ 70%     │
│ Structure  ██████░░ 80%     │
│ Callsign   ████████ 100%    │
└─────────────────────────────┘
```

**Props**:
| Prop | Type | Description |
|------|------|-------------|
| `clarityScore` | float (0-1) | Pronunciation clarity |
| `paceScore` | float (0-1) | Speaking pace |
| `structureScore` | float (0-1) | R/T structure adherence |
| `callsignScore` | float (0-1) | Callsign correctness |
| `showLabels` | bool | Show percentage values |
| `animated` | bool | Animate bar fills on update |

**Score Colors**:
| Range | Color |
|-------|-------|
| 0-40% | Red-Critical |
| 40-70% | Amber-Warning |
| 70-90% | Cyan-Info |
| 90-100% | Green-Success |

**Unity Prefab Structure**:
```
QualityMatrixPanel (Panel)
├── Header
│   └── TitleLabel
├── Divider
└── ScoresList (VerticalLayout)
    ├── ScoreRow_Clarity
    │   ├── Label ("Clarity")
    │   ├── ProgressBar
    │   └── ValueLabel ("60%")
    ├── ScoreRow_Pace
    ├── ScoreRow_Structure
    └── ScoreRow_Callsign
```

---

### 4.6 RadioLogPanel

**Purpose**: Scrollable log of R/T communications

```
┌─────────────────────────────────┐
│ RADIO LOG                       │
│ ─────────────────────────────── │
│ 10:23 [GND] Hotel 70, hold      │
│             position. Standby.  │
│ 10:24 [YOU] Roger, holding      │
│             position.           │
│ 10:25 [GND] Hotel 70, cleared   │
│             to cross Runway 02. │
│ 10:26 [YOU] Cleared to cross    │
│             Runway 02, Hotel 70.│
│ ▼ (scroll for more)             │
└─────────────────────────────────┘
```

**Props**:
| Prop | Type | Description |
|------|------|-------------|
| `messages` | List<RadioMessage> | Message history |
| `maxVisible` | int | Max messages to display |
| `autoScroll` | bool | Scroll to newest |
| `showTimestamps` | bool | Show time for each message |

**RadioMessage Structure**:
```csharp
[System.Serializable]
public class RadioMessage
{
    public string timestamp;     // "10:23"
    public string sender;        // "GND", "YOU", "TWR"
    public string senderDisplay; // "Ground", "You", "Tower"
    public string message;       // The actual message
    public MessageType type;     // Instruction, Response, Acknowledgment
}
```

**Sender Badge Colors**:
| Sender | Badge Color | Text Color |
|--------|-------------|------------|
| GND (Ground) | Amber-Warning | Slate-900 |
| TWR (Tower) | Cyan-Info | Slate-900 |
| YOU (Player) | Green-Success | Slate-900 |
| OTH (Other) | Slate-500 | Slate-200 |

**Unity Prefab Structure**:
```
RadioLogPanel (Panel)
├── Header
│   └── TitleLabel
├── Divider
├── MessageList (ScrollRect, VerticalLayout)
│   └── MessageItem (Prefab, spawned per message)
│       ├── Timestamp (Text_Caption)
│       ├── SenderBadge
│       └── MessageText (Text_MonoM)
└── ScrollIndicator (shows when more content)
```

---

### 4.7 DebriefModal

**Purpose**: Session summary with scores and recommendations

```
┌────────────────────────────────────────────┐
│                                            │
│  SESSION COMPLETE                          │
│  ═══════════════════                       │
│                                            │
│  ┌────────────┐  Overall Score             │
│  │    85%     │  ████████░░  GOOD          │
│  └────────────┘                            │
│                                            │
│  ──────────────────────────────────────    │
│                                            │
│  BREAKDOWN                                 │
│  Accuracy      ████████░░  80%             │
│  Voice Clarity ███████░░░  70%             │
│  Response Time █████████░  90%             │
│  R/T Structure ████████░░  85%             │
│                                            │
│  ──────────────────────────────────────    │
│                                            │
│  AREAS TO IMPROVE                          │
│  • Readback: Include full callsign         │
│  • Pace: Slightly too fast on clearances   │
│                                            │
│  ──────────────────────────────────────    │
│                                            │
│  IDEAL RESPONSE                            │
│  "Hotel 70, taxi via Alpha, hold short     │
│   Runway 02."                              │
│                                            │
│  ──────────────────────────────────────    │
│                                            │
│  [🔄 Retry]  [📊 Details]  [Continue →]    │
│                                            │
└────────────────────────────────────────────┘
```

**Props**:
| Prop | Type | Description |
|------|------|-------------|
| `overallScore` | float | Total score (0-1) |
| `breakdown` | ScoreBreakdown | Individual metrics |
| `mistakes` | List<string> | Improvement areas |
| `idealPhrase` | string | Expected response |
| `showReplay` | bool | Show replay option |

**Score Grades**:
| Range | Grade | Color |
|-------|-------|-------|
| 90-100% | EXCELLENT | Green-Success |
| 75-89% | GOOD | Cyan-Info |
| 60-74% | FAIR | Amber-Warning |
| 0-59% | NEEDS WORK | Red-Critical |

**Unity Prefab Structure**:
```
DebriefModal (Modal)
├── Backdrop (darkened, clickable to close)
├── ModalContainer (centered, Card_Base)
│   ├── Header
│   │   └── TitleLabel
│   ├── ScoreSection
│   │   ├── ScoreCircle (large percentage)
│   │   └── GradeLabel
│   ├── Divider
│   ├── BreakdownSection
│   │   └── ScoreRows (4x)
│   ├── Divider
│   ├── ImprovementSection
│   │   └── BulletList
│   ├── Divider
│   ├── IdealResponseSection
│   │   └── QuoteCard
│   ├── Divider
│   └── ActionButtons (HorizontalLayout)
│       ├── Button_Secondary ("Retry")
│       ├── Button_Secondary ("Details")
│       └── Button_Primary ("Continue")
```

---

## 5. Templates (Screen Layouts)

### 5.1 DashboardLayout

```
┌──────────────────────────────────────────────────────────────────┐
│                           TOP BAR (64px)                         │
├────────────┬─────────────────────────────────────────────────────┤
│            │                                                     │
│   LEFT     │                                                     │
│   NAV      │                    MAIN CONTENT                     │
│  (160px)   │                                                     │
│            │                                                     │
│            │                                                     │
└────────────┴─────────────────────────────────────────────────────┘
```

**Regions**:
| Region | Size | Contains |
|--------|------|----------|
| TopBar | 100% x 64px | Logo, Title, User, Settings |
| LeftNav | 160px x (100% - 64px) | Navigation items |
| MainContent | Remaining | Primary screen content |

### 5.2 TwoColumnLayout

```
┌──────────────────────────────────────────────────────────────────┐
│                           TOP BAR (64px)                         │
├────────────────────────────────┬─────────────────────────────────┤
│                                │                                 │
│         LEFT COLUMN            │         RIGHT COLUMN            │
│            (50%)               │            (50%)                │
│                                │                                 │
│                                │                                 │
└────────────────────────────────┴─────────────────────────────────┘
```

**Usage**: Voice MCQ Screen (Question left, Voice input right)

### 5.3 HUDOverlayLayout

```
┌────────────────┐                          ┌─────────────────┐
│   TOP LEFT     │                          │    TOP RIGHT    │
│   (Role/Obj)   │                          │    (Minimap)    │
└────────────────┘                          └─────────────────┘

              [3D SIMULATION FILLS ENTIRE BACKGROUND]

┌─────────────────────────┐  ┌─────────────────────────────────┐
│     BOTTOM LEFT         │  │         BOTTOM CENTER           │
│     (Radio Log)         │  │     (Instruction + Options)     │
└─────────────────────────┘  └─────────────────────────────────┘
```

**Usage**: Scenario Screen (HUD over 3D view)

---

## 6. Component States Reference

### Universal States

| State | Description | Trigger |
|-------|-------------|---------|
| Default | Normal appearance | Initial state |
| Hover | Highlighted | Mouse over (desktop) |
| Focus | Keyboard focused | Tab navigation |
| Active/Pressed | Being activated | Mouse down / touch |
| Disabled | Non-interactive | interactable = false |
| Loading | Awaiting data | Async operation |
| Error | Invalid state | Validation failure |

### State Transitions

```
         ┌─────────┐
         │ DEFAULT │
         └────┬────┘
              │
    ┌─────────┼─────────┐
    ▼         ▼         ▼
┌───────┐ ┌───────┐ ┌──────────┐
│ HOVER │ │ FOCUS │ │ DISABLED │
└───┬───┘ └───┬───┘ └──────────┘
    │         │
    ▼         ▼
┌─────────────────┐
│  ACTIVE/PRESSED │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌───────┐
│SUCCESS│ │ ERROR │
└───────┘ └───────┘
```

---

## Appendix A: Unity Prefab Checklist

### Core Prefabs to Create

- [ ] **Atoms**
  - [ ] Text style prefabs (all variants)
  - [ ] Icon sprite atlas
  - [ ] Badge_Role prefab
  - [ ] Indicator_Progress prefab
  - [ ] Indicator_Timer prefab

- [ ] **Molecules**
  - [ ] Button_Primary prefab
  - [ ] Button_Secondary prefab
  - [ ] Button_Ghost prefab
  - [ ] Card_Base prefab
  - [ ] Input_Text prefab

- [ ] **Organisms**
  - [ ] QuestionCard prefab
  - [ ] OptionsList prefab
  - [ ] OptionItem prefab
  - [ ] MicButton prefab
  - [ ] LiveTranscript prefab
  - [ ] QualityMatrixPanel prefab
  - [ ] RadioLogPanel prefab
  - [ ] RadioMessage prefab
  - [ ] DebriefModal prefab

- [ ] **Templates**
  - [ ] DashboardLayout prefab
  - [ ] TwoColumnLayout prefab
  - [ ] HUDOverlayLayout prefab

---

## Appendix B: Component Event Reference

### Common Events

| Event | Components | Parameters |
|-------|------------|------------|
| `OnClick` | All buttons | none |
| `OnOptionSelected` | OptionsList | optionId |
| `OnMicStateChanged` | MicButton | newState |
| `OnTranscriptUpdated` | LiveTranscript | text, confidence |
| `OnScoreUpdated` | QualityMatrix | scores |
| `OnMessageReceived` | RadioLogPanel | message |
| `OnModalClosed` | DebriefModal | action (retry/continue) |

### Event Flow Example (Voice MCQ)

```
1. User taps MicButton
   → OnMicStateChanged(Listening)

2. Speech detected
   → OnTranscriptUpdated("Hotel 70...")

3. Speech complete
   → OnMicStateChanged(Processing)

4. Evaluation complete
   → OnScoreUpdated(scores)
   → OnMicStateChanged(Success/Fail)

5. Auto-advance or retry
   → OnQuestionComplete(result)
```
