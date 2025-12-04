# Aynorica OS

**The Operating System for Amir's Second Brain**

Aynorica is a comprehensive knowledge management and AI orchestration system built on Obsidian, designed to implement the CODE/PARA methodology with intelligent automation.

---

## 🚀 Quick Start

### Option 1: Use the Scaffolding CLI (Recommended)

The fastest way to set up Aynorica with your personalized configuration:

```bash
npx create-aynorica
```

This will:

-   Fetch the latest instruction templates from this repository
-   Prompt you for your personal information (name, email, timezone)
-   Generate personalized configuration files in `.github/instructions/`
-   Set up the complete Aynorica environment

**For more details, see [create-aynorica](https://github.com/aynorica/create-aynorica)**

### Option 2: Manual Setup

1. Clone this repository
2. Install dependencies: `pnpm install`
3. Configure your Obsidian vault path in `.env`
4. Start services: `pnpm start`

---

## 📦 Architecture

Aynorica consists of several interconnected systems:

### Core Components

-   **Vault Layer** (`/Atlas`, `/Inbox`, `/Archive`) — Obsidian-based knowledge storage
-   **Gateway** (`packages/gateway`) — NestJS-based entry point for all external interactions
-   **Workers** (`packages/workers`) — Background task processors (inbox processing, skill indexing)
-   **Mesh** (`packages/mesh`) — Inter-service communication framework
-   **Skills** (`Atlas/30 Resources/*Skill.md`) — RAG-indexed knowledge modules

### Infrastructure

-   **PostgreSQL** — Persistent storage (gateway registry, worker state)
-   **Redis** — Caching and pub/sub messaging
-   **Docker** — Containerized services

---

## 🧠 Key Features

### 1. Intelligent Inbox Processing

Automatically converts raw inputs (PDFs, text, images) into structured Markdown files with:

-   YAML frontmatter (schema-enforced)
-   Semantic linking to Areas and Projects
-   Status tracking (🟥 To-Read, 🟧 In Progress, 🟩 Done)

### 2. RAG-Powered Skills

-   **23+ indexed skills** covering architecture, security, psychology, development patterns
-   **Hybrid search** (vector + keyword) for precise knowledge retrieval
-   **Auto-indexing** via workers when skills are created/updated

### 3. Multi-Agent Orchestration

-   **Gateway** coordinates task routing between specialized workers
-   **Workers** handle domain-specific logic (OCR, embeddings, task management)
-   **Mesh** provides resilient communication (circuit breakers, retries)

### 4. Calendar Integration

-   Google Calendar MCP integration for event management
-   Timezone-aware scheduling (configured during setup)

---

## 📁 Directory Structure

```
aynorica-os/
├── .github/
│   ├── instructions/          # Agent configuration files (personalized)
│   └── prompts/               # Reusable prompt templates
├── Atlas/
│   ├── 10 Projects/           # Active projects
│   ├── 20 Areas/              # Areas of responsibility
│   └── 30 Resources/          # Skills, MOCs, processed inputs
├── Inbox/
│   ├── Amir/                  # User input stream
│   └── Aynorica/              # Orchestrator logs
├── Archive/                   # Cold storage
├── System/Templates/          # Obsidian templates
├── packages/
│   ├── gateway/               # API gateway (NestJS)
│   ├── workers/               # Background processors
│   ├── mesh/                  # Communication layer
│   └── shared/                # Common utilities
└── scripts/                   # Operational scripts
```

---

## 🛠️ Development

### Prerequisites

-   Node.js v22+
-   pnpm v10+
-   Docker & Docker Compose
-   PostgreSQL 15 (via Docker)
-   Redis 7 (via Docker)

### Setup

```bash
# Install dependencies
pnpm install

# Start infrastructure
./scripts/start-postgres.sh
./scripts/start-redis.sh

# Build packages
pnpm run build

# Start all services
pnpm start
```

### Testing

```bash
# Run all tests
pnpm test

# Test specific package
pnpm --filter @aynorica/gateway test
```

---

## 📝 Configuration

### Environment Variables

Create `.env` files in package directories:

```env
# Gateway
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=aynorica_user
POSTGRES_PASSWORD=your_password
POSTGRES_DB=aynorica_db

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# Workers
VAULT_PATH=/path/to/your/obsidian/vault
OPENAI_API_KEY=your_openai_key
```

### Obsidian Plugins Required

-   **Dataview** (with JavaScript queries enabled)
-   **Templater** (template folder: `System/Templates`)
-   **Kanban**

---

## 🔗 Related Projects

-   [create-aynorica](https://github.com/aynorica/create-aynorica) — Scaffolding CLI
-   [Obsidian MCP Server](https://github.com/yourhandle/obsidian-mcp) — Vault integration
-   [Google Workspace MCP](https://github.com/yourhandle/google-workspace-mcp) — Calendar integration

---

## 📄 License

MIT

---

## 🤝 Contributing

This is a personal system, but if you're building something similar:

1. Fork the repository
2. Use `create-aynorica` to generate your own configuration
3. Share your architectural insights!

---

## 🧭 Philosophy

Aynorica follows these principles:

1. **Vault-First** — All knowledge lives in Markdown files with YAML frontmatter
2. **RAG as Index** — The database indexes vault files, doesn't replace them
3. **Completion Over Perfection** — Ship imperfect work, iterate fast
4. **Trade-Off Transparency** — Every architectural decision has explicit costs
5. **Externalizing Will** — The system acts as external discipline for focus

---

**Built by Amir Daryabari** | [GitHub](https://github.com/aynorica) | [Website](https://aynorica.dev)
