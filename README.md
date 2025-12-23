# 🌌 DecoVerse Backend

Backend API for **DecoVerse** – an AI-powered interior design platform supporting
2D / 3D / 360° spaces, real-time collaboration, and automated cost estimation (BoQ).

---

## 🚀 Tech Stack

- **Framework**: NestJS (Node.js + TypeScript)
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase Auth (JWT)
- **AI Integration**: OpenAI API
- **Realtime**: Supabase Realtime
- **API Docs**: Swagger
- **Code Quality**: ESLint + Prettier
- **Git Hooks**: Husky + lint-staged + Commitlint
- **Hosting**: Render (Free tier)
- **IDE**: VS Code

---

## 💻 Quick Start

```bash
git clone https://github.com/binhnexusx/DecoVerse-Backend.git 
cd decoverse-backend
npm install
npm run start:dev
Server will run at:

API: http://localhost:3001/api

Swagger Docs: http://localhost:3001/docs

🔐 Environment Variables
Create a .env file in the root directory:
env
PORT=3001

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

OPENAI_API_KEY=
⚠️ Never commit .env to GitHub.

📂 Project Structure
decoverse-backend/
├── .husky/                  # Git hooks (pre-commit, commit-msg, ...)
├── dist/                    # Build output (after `npm run build`)
├── node_modules/            # Dependencies
├── src/
│   ├── ai/                  # AI-related features (OpenAI, prompts, AI services)
│   ├── auth/                # Authentication & authorization (JWT, guards, strategies)
│   ├── boq/                 # BOQ (Bill of Quantities) domain logic
│   ├── common/              # Shared utilities (decorators, filters, guards, interceptors)
│   ├── config/              # App configuration & environment mapping
│   │   └── configuration.ts # Centralized config loader
│   ├── materials/           # Materials module (entities, services, controllers)
│   ├── projects/            # Projects module (CRUD, business logic)
│   ├── users/               # Users module (profiles, roles, permissions)
│   ├── app.controller.ts    # Root controller
│   ├── app.controller.spec.ts
│   ├── app.service.ts       # Root service
│   ├── app.module.ts        # Root module (imports global modules)
│   └── main.ts              # Application entry point
├── test/                    # E2E & integration tests
├── .env                     # Environment variables
├── .gitignore               # Git ignore rules
├── .prettierrc              # Prettier config
├── commitlint.config.cjs    # Commit message rules
├── eslint.config.mjs        # ESLint config
├── nest-cli.json            # NestJS CLI configuration
├── package.json
└── README.md

🧹 Code Quality & Git Rules
✅ Pre-commit
ESLint + Prettier auto-fix on staged files

Commit blocked if errors remain

✅ Commit Message Convention
Format:

scss
Copy code
type(scope): short description
Examples:

feat(auth): add jwt guard

fix(projects): fix create project api

chore(backend): init nestjs backend

Allowed types:

bash
Copy code
feat, fix, chore, docs, style, refactor, perf, test, ci, build, revert
📘 API Documentation
Swagger is enabled by default.

URL: http://localhost:3001/docs

Auto-generated from controllers & DTOs

📦 Scripts
bash
Copy code
npm run start        # start server
npm run start:dev    # start in watch mode
npm run build        # build production
npm run lint         # run eslint
npm run format       # run prettier
```
