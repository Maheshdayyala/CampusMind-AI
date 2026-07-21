# CampusMind AI — Your AI Academic Copilot with Persistent Memory

> CampusMind AI is an AI-powered academic copilot that helps students learn smarter instead of studying harder.

![Model Context Protocol](https://img.shields.io/badge/Model%20Context%20Protocol-MCP-blue) ![Built with Nitrostack](https://img.shields.io/badge/Built%20with-Nitrostack-0A66FF) ![Status](https://img.shields.io/badge/status-live-brightgreen)

**CampusMind AI — Your AI Academic Copilot with Persistent Memory** is an [MCP (Model Context Protocol)](https://nitrostack.ai) server that extends AI assistants — like Claude, Cursor, and any MCP-compatible client — with new, real-world capabilities. It is built and deployed on [Nitrostack](https://nitrostack.ai), the fastest way to build, deploy, and share MCP apps.

## Table of Contents

- [Overview](#overview)
- [What is MCP?](#what-is-mcp)
- [Features](#features)
- [Live Demo](#live-demo)
- [Getting Started](#getting-started)
- [Connect to an MCP Client](#connect-to-an-mcp-client)
- [Deploy Your Own MCP App](#deploy-your-own-mcp-app)
- [Explore More MCP Apps](#explore-more-mcp-apps)
- [FAQ](#faq)
- [Keywords](#keywords)
- [License](#license)

## Overview

CampusMind AI is an AI-powered academic copilot that helps students learn smarter instead of studying harder. Unlike traditional AI chatbots that forget every conversation, CampusMind AI uses the Model Context Protocol (MCP) to maintain a persistent academic memory for each student. It remembers what a student has studied, identifies weak concepts, tracks progress over time, and proactively recommends what should be reviewed before exams.

The platform combines a modern web application with a NitroStack MCP server. Students can interact through an AI chat interface, view their study dashboard, access a memory timeline, manage revision plans, upload notes, monitor learning analytics, and use Exam Mode to generate personalized revision strategies based on their academic history.

CampusMind AI automatically performs actions such as:

- Remembering previously studied topics
- Recalling old doubts using natural language
- Identifying weak concepts
- Generating personalized study plans
- Tracking learning progress and study streaks
- Creating AI-assisted exam preparation plans

What makes CampusMind AI unique is that it acts as a long-term academic companion rather than a one-time chatbot. Every interaction improves the student's academic profile, enabling the AI to provide increasingly personalized guidance over time. By combining persistent memory, intelligent planning, and proactive recommendations, CampusMind AI helps students retain knowledge, reduce exam stress, and improve learning outcomes.

Built with NitroStack MCP, Next.js, TypeScript, and AI-powered academic memory, CampusMind AI demonstrates how persistent AI agents can transform personalized education.

## What is MCP?

The **Model Context Protocol (MCP)** is an open standard that lets AI assistants securely connect to external tools, data sources, and services. Instead of being limited to what it was trained on, an AI model can call **MCP servers** to fetch live data, run actions, and integrate with real systems.

This project is one such MCP server. Learn more about building and shipping MCP apps at [nitrostack.ai](https://nitrostack.ai).

## Features

- 🔌 **MCP-native** — works with any MCP-compatible client (Claude, Cursor, and more)
- 🛠️ **22 MCP tools** — academic memory, study planning, spaced repetition, voice assistant, analytics
- 🎨 **Next.js frontend** — 10-page dashboard with AI chat, memory timeline, exam mode, and analytics
- 📊 **Spaced repetition** — smart review scheduling based on confidence scores and deadlines
- 🧠 **Persistent memory** — every interaction improves the student's academic profile
- 🔐 **JWT authentication** — per-student isolation with secure token-based auth
- ⚡ **Deployed on Nitrostack** — reliable, hosted, and instantly shareable
- 🧩 **Composable** — combine with other MCP apps to build powerful AI workflows

## Live Demo

🚀 **Live MCP endpoint:** https://campusmind-ai-1-blacksquad-amrita-university-amritapuri-campus.app.nitrocloud.ai

Point your MCP client at the endpoint above to try it instantly. Prefer a hosted setup? Deploy your own in minutes on [Nitrostack](https://nitrostack.ai).

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/Maheshdayyala/CampusMind-AI.git
cd CampusMind-AI
npm install
```

### Configuration

Copy the example environment file and add your own values:

```bash
cp .env.example .env
```

### Run

```bash
npm run start
```

The frontend is a static Next.js export served by Express. The MCP endpoint runs at `/mcp` on the same server.

## Connect to an MCP Client

Add this server to your MCP client configuration:

```json
{
  "mcpServers": {
    "campusmind-ai": {
      "url": "https://campusmind-ai-1-blacksquad-amrita-university-amritapuri-campus.app.nitrocloud.ai"
    }
  }
}
```

Restart your client and the 22 MCP tools from this server will be available to your AI assistant.

## Deploy Your Own MCP App

Want to build and ship an MCP server like this one? **[Nitrostack](https://nitrostack.ai)** lets you create, deploy, and host MCP apps in minutes — no infrastructure to manage.

👉 **Start building:** [https://nitrostack.ai](https://nitrostack.ai)

## Explore More MCP Apps

- 🌙 Discover and share MCP projects with the community on [r/mcptothemoon](https://www.reddit.com/r/mcptothemoon/)
- 🧰 Browse a growing catalog of MCP apps on [Nitrostack](https://nitrostack.ai/apps)

## FAQ

### What is an MCP server?

An MCP server implements the Model Context Protocol to expose tools, resources, and prompts that AI assistants can call. It lets an AI model take real actions and access live data.

### What does CampusMind AI do?

CampusMind AI is an AI-powered academic copilot that helps students learn smarter instead of studying harder. It maintains persistent academic memory, identifies weak concepts, schedules reviews, and generates personalized study plans.

### Which AI clients does this work with?

Any MCP-compatible client, including Claude Desktop and Cursor. New clients are adding MCP support regularly.

### How do I deploy my own MCP app?

Use [Nitrostack](https://nitrostack.ai) to build, deploy, and host MCP apps without managing infrastructure.

## Keywords

`Education & Research` · `CampusMind AI` · `MCP` · `Model Context Protocol` · `MCP server` · `MCP app` · `AI tools` · `AI agents` · `LLM tools` · `Claude MCP` · `Nitrostack` · `deploy MCP server` · `build MCP app` · `academic memory` · `spaced repetition` · `AI tutor`

## License

MIT © 2026

---

Built with ❤️ using the Model Context Protocol on [Nitrostack](https://nitrostack.ai). Share your MCP app on [r/mcptothemoon](https://www.reddit.com/r/mcptothemoon/).
