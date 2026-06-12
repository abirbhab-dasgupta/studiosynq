<div align="center">

<img src="public/studiosynq-logo.jpg" alt="Studiosynq" width="64" height="64" style="border-radius: 12px;" />

# Studiosynq

> A collaborative AI workspace where teams think, build, and ship together — with five specialized AI agents built directly into the room.

[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=flat-square&logo=drizzle&logoColor=black)](https://orm.drizzle.team)
[![Vercel](https://img.shields.io/badge/Deployed_on_Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://studiosynq.vercel.app)

**[Live Demo →](https://studiosynq.vercel.app)**

</div>

---

## The Problem

Most teams use AI tools separately from where they actually work — switching between a chat app, a task board, a doc editor, and an AI assistant across different tabs. Context gets lost. Momentum breaks.

Studiosynq puts five AI agents inside your collaborative workspace. You call them inline while working with teammates, not after switching to some other tool.

---

## What It Does

You create a room and invite teammates. Inside the room you have a shared chat, a Kanban board, and a Pomodoro focus timer — all live and real-time. When you need AI help, you type `@CodeBuddy fix this` or `@ResearchBot what is X` and the agent responds inline in the conversation. Your whole team sees the exchange. No context switching. No copy-pasting.

---

## Features

| Feature | Description |
|---------|-------------|
| **5 AI Agents** | CodeBuddy, ClarityAgent, ResearchBot, DesignExpert, EmailWriter — each with a distinct system prompt and purpose |
| **6 AI Models** | GPT-OSS 120B, Llama 3.3 70B, Gemini 2.0 Flash, Gemini 1.5 Pro, Mistral Large, Codestral — user-selectable per agent |
| **Collaborative Rooms** | Create rooms, invite via link, manage members and join requests |
| **Room Chat** | Real-time messages via Pusher. Type `@AgentName` to invoke any agent inline; response saved and broadcast to all members |
| **Kanban Task Board** | Drag-and-drop (dnd-kit) across Todo → In Progress → Done. Full CRUD, mobile accordion fallback |
| **Focus Timer** | Per-room Pomodoro timer (25m / 5m / 15m). Pusher-synced presence, session logging, audio bell + browser notifications |
| **Agent Sessions** | Chat history persisted to PostgreSQL per agent per user — not localStorage |
| **Live Web Search** | ResearchBot integrates Tavily for current, cited research results |
| **Rate Limiting** | Upstash Redis sliding window (20 req/min) on all agent endpoints |
| **Dark / Light Mode** | True dual theme with warm amber/cream palette, grain overlay, smooth transitions |
| **Member Profiles** | Click any member in a room or focus sidebar to view their profile |

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 16 App Router | RSC, streaming, file-based routing |
| Language | TypeScript | End-to-end type safety |
| Database | Neon PostgreSQL | Serverless Postgres |
| ORM | Drizzle ORM | Type-safe queries, schema-as-code |
| Auth | BetterAuth | Sessions, username support |
| Real-time | Pusher (cluster ap2) | WebSocket channels for chat and timer sync |
| AI SDK | Vercel AI SDK | Unified streaming across providers |
| LLM Providers | Groq · Gemini · Mistral | Multi-provider with automatic fallback chain |
| Web Search | Tavily | Real-time search for ResearchBot |
| Rate Limiting | Upstash Redis | Edge-compatible sliding window |
| File Storage | Cloudinary | Avatar uploads |
| Styling | Tailwind CSS v4 | Utility-first with custom CSS token system |
| Drag and Drop | dnd-kit | Accessible Kanban drag-and-drop |
| Deployment | Vercel | Edge functions, automatic previews |

---

## AI Models

| Provider | Model | Purpose |
|----------|-------|---------|
| Groq | GPT-OSS 120B | Highest quality — complex reasoning and code |
| Groq | Llama 3.3 70B | Default — best balance of quality and speed |
| Gemini | Gemini 2.0 Flash | Latest Google model — fast and capable |
| Gemini | Gemini 1.5 Pro | Long context — best for documents and research |
| Mistral | Mistral Large | Best Mistral quality — reasoning and multilingual |
| Mistral | Codestral | Code specialist — generation and debugging |

All agents use a provider fallback chain (Groq → Gemini → Mistral), so the app works as long as at least one API key is set.

---

## The Agents

| Agent | What it does |
|-------|-------------|
| **CodeBuddy** | Paste code → bug diagnosis, fixed code, line-by-line explanation |
| **ClarityAgent** | Complex task → concrete step-by-step plan with time estimates |
| **ResearchBot** | Any question → cited, structured report via live Tavily web search |
| **DesignExpert** |  UI design , Visual guidance , Design critique |
| **EmailWriter** | Describe the email → polished professional draft with tone notes |

---

## Project Structure

```
app/
├── (app)/                        # Auth-protected routes
│   ├── agents/                   # Agent chat pages
│   ├── dashboard/                # Stats, activity, quick launch
│   ├── focus/                    # Pomodoro timer
│   ├── profile/                  # User profile
│   ├── rooms/                    # Room list
│   ├── tasks/                    # Task board picker
│   └── layout.tsx
├── api/
│   ├── activity/                 # Agent activity feed
│   ├── agent-sessions/[agentName]/  # Persistent chat history
│   ├── agents/[name]/            # LLM routing + streaming
│   ├── auth/                     # BetterAuth handlers
│   ├── focus-sessions/           # Pomodoro session logging
│   ├── join/                     # Room join requests
│   ├── notifications/            # In-app notifications
│   ├── profile/                  # User profile CRUD
│   ├── rooms/[id]/
│   │   ├── focus-broadcast/      # Pusher focus state sync
│   │   ├── invite/               # Invite link generation
│   │   ├── leave/                # Leave room
│   │   ├── members/              # Room membership
│   │   ├── messages/             # Room chat + @mention agents
│   │   ├── requests/             # Join request management
│   │   └── tasks/                # Kanban CRUD
│   ├── stats/                    # Dashboard statistics
│   └── upload/                   # Cloudinary avatar upload
├── auth/
│   ├── sign-in/
│   └── sign-up/
└── join/[token]/                 # Invite link handler

components/
├── agents/                       # AgentChatPanel
├── auth/                         # Sign in / sign up forms
├── dashboard/                    # Stats, ActivityFeed, QuickLaunch, icons
├── focus/                        # FocusTimer, FocusSidebar
├── landing/                      # Marketing page sections
├── profile/                      # Profile editor
├── room/                         # RoomChat, RightPanel, RoomRequests
├── shared/                       # MemberProfileModal
├── tasks/                        # KanbanBoard, TaskCard
├── app-shell.tsx                 # Authenticated layout with sidebar
└── providers.tsx                 # React Query + theme providers

lib/
├── agents/
│   ├── llm-router.ts             # Provider resolution + fallback chain
│   ├── prompts.ts                # System prompts for all 5 agents
│   └── travily.ts                # Tavily search integration
└── db/
    ├── schema/                   # Drizzle schema (users, rooms, messages,
    │                             #   tasks, agent_sessions, focus_sessions)
    ├── index.ts                  # DB client + schema exports
    ├── auth-client.ts
    ├── auth.ts
    ├── redis.ts                  # Upstash Redis client
    ├── useReveal.ts              # Scroll reveal hook
    └── utils.ts

drizzle/                          # Migration files
hooks/                            # useChatMessages, useSendMessage
public/                           # Static assets
```

---

## Getting Started

```bash
git clone https://github.com/abirbhab-dasgupta/studiosynq.git
cd studiosynq
npm install
cp .env.example .env.local
# Fill in .env.local — see table below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Minimum to run:** `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, and at least one LLM key (`GROQ_API_KEY` recommended).

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Random 32-char secret |
| `BETTER_AUTH_URL` | Your deployment URL (`http://localhost:3000`) |
| `GROQ_API_KEY` | [Groq Console](https://console.groq.com) |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com) |
| `MISTRAL_API_KEY` | [Mistral Platform](https://console.mistral.ai) |
| `TAVILY_API_KEY` | [Tavily](https://tavily.com) — enables live web search in ResearchBot |
| `NEXT_PUBLIC_PUSHER_KEY` | Pusher app key |
| `PUSHER_APP_ID` | Pusher app ID |
| `PUSHER_SECRET` | Pusher secret |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | e.g. `ap2` |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL — enables rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary — enables avatar uploads |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

<div align="center">

Built by [Abirbhab Dasgupta](https://github.com/abirbhab-dasgupta) 

</div>