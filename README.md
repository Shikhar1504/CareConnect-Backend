# CareConnect Backend API

CareConnect is a production-ready, modular healthcare backend API gateway built for managing patient clinical data, AI/ML integrations (like Databricks/LLMs), and automated communication workflows via Twilio.

## Architecture

This project strictly adheres to a **Controller-Service-Model** architecture:
- **Routes** (`server/src/routes/`): Define API endpoints.
- **Controllers** (`server/src/controllers/`): Handle request/response logic and basic validation.
- **Services** (`server/src/services/`): Core business logic handling (e.g., patient operations, AI orchestration, messaging).
- **Models** (`server/src/models/`): Mongoose schemas defining database collections.
- **Jobs** (`server/src/jobs/`): Scheduled tasks (using `node-cron`).
- **Config & Middleware** (`server/src/config/`, `server/src/middleware/`): DB connections, security overlays.

## Features

- **Robust Patient Management**: Full standard CRUD operations.
- **AI Workflows**: Integrates externally with advanced LLM services/Databricks.
- **Task Automation**: Node-cron jobs powering continuous alerting and polling.
- **Twilio Communications**: For proactive event-based messaging.
- **Modern Syntax**: Employs ES6+ import/export Modules universally.

## Tech Stack

- Node.js & Express
- MongoDB & Mongoose
- JSON Web Tokens (JWT) & bcrypt for Auth
- Axios, cors, morgan, node-cron

## Setup Instructions

1. **Clone & Install Dependencies**
   Navigate into the server directory and run the package installation.
   ```bash
   cd server
   npm install
   ```

2. **Environment Variables**
   Ensure you copy the exact example keys and set them up via your `.env`:
   ```bash
   cp server/.env.example server/.env
   ```
   Add in your DB URIs, secret keys, AI external API info, and Twilio configs.

3. **Start the Application**
   For development (uses nodemon):
   ```bash
   npm run dev
   ```
   For production:
   ```bash
   npm start
   ```
   The development server will expose the application on `http://localhost:5000`.

## Endpoints

- `GET /health` : API Health Check
- `/api/auth` : User Authentication paths
- `/api/patients` : Clinical CRUD routes
- `/api/ai` : Insights and Generation
- `/api/communication` : Messaging functionality endpoints
- `/api/analytics` : Dashboard analytics and metrics
- `/api/alerts` : Alert notifications and resolution
- `/api/patient/checkin` : Daily patient check-in tasks
