# RADStrat - Radio Speech-To-Text Analyzer

> Local React + Node application with dual realtime Speech-to-Text analysis for radio communication training.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Status](https://img.shields.io/badge/status-MVP-yellow)

## Overview

RADStrat is a training tool for learning proper radio communications. It provides:

- **Scenario-based questions** with multiple-choice answers
- **Push-to-talk** audio capture
- **Dual STT comparison** (OpenAI vs ElevenLabs) side-by-side
- **Realtime transcription** with live updates
- **Deterministic scoring** based on Clarity, Pace, and Structure
- **Cost estimation** per attempt

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- OpenAI API key
- ElevenLabs API key

### Installation

```bash
# Clone the repository
git clone https://github.com/DigitalxVault/RADStrat.git
cd RADStrat

# Install dependencies
pnpm install

# Configure environment
cp apps/server/.env.example apps/server/.env
# Edit .env with your API keys

# Start development
pnpm dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start both web and server in development mode |
| `pnpm dev:web` | Start only the web app |
| `pnpm dev:server` | Start only the API server |
| `pnpm build` | Build both apps for production |
| `pnpm start` | Start production server |
| `pnpm test` | Run all tests |
| `pnpm lint` | Lint all workspaces |
| `pnpm typecheck` | Type-check all workspaces |

## Project Structure

```
RADStrat/
├── .claude/              # Claude Code configuration
├── .playwright-mcp/      # Playwright MCP configuration
├── apps/
│   ├── web/              # React + Vite frontend
│   ├── server/           # Express API server
│   └── style-guide/      # UI style guide preview
├── packages/
│   └── shared/           # Shared TypeScript types
└── documents/            # Project documentation
    ├── PRD.md            # Product Requirements Document
    ├── CHANGELOG.md      # Version history
    ├── TASKS.md          # Development task tracker
    └── style-guides/     # Design style guides
```

## Configuration

### Environment Variables (Server)

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 3001) |
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `ELEVENLABS_API_KEY` | ElevenLabs API key | Yes |
| `REALTIME_MODE` | `direct` or `proxy` | No (default: direct) |
| `CORS_ORIGIN` | Allowed CORS origin | No (default: localhost:5173) |

### App Configuration (Web)

Edit `apps/web/src/data/app_config.json` to customize:

- Scoring weights and thresholds
- Pace targets (WPM ranges)
- Timeout durations
- Feature flags

## Scoring System

### Metrics

| Metric | Weight | Description |
|--------|--------|-------------|
| **Clarity** | 40% | Transcript similarity minus filler penalties |
| **Pace** | 30% | WPM and pause analysis |
| **Structure** | 30% | Radio terminology compliance |

### Formula

```
overall = 0.40 × clarity + 0.30 × pace + 0.30 × structure
```

## Documentation

- [PRD](documents/PRD.md) - Product Requirements Document
- [CHANGELOG](documents/CHANGELOG.md) - Version history
- [TASKS](documents/TASKS.md) - Development task tracker
- [Style Guides](documents/style-guides/) - Design documentation

## Security

- API keys stored server-side only
- Short-lived tokens for provider connections
- CORS restricted to localhost
- Rate limiting on all endpoints
- No unsafe HTML rendering

## License

UNLICENSED - Private project for MAGES STUDIO
