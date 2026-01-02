# GenAI R/T Trainer - Content Style Guide

> **Version**: 1.0
> **Last Updated**: December 2024
> **Project**: RSAF Ground R/T Training Simulator

---

## 1. Overview

This guide establishes standards for all written content in the R/T Trainer, including:
- Scenario scripts and dialogues
- R/T phraseology standards
- UI text and labels
- Feedback and instructional text
- Question and answer content

---

## 2. R/T Phraseology Standards

### 2.1 Core Principles

| Principle | Description |
|-----------|-------------|
| **Brevity** | Say only what is necessary |
| **Clarity** | Unambiguous language, no colloquialisms |
| **Standardization** | Use established phraseology consistently |
| **Confirmation** | Read back critical information |

### 2.2 Callsign Format

**Ground Vehicle Callsigns**:
```
Format: [Phonetic Word] + [Number]

Examples:
- Hotel 70 (H70)
- Romeo 45 (R45)
- Sierra 12 (S12)
- Foxtrot 88 (F88)
```

**Role-Based Prefixes** (Training Use):
| Role | Typical Callsigns |
|------|-------------------|
| Security | Hotel series (H70, H71) |
| Bowser | Bravo series (B10, B15) |
| Fire Tender | Foxtrot series (F88, F90) |
| AFE | Alpha series (A20, A25) |
| Contractor | Charlie series (C30, C35) |

**ATC Callsigns**:
| Position | Callsign |
|----------|----------|
| Ground Control | "Ground" or "[Airfield] Ground" |
| Tower | "Tower" or "[Airfield] Tower" |
| Apron Control | "Apron" |

### 2.3 Standard Phrases

#### Acknowledgments
| Phrase | Usage |
|--------|-------|
| "Roger" | Message received and understood |
| "Wilco" | Will comply (with instruction) |
| "Affirm" | Yes / Affirmative |
| "Negative" | No / Permission not granted |
| "Say again" | Request repetition |
| "Standby" | Wait, I will call you |
| "Copy" | I have received your message |

#### Movement Instructions
| Instruction | Standard Response |
|-------------|-------------------|
| "Hold position" | "[Callsign], holding position" |
| "Hold short [location]" | "[Callsign], hold short [location]" |
| "Taxi via [route]" | "[Callsign], taxi via [route]" |
| "Cross runway [number]" | "[Callsign], crossing runway [number]" |
| "Cleared to cross" | "[Callsign], cleared to cross [runway]" |
| "Give way to [traffic]" | "[Callsign], giving way to [traffic]" |

#### Request Patterns
| Request Type | Format |
|--------------|--------|
| Cross runway | "[Callsign], request cross runway [number]" |
| Taxi clearance | "[Callsign], request taxi to [destination]" |
| Position | "[Callsign], request position [location]" |
| Operations | "[Callsign], request [operation] at [location]" |

### 2.4 Phonetic Alphabet

| Letter | Word | Pronunciation |
|--------|------|---------------|
| A | Alpha | AL-FAH |
| B | Bravo | BRAH-VOH |
| C | Charlie | CHAR-LEE |
| D | Delta | DELL-TAH |
| E | Echo | ECK-OH |
| F | Foxtrot | FOKS-TROT |
| G | Golf | GOLF |
| H | Hotel | HOH-TEL |
| I | India | IN-DEE-AH |
| J | Juliet | JEW-LEE-ETT |
| K | Kilo | KEY-LOH |
| L | Lima | LEE-MAH |
| M | Mike | MIKE |
| N | November | NO-VEM-BER |
| O | Oscar | OSS-CAH |
| P | Papa | PAH-PAH |
| Q | Quebec | KEH-BECK |
| R | Romeo | ROW-ME-OH |
| S | Sierra | SEE-AIR-RAH |
| T | Tango | TANG-GO |
| U | Uniform | YOU-NEE-FORM |
| V | Victor | VIK-TAH |
| W | Whiskey | WISS-KEY |
| X | X-ray | ECKS-RAY |
| Y | Yankee | YANG-KEY |
| Z | Zulu | ZOO-LOO |

### 2.5 Number Pronunciation

| Number | Pronunciation |
|--------|---------------|
| 0 | ZE-RO |
| 1 | WUN |
| 2 | TOO |
| 3 | TREE |
| 4 | FOW-ER |
| 5 | FIFE |
| 6 | SIX |
| 7 | SEV-EN |
| 8 | AIT |
| 9 | NIN-ER |
| 100 | HUN-DRED |
| 1000 | TOU-SAND |

**Runway Numbers**: Pronounced digit by digit
- Runway 02 = "Runway zero two"
- Runway 27 = "Runway two seven"

---

## 3. Scenario Writing Standards

### 3.1 Scenario Structure

Every scenario follows this template:

```json
{
  "scenarioId": "SCN_[CATEGORY]_[NUMBER]",
  "title": "Brief descriptive title",
  "role": "Role performing the task",
  "environment": "Day | Night",
  "startLocation": "Starting position",
  "objective": "Clear statement of what to accomplish",
  "controllerPersona": "Which ATC position",
  "steps": [...]
}
```

### 3.2 Scenario Categories

| Category Code | Description | Example |
|---------------|-------------|---------|
| `RWY` | Runway operations | Crossing, holding short |
| `TWY` | Taxiway operations | Taxi clearance, routing |
| `PKG` | Parking/Dispersal | Entering/leaving stands |
| `OPS` | Special operations | Fuel, firefighting |
| `EMG` | Emergency procedures | Incidents, evacuations |
| `COM` | Communication basics | Initial contact, handoffs |

### 3.3 Step Writing Rules

#### ATC Instruction Format
```
Clear, direct, unambiguous

GOOD: "Hotel 70, hold position. Standby."
BAD:  "Uh, Hotel 70, could you maybe stop there?"

GOOD: "Hotel 70, taxi via Alpha, hold short Runway 02."
BAD:  "Hotel 70, go down Alpha and stop before the runway."
```

#### Response Option Writing

**Correct Answer**:
- Must be exact standard phraseology
- Include full callsign
- Read back critical instructions

**Incorrect Options** (Distractors):
1. **Partial response**: Missing elements (no callsign, no readback)
2. **Wrong acknowledgment**: Using incorrect phrase
3. **Non-standard**: Casual language that would not be used
4. **Inappropriate action**: Response that implies wrong action

**Example**:
```json
{
  "atcText": "Hotel 70, taxi via Alpha, hold short Runway 02.",
  "mcqOptions": [
    {
      "id": "A",
      "text": "Hotel 70, taxi via Alpha, hold short Runway 02.",
      "isCorrect": true
    },
    {
      "id": "B",
      "text": "Copy, taxiing.",
      "isCorrect": false,
      "distractor_type": "partial"
    },
    {
      "id": "C",
      "text": "Roger, Alpha to Runway 02.",
      "isCorrect": false,
      "distractor_type": "incomplete_readback"
    },
    {
      "id": "D",
      "text": "Hotel 70, unable.",
      "isCorrect": false,
      "distractor_type": "inappropriate"
    }
  ]
}
```

### 3.4 Difficulty Scaling

| Tier | Characteristics |
|------|-----------------|
| **Easy** | Single instruction, long response time, clear context |
| **Medium** | Multiple elements to readback, moderate time pressure |
| **Hard** | Complex routing, short response time, distracting conditions |
| **Expert** | Multiple simultaneous instructions, emergency context |

**Time Limits by Difficulty**:
| Difficulty | Time Limit |
|------------|------------|
| Easy | 20 seconds |
| Medium | 15 seconds |
| Hard | 10 seconds |
| Expert | 8 seconds |

### 3.5 Feedback Writing

#### Correct Answer Feedback
```
Format: [Confirmation] + [Brief explanation if educational]

Examples:
- "Correct. Full readback confirms you received and understood the instruction."
- "Correct acknowledgement and compliance."
- "Well done. Including the callsign at the end confirms the transmission."
```

#### Incorrect Answer Feedback
```
Format: [What was wrong] + [What the correct response should be]

Examples:
- "Incorrect. Missing hold short readback. The correct response is: 'Hotel 70, taxi via Alpha, hold short Runway 02.'"
- "Partial response. Always include your callsign and readback critical instructions."
- "'Unable' is used when you cannot comply. In this case, you should acknowledge with 'Roger, holding position.'"
```

---

## 4. UI Text Standards

### 4.1 Voice and Tone

| Context | Voice | Example |
|---------|-------|---------|
| Instructions | Direct, professional | "Speak the selected response exactly as shown." |
| Feedback (positive) | Encouraging, brief | "Correct. Well done." |
| Feedback (negative) | Supportive, educational | "Not quite. Review the standard readback format." |
| Error messages | Helpful, solution-focused | "Microphone not detected. Check your audio settings." |
| Hints | Suggestive, not revealing | "Consider: What must you always readback?" |

### 4.2 Button Labels

| Action | Label | Notes |
|--------|-------|-------|
| Start activity | "Start" or "Begin" | Not "Go" or "Play" |
| Continue | "Continue" or "Next" | With arrow icon |
| Go back | "Back" | With back arrow |
| Retry | "Retry" or "Try Again" | With retry icon |
| Submit answer | "Submit" | For explicit submission |
| Cancel | "Cancel" | For modal dismissal |
| Close | "Close" or X icon | For information modals |

### 4.3 Label Writing

**Capitalization**:
- Sentence case for UI labels: "Voice quality"
- Title case for section headers: "Quality Matrix"
- ALL CAPS only for callsigns: "HOTEL 70"

**Abbreviations**:
| Abbreviation | Meaning | Use When |
|--------------|---------|----------|
| R/T | Radio Telephony | Always spelled out on first use |
| ATC | Air Traffic Control | Common, can use without defining |
| MCQ | Multiple Choice Question | Internal only, not shown to users |
| Sec | Seconds | In timer displays |

### 4.4 Status Messages

| State | Message |
|-------|---------|
| Loading | "Loading..." |
| Processing voice | "Processing..." |
| Saving | "Saving progress..." |
| Success | "Saved" or specific confirmation |
| Error | Specific error + suggested action |

### 4.5 Empty States

| Screen | Empty State Message | CTA |
|--------|---------------------|-----|
| Progress (no history) | "No training history yet" | "Start your first session" |
| Scenarios (locked) | "Complete Theory mode to unlock Scenarios" | "Go to Theory" |
| Radio Log (start) | "Waiting for communication..." | None |
| Recommendations | "Complete more exercises for personalized tips" | None |

---

## 5. Question Writing Standards

### 5.1 Question Types

**Recognition Questions** (Theory Mode):
```
Format: Present a situation, ask to identify correct response

Example:
"Ground Controller says: 'Hotel 70, hold short Runway 02.'
What is the correct response?"
```

**Application Questions** (Voice Mode):
```
Format: Present context, require spoken response

Example:
"You are Hotel 70 at taxiway Alpha. Ground clears you to cross Runway 02.
Select AND speak the correct response."
```

**Scenario Questions** (Real-time):
```
Format: Embedded in simulation context

Example:
[Audio plays ATC instruction]
[Timer starts]
[Options appear]
"Respond to Ground Control"
```

### 5.2 Question Stem Rules

1. **Be specific**: Include all context needed to answer
2. **Avoid negatives**: Don't ask "Which is NOT correct?"
3. **One concept per question**: Don't combine multiple learning points
4. **Realistic context**: Use plausible scenarios

**Good Example**:
```
You are Security vehicle Hotel 70 at the service road intersection.
You need to cross Runway 02 to reach Hangar Block B.
What is the correct initial transmission to Ground Control?
```

**Bad Example**:
```
What do you say to ATC? (Too vague)
Which of these would you NOT say? (Negative framing)
```

### 5.3 Answer Option Rules

1. **Parallel structure**: All options should have similar length and format
2. **Plausible distractors**: Wrong answers should be believable mistakes
3. **No "all/none of the above"**: Avoid these option types
4. **Randomize correct position**: Don't always make A correct

**Distractor Categories**:
| Type | Description | Example |
|------|-------------|---------|
| Omission | Missing required element | No callsign |
| Commission | Adds incorrect element | Wrong runway number |
| Sequence | Correct elements, wrong order | Callsign at wrong position |
| Register | Wrong formality level | "Okay, doing that" |
| Confusion | Similar-sounding phrase | "Roger" vs "Wilco" misuse |

---

## 6. Localization Considerations

### 6.1 Content That Stays in English

- All R/T phraseology (international standard)
- Callsigns
- Location identifiers (Runway 02, Taxiway Alpha)
- Standard aviation terms

### 6.2 Content That Can Be Localized

- UI labels and instructions
- Feedback messages
- Tutorial text
- Help documentation
- Error messages

### 6.3 Translation Notes

When preparing content for translation:
1. Mark R/T phraseology as non-translatable
2. Provide context notes for translators
3. Avoid idioms and culture-specific references
4. Use consistent terminology (maintain glossary)

---

## 7. Accessibility Writing

### 7.1 Screen Reader Text

**Alt Text for Icons**:
| Icon | Alt Text |
|------|----------|
| Mic (idle) | "Microphone button, tap to start recording" |
| Mic (listening) | "Recording in progress" |
| Check | "Correct" |
| X | "Incorrect" |
| Timer | "Time remaining: [X] seconds" |

**ARIA Labels**:
| Element | ARIA Label |
|---------|------------|
| Options list | "Answer options, select one" |
| Progress bar | "Progress: [X] percent complete" |
| Score display | "Score: [X] percent" |

### 7.2 Clear Instructions

For voice input:
```
Standard: "Tap to speak"
Expanded: "Tap the microphone button to start recording your response.
Speak clearly and at a moderate pace. Tap again or wait 2 seconds
to finish recording."
```

---

## 8. Example Scenarios

### 8.1 Basic Scenario (Easy)

```json
{
  "scenarioId": "SCN_COM_01",
  "title": "Initial Contact with Ground",
  "role": "SecurityTrooper",
  "environment": "Day",
  "startLocation": "Gate Charlie",
  "objective": "Establish initial contact with Ground Control",
  "controllerPersona": "GroundController",
  "difficulty": "Easy",
  "steps": [
    {
      "stepId": "S1",
      "type": "player_initiate",
      "prompt": "You are Hotel 70 at Gate Charlie. Establish initial contact with Ground Control.",
      "mcqOptions": [
        {
          "id": "A",
          "text": "Ground, Hotel 70, Gate Charlie.",
          "isCorrect": true
        },
        {
          "id": "B",
          "text": "Hello Ground, this is Hotel 70.",
          "isCorrect": false
        },
        {
          "id": "C",
          "text": "Hotel 70 calling.",
          "isCorrect": false
        },
        {
          "id": "D",
          "text": "Ground Control, do you read?",
          "isCorrect": false
        }
      ],
      "expectedSpokenAnswer": "Ground, Hotel 70, Gate Charlie.",
      "timeLimitSec": 20,
      "onCorrect": {
        "nextStepId": "S2",
        "feedback": "Correct. Good initial contact format: [Station], [Callsign], [Position]."
      },
      "onWrong": {
        "feedback": "Standard initial contact format is: [Station you're calling], [Your callsign], [Your position].",
        "penalty": "none"
      }
    },
    {
      "stepId": "S2",
      "type": "atc_instruction",
      "atcAudioPrompt": "ground_response_hotel70.mp3",
      "atcText": "Hotel 70, Ground, go ahead.",
      "mcqOptions": [
        {
          "id": "A",
          "text": "Ground, Hotel 70, request taxi to Hangar Block.",
          "isCorrect": true
        },
        {
          "id": "B",
          "text": "I want to go to the hangar.",
          "isCorrect": false
        },
        {
          "id": "C",
          "text": "Roger.",
          "isCorrect": false
        },
        {
          "id": "D",
          "text": "Hotel 70, standby.",
          "isCorrect": false
        }
      ],
      "expectedSpokenAnswer": "Ground, Hotel 70, request taxi to Hangar Block.",
      "timeLimitSec": 20,
      "onCorrect": {
        "nextStepId": "END",
        "feedback": "Correct. Clear request format with destination specified."
      },
      "onWrong": {
        "feedback": "When responding to 'go ahead', state your request clearly with callsign and destination.",
        "penalty": "none"
      }
    }
  ]
}
```

### 8.2 Runway Crossing Scenario (Medium)

```json
{
  "scenarioId": "SCN_RWY_01",
  "title": "Vehicle Request to Cross Runway",
  "role": "SecurityTrooper",
  "environment": "Day",
  "startLocation": "Service Road Alpha",
  "objective": "Request and execute runway crossing clearance",
  "controllerPersona": "GroundController",
  "difficulty": "Medium",
  "steps": [
    {
      "stepId": "S1",
      "type": "player_initiate",
      "prompt": "You need to cross Runway 02 to reach Hangar Block B. Request crossing clearance.",
      "mcqOptions": [
        {
          "id": "A",
          "text": "Ground, Hotel 70, request cross Runway 02.",
          "isCorrect": true
        },
        {
          "id": "B",
          "text": "Hotel 70, crossing runway.",
          "isCorrect": false
        },
        {
          "id": "C",
          "text": "Ground, can I cross?",
          "isCorrect": false
        },
        {
          "id": "D",
          "text": "Request permission to proceed.",
          "isCorrect": false
        }
      ],
      "expectedSpokenAnswer": "Ground, Hotel 70, request cross Runway 02.",
      "timeLimitSec": 15,
      "onCorrect": {
        "nextStepId": "S2",
        "feedback": "Correct request format."
      },
      "onWrong": {
        "feedback": "Always include: [Station], [Callsign], [Request], [Runway number].",
        "penalty": "warning"
      }
    },
    {
      "stepId": "S2",
      "type": "atc_instruction",
      "atcAudioPrompt": "ground_hold_hotel70.mp3",
      "atcText": "Hotel 70, hold position. Traffic on final.",
      "mcqOptions": [
        {
          "id": "A",
          "text": "Hotel 70, holding position.",
          "isCorrect": true
        },
        {
          "id": "B",
          "text": "Roger, waiting.",
          "isCorrect": false
        },
        {
          "id": "C",
          "text": "Copy.",
          "isCorrect": false
        },
        {
          "id": "D",
          "text": "Hotel 70, crossing now.",
          "isCorrect": false
        }
      ],
      "expectedSpokenAnswer": "Hotel 70, holding position.",
      "timeLimitSec": 12,
      "onCorrect": {
        "nextStepId": "S3",
        "feedback": "Correct. Always acknowledge hold instructions with readback."
      },
      "onWrong": {
        "nextStepId": "S2_RETRY",
        "feedback": "CRITICAL: Hold instructions must be acknowledged with callsign and 'holding position'.",
        "penalty": "warning"
      }
    },
    {
      "stepId": "S3",
      "type": "atc_instruction",
      "atcAudioPrompt": "ground_clear_cross_hotel70.mp3",
      "atcText": "Hotel 70, cleared to cross Runway 02.",
      "mcqOptions": [
        {
          "id": "A",
          "text": "Cleared to cross Runway 02, Hotel 70.",
          "isCorrect": true
        },
        {
          "id": "B",
          "text": "Roger, crossing.",
          "isCorrect": false
        },
        {
          "id": "C",
          "text": "Hotel 70, wilco.",
          "isCorrect": false
        },
        {
          "id": "D",
          "text": "Copy, cleared.",
          "isCorrect": false
        }
      ],
      "expectedSpokenAnswer": "Cleared to cross Runway 02, Hotel 70.",
      "timeLimitSec": 12,
      "onCorrect": {
        "nextStepId": "END",
        "feedback": "Correct. Full readback of crossing clearance with runway number and callsign."
      },
      "onWrong": {
        "feedback": "Runway crossing clearances require full readback: '[Clearance], [Runway], [Callsign]'.",
        "penalty": "warning"
      }
    }
  ]
}
```

---

## 9. Content Review Checklist

### Pre-Publication Review

For each scenario:
- [ ] All R/T phraseology is standard and accurate
- [ ] Correct answers are unambiguously correct
- [ ] Distractors are plausible but clearly wrong
- [ ] Feedback is educational and constructive
- [ ] Time limits are appropriate for difficulty
- [ ] No security-sensitive information included
- [ ] Fictionalized locations and callsigns used
- [ ] Audio prompts match written text
- [ ] Spelling and grammar checked

### SME Review Points

- [ ] Phraseology accuracy verified by ATC/R/T expert
- [ ] Procedures reflect current standards
- [ ] Scenario situations are operationally realistic
- [ ] Training objectives are met

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| Readback | Repeating back an instruction to confirm receipt |
| Callsign | Unique identifier for a vehicle or aircraft |
| Clearance | Permission from ATC to perform a specific action |
| Hold short | Stop before reaching a specified point |
| Taxi | Ground movement of a vehicle on the airfield |
| R/T | Radio Telephony - voice communication procedures |
| ATC | Air Traffic Control |
| Ground | Ground Control position responsible for surface movement |
| Tower | Control Tower position responsible for runway operations |

---

## Appendix B: Common Mistakes Reference

| Mistake | Why It's Wrong | Correct Form |
|---------|----------------|--------------|
| "Copy that" | Non-standard casual phrase | "Roger" or "Copy" |
| "Affirmative" | Avoid - sounds like "negative" | "Affirm" |
| Missing callsign | Cannot confirm recipient | Always include callsign |
| "Okay" | Non-standard acknowledgment | "Roger" or "Wilco" |
| Runway without "Runway" | Ambiguous | "Runway 02" not "02" |
| "Over" at end | Ground R/T doesn't use | Omit |
| "Out" at end | Ground R/T doesn't use | Omit |
