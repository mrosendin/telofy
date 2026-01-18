# Goalmax

**Turn intention into execution.**

An AI-powered accountability system that transforms your objectives into completed days.

## What is Goalmax?

Goalmax = *telos* (purpose / end goal) + *-fy* (to make)

You define the objective function. Goalmax handles execution.

- **Not a wellness app.** A system that ensures you do what you said mattered.
- **Not a coach.** An execution layer that detects deviations and course-corrects.
- **Not a todo list.** An AI that breaks objectives into time-bound, actionable tasks.

## Features

- 🎯 **Objective-First Design** — Define what you want to achieve, not just what to do
- 📅 **Intelligent Scheduling** — AI generates tasks that fit your available time blocks
- 🔔 **Push Notifications** — Timely reminders with escalation for missed tasks
- 📊 **Execution Tracking** — Status-oriented progress monitoring ("on track", "deviation detected")
- 🤖 **AI Recalibration** — Automatic plan adjustments when life happens

## Tech Stack

- **Expo SDK 54** with file-based routing (expo-router)
- **React Native** for iOS & Android
- **TypeScript** in strict mode
- **Nativewind** (Tailwind CSS for React Native)
- **Zustand** + Immer for state management
- **MMKV** for fast local storage
- **OpenAI GPT-4** for AI features
- **TanStack Query** for data fetching

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Expo CLI
- iOS Simulator or Android Emulator (or physical device)

### Installation

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm start
```

### Environment Setup

Create a `.env.local` file:

```
EXPO_PUBLIC_OPENAI_API_KEY=sk-your-api-key-here
```

### Running the App

```bash
# iOS Simulator
pnpm ios

# Android Emulator
pnpm android

# Web
pnpm web
```

## Project Structure

```
app/                    # Expo Router pages
  (tabs)/              # Tab navigation (Status, Tasks, Objective, Settings)
components/            # Reusable UI components
lib/
  store/               # Zustand stores
  api/                 # API clients (OpenAI)
  hooks/               # Custom React hooks
  utils/               # Utility functions
  types/               # TypeScript types
assets/                # Fonts, images, icons
```

## Development

### Code Style

- Nativewind for styling (Tailwind classes via `className`)
- Dark mode is default
- Brand colors under `goalmax.*` in tailwind.config.js
- Status-oriented language in UI

### Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for preview
pnpm build:preview

# Build for production
pnpm build:prod
```

## Brand Guidelines

**Voice**: Direct, system-like, authoritative but not hostile

**Language**:
- ✅ "On track", "Deviation detected", "Recalibrating"
- ❌ Cheerleading, emojis, motivational fluff

**Positioning**:
> "The AI that ensures you do what you said mattered."

## License

Private. All rights reserved.
