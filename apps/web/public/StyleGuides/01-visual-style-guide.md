# GenAI R/T Trainer - Visual Style Guide

> **Version**: 1.0
> **Last Updated**: December 2024
> **Project**: RSAF Ground R/T Training Simulator

---

## 1. Art Direction Overview

### 1.1 Style Statement
**"Serious training meets accessible simulation"**

A low-poly, simplified realism aesthetic that balances military professionalism with approachable training visuals. The style prioritizes **clarity over detail** - every visual element must serve training comprehension.

### 1.2 Design Pillars

| Pillar | Description |
|--------|-------------|
| **Clarity** | Instantly readable silhouettes, clear role identification, unambiguous signage |
| **Professionalism** | Military-grade UI discipline, no playful elements, focused aesthetic |
| **Accessibility** | High contrast for readability, colorblind-safe accents, scalable UI |
| **Security** | No real airbase layouts; all geometry is fictionalized |

### 1.3 Visual References
- **Primary**: DEFCON (minimalist tactical UI), Air Traffic: Greenlight (radar aesthetics)
- **Secondary**: Ace Combat briefing screens, Killer Frequency (radio UI)
- **Avoid**: Cartoon styles, hyper-realism, branded military insignia

---

## 2. Color System

### 2.1 Base Palette (Neutrals)

| Name | Hex | RGB | Unity Color | Usage |
|------|-----|-----|-------------|-------|
| **Slate-900** | `#0F172A` | `15, 23, 42` | `new Color(0.06f, 0.09f, 0.16f)` | Primary backgrounds |
| **Slate-800** | `#1E293B` | `30, 41, 59` | `new Color(0.12f, 0.16f, 0.23f)` | Card backgrounds |
| **Slate-700** | `#334155` | `51, 65, 85` | `new Color(0.20f, 0.25f, 0.33f)` | Secondary panels |
| **Slate-600** | `#475569` | `71, 85, 105` | `new Color(0.28f, 0.33f, 0.41f)` | Borders, dividers |
| **Slate-400** | `#94A3B8` | `148, 163, 184` | `new Color(0.58f, 0.64f, 0.72f)` | Secondary text |
| **Slate-200** | `#E2E8F0` | `226, 232, 240` | `new Color(0.89f, 0.91f, 0.94f)` | Primary text |
| **Charcoal** | `#18181B` | `24, 24, 27` | `new Color(0.09f, 0.09f, 0.11f)` | Deep backgrounds |
| **Neutral-Gray** | `#404040` | `64, 64, 64` | `new Color(0.25f, 0.25f, 0.25f)` | Inactive elements |

### 2.2 Accent Palette (Functional)

| Name | Hex | RGB | Unity Color | Usage |
|------|-----|-----|-------------|-------|
| **Amber-Warning** | `#F59E0B` | `245, 158, 11` | `new Color(0.96f, 0.62f, 0.04f)` | Warnings, caution states |
| **Amber-Light** | `#FCD34D` | `252, 211, 77` | `new Color(0.99f, 0.83f, 0.30f)` | Warning highlights |
| **Cyan-Info** | `#06B6D4` | `6, 182, 212` | `new Color(0.02f, 0.71f, 0.83f)` | Information, radio active |
| **Cyan-Light** | `#67E8F9` | `103, 232, 249` | `new Color(0.40f, 0.91f, 0.98f)` | Info highlights, selected |
| **Green-Success** | `#22C55E` | `34, 197, 94` | `new Color(0.13f, 0.77f, 0.37f)` | Correct, success, go |
| **Green-Light** | `#86EFAC` | `134, 239, 172` | `new Color(0.53f, 0.94f, 0.67f)` | Success highlights |
| **Red-Critical** | `#EF4444` | `239, 68, 68` | `new Color(0.94f, 0.27f, 0.27f)` | Errors, critical, stop |
| **Red-Light** | `#FCA5A5` | `252, 165, 165` | `new Color(0.99f, 0.65f, 0.65f)` | Error highlights |

### 2.3 Semantic Color Mapping

```
STATE COLORS
├── idle          → Slate-600
├── hover         → Slate-500
├── active        → Cyan-Info
├── disabled      → Neutral-Gray (50% opacity)
├── success       → Green-Success
├── warning       → Amber-Warning
├── error         → Red-Critical
└── listening     → Cyan-Info (pulsing)

UI ELEMENT COLORS
├── background.primary    → Slate-900
├── background.secondary  → Slate-800
├── background.card       → Slate-700
├── text.primary          → Slate-200
├── text.secondary        → Slate-400
├── text.disabled         → Slate-600
├── border.default        → Slate-600
├── border.focus          → Cyan-Info
└── border.error          → Red-Critical
```

### 2.4 Colorblind Accessibility
All functional colors maintain >4.5:1 contrast ratio. The palette is tested for:
- Deuteranopia (green-blind)
- Protanopia (red-blind)
- Tritanopia (blue-blind)

**Fallback Strategy**: Always pair color with iconography or text labels.

---

## 3. Typography

### 3.1 Font Stack

| Role | Font Family | Fallback | Weight |
|------|-------------|----------|--------|
| **Display** | Inter | Arial, sans-serif | 700 (Bold) |
| **Heading** | Inter | Arial, sans-serif | 600 (SemiBold) |
| **Body** | Inter | Arial, sans-serif | 400 (Regular) |
| **Mono/Transcript** | JetBrains Mono | Consolas, monospace | 400 (Regular) |
| **Radio Callsign** | JetBrains Mono | Consolas, monospace | 700 (Bold) |

### 3.2 Type Scale (Unity UI)

| Name | Size (px) | Size (pt) | Line Height | Letter Spacing | Usage |
|------|-----------|-----------|-------------|----------------|-------|
| **Display-XL** | 48 | 36 | 1.1 | -0.02em | Hero titles |
| **Display-L** | 36 | 27 | 1.2 | -0.01em | Screen titles |
| **Heading-1** | 28 | 21 | 1.3 | 0 | Section headers |
| **Heading-2** | 24 | 18 | 1.3 | 0 | Card titles |
| **Heading-3** | 20 | 15 | 1.4 | 0 | Subsections |
| **Body-L** | 18 | 13.5 | 1.5 | 0 | Primary content |
| **Body-M** | 16 | 12 | 1.5 | 0 | Default body |
| **Body-S** | 14 | 10.5 | 1.5 | 0.01em | Secondary text |
| **Caption** | 12 | 9 | 1.4 | 0.02em | Labels, hints |
| **Mono-L** | 18 | 13.5 | 1.6 | 0.05em | Transcripts |
| **Mono-M** | 16 | 12 | 1.6 | 0.05em | Radio log |

### 3.3 Typography Rules

1. **Callsigns**: Always uppercase, monospace, bold (`HOTEL 70`)
2. **Instructions**: Sentence case, body font
3. **R/T Phraseology**: Monospace for exact phrases in training
4. **UI Labels**: Sentence case, never all-caps except callsigns
5. **Numbers**: Tabular figures for aligned data (scores, timers)

---

## 4. Materials & Surfaces (3D Environment)

### 4.1 Ground Materials

| Surface | Base Color | Properties |
|---------|------------|------------|
| **Asphalt (Taxiway)** | `#2D2D2D` | Matte, roughness 0.9, no reflection |
| **Asphalt (Runway)** | `#1F1F1F` | Slightly darker, same properties |
| **Concrete (Apron)** | `#4A4A4A` | Matte, subtle noise texture |
| **Grass (Infield)** | `#2D4A2D` | Low-poly, flat shaded |
| **Marking Paint** | `#E8E8E8` | Emissive at night (0.2 intensity) |

### 4.2 Building Materials

| Element | Base Color | Properties |
|---------|------------|------------|
| **Hangar Walls** | `#3D3D3D` | Matte metal, simple geometry |
| **Control Tower** | `#4A4A4A` | Concrete look, clear silhouette |
| **Windows** | `#1A3A4A` | Dark tint, subtle reflection |
| **Roof Surfaces** | `#2A2A2A` | Flat, no detail |

### 4.3 Vehicle Materials

| Vehicle Type | Base Color | Accent | Label Style |
|--------------|------------|--------|-------------|
| **Bowser** | `#3D5A3D` | Yellow stripe | "BOWSER" white text |
| **Security Vehicle** | `#2D2D4A` | Blue beacon | "SEC" badge |
| **Fire Tender** | `#5A2D2D` | Red/white stripe | "FIRE" label |
| **AFE Vehicle** | `#4A4A2D` | Orange accent | "AFE" label |
| **Contractor** | `#4A4A4A` | Yellow/black stripe | "CONTRACTOR" |

### 4.4 Props & Signage

| Prop | Style | Color |
|------|-------|-------|
| **Traffic Cones** | Simple cone primitive | Orange `#FF6600` |
| **Barricades** | Box with stripes | Yellow/Black |
| **Runway Signs** | Flat panel | Red bg/White text or Yellow bg/Black text |
| **Taxiway Signs** | Flat panel | Yellow bg/Black text |
| **Position Markers** | Disc on ground | White outline |

---

## 5. Lighting

### 5.1 Day Scene

| Light | Type | Color | Intensity |
|-------|------|-------|-----------|
| **Sun** | Directional | `#FFF5E6` (warm white) | 1.2 |
| **Sky** | Ambient | `#87CEEB` (sky blue) | 0.4 |
| **Fill** | Directional (opposite) | `#E6F0FF` (cool) | 0.3 |

### 5.2 Night Scene

| Light | Type | Color | Intensity |
|-------|------|-------|-----------|
| **Moon** | Directional | `#C4D4E6` (cool white) | 0.3 |
| **Ambient** | Ambient | `#1A1A2E` (dark blue) | 0.2 |
| **Runway Lights** | Point (array) | `#FFFFFF` | 0.8 |
| **Taxiway Lights** | Point (array) | `#00FF00` (green edge) | 0.6 |
| **Building Lights** | Point | `#FFE4B5` (warm) | 0.5 |

### 5.3 Lighting Rules

1. **No harsh shadows** - Soft shadows only for readability
2. **Silhouette priority** - Objects must read clearly against background
3. **Functional lighting** - Runway/taxiway lights serve gameplay purpose
4. **Minimal bloom** - Professional, not cinematic

---

## 6. Iconography

### 6.1 Icon Style

- **Style**: Outlined, 2px stroke weight
- **Grid**: 24x24 base, scalable
- **Corners**: 2px radius on rectangles
- **Color**: Inherits from parent (typically Slate-400 or functional color)

### 6.2 Core Icons

| Icon | Usage | Glyph Description |
|------|-------|-------------------|
| `radio` | R/T context | Walkie-talkie silhouette |
| `mic` | Voice input | Microphone |
| `mic-off` | Muted | Microphone with slash |
| `volume` | Audio output | Speaker waves |
| `timer` | Time pressure | Clock |
| `check` | Correct/Success | Checkmark |
| `x` | Wrong/Error | X mark |
| `alert` | Warning | Triangle with ! |
| `info` | Information | Circle with i |
| `plane` | Aircraft | Simple aircraft silhouette |
| `vehicle` | Ground vehicle | Simple car/truck |
| `tower` | ATC | Control tower |
| `runway` | Runway | Two parallel lines |
| `map` | Minimap | Folded map |
| `settings` | Configuration | Gear |
| `user` | Profile | Person silhouette |
| `play` | Start/Continue | Triangle |
| `retry` | Retry attempt | Circular arrow |

---

## 7. Motion & Animation

### 7.1 Timing Standards

| Duration | Usage | Easing |
|----------|-------|--------|
| **100ms** | Micro-interactions (hover, press) | ease-out |
| **200ms** | State changes (toggle, select) | ease-in-out |
| **300ms** | Panel transitions | ease-out |
| **500ms** | Screen transitions | ease-in-out |
| **1000ms** | Loading states | linear |

### 7.2 Animation Patterns

| Pattern | Description | Duration |
|---------|-------------|----------|
| **Fade In** | Opacity 0 → 1 | 200ms |
| **Slide Up** | Y +20px → 0, fade in | 300ms |
| **Scale Pop** | Scale 0.95 → 1, fade in | 200ms |
| **Pulse** | Scale 1 → 1.05 → 1 (loop) | 1000ms |
| **Spin** | Rotation 0 → 360 (loop) | 1000ms |

### 7.3 MicButton States Animation

```
idle        → listening:   Scale 1 → 1.1, Cyan glow fade in (200ms)
listening   → processing:  Pulse animation, spinner overlay
processing  → success:     Green flash, checkmark pop (300ms)
processing  → fail:        Red shake, X pop (300ms)
```

---

## 8. Spacing System

### 8.1 Base Unit
**4px base unit** - All spacing uses multiples of 4px.

### 8.2 Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `space-0` | 0px | No spacing |
| `space-1` | 4px | Tight elements |
| `space-2` | 8px | Related elements |
| `space-3` | 12px | Default gap |
| `space-4` | 16px | Card padding |
| `space-5` | 20px | Section gap |
| `space-6` | 24px | Large gap |
| `space-8` | 32px | Screen padding |
| `space-10` | 40px | Major sections |
| `space-12` | 48px | Hero spacing |
| `space-16` | 64px | Screen margins |

### 8.3 Layout Constants

| Constant | Value | Usage |
|----------|-------|-------|
| `card-radius` | 16px | Card corners |
| `button-radius` | 8px | Button corners |
| `input-radius` | 8px | Input corners |
| `modal-radius` | 24px | Modal corners |
| `border-width` | 1px | Default borders |
| `border-width-focus` | 2px | Focus states |

---

## 9. Shadow System

### 9.1 Elevation Levels

| Level | Shadow | Usage |
|-------|--------|-------|
| **Elevation-0** | none | Flat elements |
| **Elevation-1** | `0 1px 3px rgba(0,0,0,0.3)` | Cards, buttons |
| **Elevation-2** | `0 4px 6px rgba(0,0,0,0.4)` | Dropdowns, popovers |
| **Elevation-3** | `0 10px 20px rgba(0,0,0,0.5)` | Modals, dialogs |
| **Elevation-4** | `0 20px 40px rgba(0,0,0,0.6)` | Floating panels |

### 9.2 Glow Effects

| State | Glow | Usage |
|-------|------|-------|
| **Focus** | `0 0 0 3px rgba(6,182,212,0.3)` | Focused inputs |
| **Active-Cyan** | `0 0 20px rgba(6,182,212,0.5)` | Mic listening |
| **Success** | `0 0 20px rgba(34,197,94,0.5)` | Success flash |
| **Error** | `0 0 20px rgba(239,68,68,0.5)` | Error flash |

---

## 10. Security & Compliance

### 10.1 Visual Security Rules

1. **NO real RSAF insignia** - Use generic military-style badges
2. **NO real airbase layouts** - All maps are fictional
3. **NO identifiable landmarks** - Generic Singapore skyline only
4. **NO classified procedures** - Training content is unclassified only
5. **Fictionalized callsigns** - Use "Hotel" series, not real designations

### 10.2 Placeholder Assets

| Real Element | Replacement |
|--------------|-------------|
| RSAF Logo | Generic "TRAINING" badge |
| Airbase name | "ALPHA BASE" |
| Unit designations | "Training Unit" |
| Real aircraft | Generic silhouettes |

---

## Appendix A: Unity Color Definitions

```csharp
// DesignTokens.cs - Color Definitions
public static class RTTrainerColors
{
    // Base Palette
    public static readonly Color Slate900 = new Color(0.06f, 0.09f, 0.16f);
    public static readonly Color Slate800 = new Color(0.12f, 0.16f, 0.23f);
    public static readonly Color Slate700 = new Color(0.20f, 0.25f, 0.33f);
    public static readonly Color Slate600 = new Color(0.28f, 0.33f, 0.41f);
    public static readonly Color Slate400 = new Color(0.58f, 0.64f, 0.72f);
    public static readonly Color Slate200 = new Color(0.89f, 0.91f, 0.94f);
    public static readonly Color Charcoal = new Color(0.09f, 0.09f, 0.11f);

    // Accent Palette
    public static readonly Color AmberWarning = new Color(0.96f, 0.62f, 0.04f);
    public static readonly Color AmberLight = new Color(0.99f, 0.83f, 0.30f);
    public static readonly Color CyanInfo = new Color(0.02f, 0.71f, 0.83f);
    public static readonly Color CyanLight = new Color(0.40f, 0.91f, 0.98f);
    public static readonly Color GreenSuccess = new Color(0.13f, 0.77f, 0.37f);
    public static readonly Color GreenLight = new Color(0.53f, 0.94f, 0.67f);
    public static readonly Color RedCritical = new Color(0.94f, 0.27f, 0.27f);
    public static readonly Color RedLight = new Color(0.99f, 0.65f, 0.65f);
}
```

---

## Appendix B: Asset Checklist

### Fonts to Import
- [ ] Inter (Regular, SemiBold, Bold)
- [ ] JetBrains Mono (Regular, Bold)

### Textures to Create
- [ ] Asphalt base (tileable)
- [ ] Concrete base (tileable)
- [ ] Runway markings atlas
- [ ] Taxiway markings atlas
- [ ] Signage atlas

### Materials to Create
- [ ] Ground_Asphalt_Mat
- [ ] Ground_Concrete_Mat
- [ ] Building_Concrete_Mat
- [ ] Building_Metal_Mat
- [ ] Vehicle_Base_Mat (with color property)
- [ ] Marking_Emissive_Mat

### Prefabs to Create
- [ ] TrafficCone_Prefab
- [ ] Barricade_Prefab
- [ ] RunwaySign_Prefab
- [ ] TaxiwaySign_Prefab
- [ ] RunwayLight_Prefab
- [ ] TaxiwayLight_Prefab
