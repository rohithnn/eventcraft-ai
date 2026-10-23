# EventCraft AI – GenAI Event Planning Assistant

> A production-quality, context-aware event planning application powered by Google Gemini 3.8 Flash (`@google/genai` SDK), React 19, TypeScript, Express, and Tailwind CSS. Organizes weddings, milestone birthdays, and community gatherings with structured budgets, backward-planned timelines, vendor checklists, and curated celebration ideas.

---

## Architecture Diagram

```
┌───────────────────────────────────────────────────────────────────────────┐
│                           Client (React 19 + Vite)                        │
├───────────────────────────────────────────────────────────────────────────┤
│  [ Header / Event Switcher / Dark Mode / Sample Presets / Export Modal ]   │
│                                                                           │
│   ┌────────────────────┬────────────────────┬────────────────────────┐    │
│   │  AI Budget Planner │  Backward Timeline │   Vendor Directory     │    │
│   │  (SVG Donut+Table) │  (Progress Bar)    │   (AI Vetting Modal)   │    │
│   ├────────────────────┴────────────────────┴────────────────────────┤    │
│   │    Personalized Ideas (Themes / Decor / Menu / Activities)       │    │
│   │    Context-Aware Streaming Chat Assistant (Server SSE)           │    │
│   └──────────────────────────────────────────────────────────────────┘    │
│                                                                           │
│       Hooks: useEventPlan | useGemini | useTheme | useLocalStorage         │
│       Services: geminiService (Cache + Backoff) | storageService | PDF    │
│       Sanitization: XSS Escaper & Prompt-Injection Guard                  │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │ HTTP /api/* & SSE Streams
┌─────────────────────────────────────▼─────────────────────────────────────┐
│                       Full-Stack Backend (Express / Node)                 │
├───────────────────────────────────────────────────────────────────────────┤
│  • POST /api/plan/generate    (Zod-validated structured JSON output)      │
│  • POST /api/ideas/generate   (Dynamic multi-category creative themes)    │
│  • POST /api/vendor/questions (Tailored vendor vetting question generator)│
│  • POST /api/chat/stream      (Server-Sent Events streaming chat)         │
│  • Gemini SDK Client: GoogleGenAI with 'aistudio-build' telemetry header   │
│  • Strict System Instruction: Domain restriction + Injection Guard        │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │
                                      ▼
                      Google Gemini 3.8 Flash API
```

---

## Core Features & Problem Statement Alignment

1. **Event Setup Wizard & 3 Instant Prebuilt Samples**
   - Captures Event Type (`wedding`, `birthday`, `community`, `custom`), Target Date, Guest Count, City, Total Budget, Currency, Theme Vibe, Cultural Preferences, Dietary Needs, and Accessibility Accommodations.
   - Includes 3 prebuilt, reviewer-ready plans for immediate exploration:
     - 🌸 *Maya & Julian’s Botanical Garden Wedding* ($28k, 120 guests, Seattle)
     - 🕹️ *Leo’s 30th Neon Synthwave Arcade Bash* ($4.2k, 45 guests, Austin)
     - 🌿 *Oakwood Neighborhood Spring Block Fair* ($9.5k, 350 guests, Denver)

2. **AI Budget Planner**
   - Structured JSON breakdown across 7 primary categories: *Venue, Catering, Decor, Photography, Entertainment, Attire, Misc/Contingency*.
   - Interactive SVG Donut Chart with percentage slices, category legends, and accessible table alternative.
   - Inline table editing for allocated targets and actual spent costs with auto-recalculating totals.
   - Real-time over-budget alerts (both allocated target and actual cash spend) with non-color-only icons and badges.
   - Proportional rebalancing tool when adjusting overall event budget.

3. **Backward-Planned Timeline Generator**
   - Automatically reverse-schedules milestones based on target event date (e.g., 6 months before, 3 months before, 1 month before, 2 weeks before, day-of).
   - Dynamic countdown badge (*X days until event*).
   - Overall preparation progress bar tracking completed vs pending tasks.
   - Filter by status (*All / Incomplete / Completed*) and instant keyword search.
   - Add custom milestones with category tags and assignees.

4. **Vendor Directory & AI Vetting Questions**
   - Track vendors by category with contact details, quoted prices, and workflow status (`Shortlisted`, `Booked`, `Paid`).
   - "Ask Vendor" button triggers an AI modal suggesting high-impact, category-tailored questions (hidden fees, rain contingency, overtime rates).
   - Check off asked questions or copy them with one click.

5. **Curated & Personalized Ideas**
   - 5 structured inspiration sections: *Themes & Palettes, Decor & Ambiance, Custom Menu & Signature Drinks, Interactive Games & Moments, Return Gifts*.
   - Filter by category or view "Saved / Pinned" ideas.
   - "Regenerate Ideas" with custom user focus prompts (e.g. *"Focus on autumnal rustic colors"*).

6. **Context-Aware Streaming Chat Assistant**
   - Deeply context-aware: automatically receives current event title, date, guest count, city, budget, timeline tasks, and vendor commitments.
   - Real-time streaming token delivery via Server-Sent Events (SSE).
   - Suggested quick prompts (e.g., *"How can I shave 15% off venue and catering?"*, *"Day-of emergency checklist"*).
   - Safe formatting renderer (bullet points, bold highlights) without raw `dangerouslySetInnerHTML`.

7. **Persistence & Multi-Event Management**
   - LocalStorage persistence under versioned schema (`eventcraft_v1_events`).
   - Resilient against corrupted data with automatic fallback recovery to sample blueprints.
   - Seamlessly switch between multiple saved events, create new ones, or delete finished plans.

8. **Export & Sharing**
   - Download complete 4-part PDF dossiers generated client-side with `jspdf`.
   - Export/import structured `.json` backup files validated with strict Zod schemas.
   - Sync backward-planned milestones to Google, Apple, or Outlook Calendar via RFC 5545 `.ics` calendar files.
   - Print-friendly stylesheets (`@media print`) and clean paper print layouts.
   - Copy plain text summary to clipboard for email or instant messaging.

---

## Security & Prompt Injection Defense

- **Zero Client-Side Key Exposure**: The Gemini API key (`GEMINI_API_KEY`) is strictly accessed on the Node.js backend.
- **Server Rate Limiter**: Express in-memory sliding-window IP rate limiter on all `/api/*` routes (100 req/min) prevents quota exhaustion and brute-force DoS.
- **Comprehensive Security Headers**: Content-Security-Policy (CSP), Referrer-Policy, Permissions-Policy, `X-Content-Type-Options: nosniff`, and `X-Frame-Options: SAMEORIGIN`.
- **Server-Side Request Validation**: Every endpoint (`/api/plan/generate`, `/api/vendor/questions`, `/api/ideas/generate`, `/api/chat/stream`) validates request payloads with Zod schemas.
- **Prompt-Injection Guard**: Server system instructions strictly enforce the event planning role, directing Gemini to ignore prompt attempts trying to alter instructions or switch personas. Multi-pattern regex scanner rejects injection attacks (`DAN mode`, `developer mode`, `system prompt override`).
- **Sanitization Layer**:
  - `sanitizeUserInput`: Truncates inputs to strict boundaries and strips control characters.
  - `escapeHtml`: Escapes special characters (`& < > " ' /`) to prevent cross-site scripting (XSS).
  - Safe text parser replaces markdown formatting without invoking unsanitized HTML injection.
- **Client-Side Cooldown & Caching**: Prevents API spamming with minimum debounce intervals, deterministic input hashing for instant cache hits, and exponential backoff on transient errors.

---

## Accessibility (WCAG 2.1 AA)

- **Semantic Landmark Structure**: `header`, `nav`, `main`, `section`, `footer` with clear heading hierarchy (`h1` -> `h4`).
- **Keyboard Navigation & Focus Management**:
  - Visible focus rings (`focus-visible:ring-2 focus-visible:ring-rose-500`).
  - Accessible Skip-to-Content link (`#main-content`).
  - Strict modal Tab focus cycling (traps focus within active modal and restores previous focus upon close).
  - Dialog `Escape` key close handlers on all modals.
- **Non-Color Dependent Indicators**: Over-budget states, task completion, and priority levels pair colors with icons (`AlertTriangle`, `CheckCircle2`) and explicit descriptive text.
- **Data Table Fallback**: The Donut Chart provides descriptive ARIA labels, tab-focusable slices, and a full companion data table fallback.
- **Color Contrast & Dark Mode**: Minimum 4.5:1 contrast ratios in both light and dark modes with system preference auto-detection.
- **Touch Target Sizes**: All interactive buttons, tabs, and checkboxes feature touch areas >= 44x44px.

---

## Testing

The project is backed by a suite of 41 automated tests across 9 test files using **Vitest** and **React Testing Library**:

- **Budget Math & Over-Budget Logic** (`src/test/budgetUtils.test.ts`): Over-allocation detection, negative balances, percentage recalculations, zero/empty edge cases, proportional rebalancing.
- **Backward Timeline Calculations** (`src/test/dateUtils.test.ts`): Anchor date subtractions, countdowns, overdue checks.
- **iCalendar Export Verification** (`src/test/calendarExport.test.ts`): RFC 5545 format compliance, event count parity, date format sanitization.
- **Zod Schema Validation** (`src/test/eventSchema.test.ts`): Wizard inputs, vendor questions schemas, ideas schemas, chat stream schemas, and full event plan recovery schemas.
- **Storage Resilience** (`src/test/storageService.test.ts`): Corrupted JSON recovery, multi-event mutations, active ID persistence.
- **Input Sanitizer & Guard** (`src/test/sanitizer.test.ts`): Script tag stripping, XSS escapes, adversarial prompt injection pattern detection.
- **Gemini Service Layer** (`src/test/geminiService.test.ts`): Mocked generation, 429 rate limit backoff, in-memory caching.
- **Component Behaviors** (`src/test/components.test.tsx`): Task toggles, Donut Chart SVG accessibility, ErrorBoundary fallbacks.
- **End-to-End Workflow** (`src/test/e2eFlow.test.tsx`): Event selection -> Budget modification -> Over-budget badge assertion -> Export modal.

To run tests:
```bash
npm test
```

---

## Setup & Running Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Environment Variables**:
   Copy `.env.example` to `.env` and set your key:
   ```env
   GEMINI_API_KEY="your-gemini-api-key"
   PORT=3000
   ```
3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.
