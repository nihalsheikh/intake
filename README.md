# Intake - AI Form Builder

> Build beautiful, intelligent forms from plain English.

**Intake** is a full-stack AI form builder and data collection platform that turns natural-language prompts into structured, multi-step forms. It combines an intuitive drag-and-drop builder with AI-assisted validation, question enhancement, form auditing, analytics, response management, and CSV exports.

Built with **React, TypeScript, Express, PostgreSQL, Bun, and Google Gemini**.

---

## 🌐 Live Demo

- **Application:** https://intakeai-builder.vercel.app
- **Backend API:** https://intake-backend-dagu.onrender.com
- **API Health:** https://intake-backend-dagu.onrender.com/api/health

---

## ✨ Features

### 🤖 AI-Powered Form Generation

Describe the form you want in plain English and let Google Gemini generate a structured form automatically.

The AI can determine:

- Appropriate question types
- Question labels and descriptions
- Multi-step form structure
- Required fields
- Validation rules
- Theme and presentation presets
- Logical question flows

Example:

> "Create a customer satisfaction survey for a SaaS product with ratings, multiple-choice questions, and an optional feedback section."

Intake turns the description into a ready-to-edit form.

---

### 🧠 Smart Validation Assistant

Generate context-aware validation rules for form fields.

Supports AI-assisted recommendations for:

- Regex patterns
- Numeric ranges
- Field constraints
- Custom validation messages
- Context-specific validation logic

---

### ✍️ Question Enhancer

Improve individual form questions using AI.

The enhancer can:

- Rephrase unclear questions
- Improve neutrality
- Make questions more engaging
- Generate relevant follow-up questions
- Improve wording based on context

---

### 🔍 AI Form Audits

Evaluate a form before publishing it.

The AI audit provides feedback around:

- Target audience suitability
- Potential completion rate
- Question clarity
- User friction
- Form structure
- Areas for improvement

This helps identify potential UX problems before collecting responses.

---

### 📊 Analytics Dashboard

Track how your forms perform with built-in analytics.

Analytics include:

- Total submissions
- Completion duration
- Conversion rates
- Submission trends
- Daily response timelines
- Question-level response breakdowns

Charts and visualizations make it easy to understand how respondents interact with your forms.

---

### 📈 Response Visualizations

Automatically aggregate compatible response types into visual breakdowns.

Supported examples include:

- Ratings
- Yes / No responses
- Multiple-choice selections
- Multi-select responses
- Dropdown selections

---

### 📥 Unified Response Inbox

Manage responses from all forms in a single interface.

The inbox provides:

- Cross-form response browsing
- Response search
- Submission details
- Fast filtering
- Centralized response management

---

### 📄 CSV Export

Export collected form responses as CSV for further analysis or external data pipelines.

The backend includes an RFC 4180-compatible CSV serialization utility for structured response exports.

---

### 🔗 Public Form Sharing

Published forms receive unique public slugs that can be shared with respondents.

Public forms support:

- Shareable URLs
- Public response collection
- View tracking
- Submission tracking

---

## 🛠️ Tech Stack

### Frontend

| Technology          | Purpose                    |
| ------------------- | -------------------------- |
| **React 19**        | UI framework               |
| **TypeScript**      | Type-safe development      |
| **Vite**            | Frontend build tooling     |
| **Tailwind CSS**    | Styling                    |
| **React Router**    | Client-side routing        |
| **React Hook Form** | Form state and validation  |
| **Axios**           | API communication          |
| **dnd-kit**         | Drag-and-drop form builder |
| **Recharts**        | Analytics visualizations   |
| **Lucide React**    | Icons                      |
| **Sonner**          | Notifications              |

### Backend

| Technology        | Purpose                          |
| ----------------- | -------------------------------- |
| **Bun**           | Runtime and package manager      |
| **Express 5**     | REST API framework               |
| **TypeScript**    | Type-safe backend development    |
| **PostgreSQL**    | Relational database              |
| **Neon**          | Serverless PostgreSQL hosting    |
| **JWT**           | Authentication                   |
| **bcryptjs**      | Password hashing                 |
| **Google Gemini** | AI generation and analysis       |
| **Axios / REST**  | Frontend ↔ backend communication |

---

## 🏗️ Architecture

Intake follows a layered backend architecture that separates HTTP handling, business logic, and database access.

```text
Client
  │
  ▼
React + Vite Frontend
  │
  │ REST API
  ▼
Express API
  │
  ├── Middleware
  │     ├── Authentication
  │     └── Error Handling
  │
  ├── Routes
  │
  ├── Controllers
  │
  ├── Services
  │     ├── Authentication
  │     ├── Forms
  │     ├── Responses
  │     ├── Analytics
  │     ├── Insights
  │     └── Gemini AI
  │
  └── Repositories
        │
        ▼
    PostgreSQL / Neon
```

## Backend Structure

```
backend/
├── config/
│   ├── db.ts
│   └── envConfig.ts
│
├── controllers/
│   ├── ai.controller.ts
│   ├── auth.controller.ts
│   ├── form.controller.ts
│   ├── insights.controller.ts
│   └── response.controller.ts
│
├── middleware/
│   ├── auth.middleware.ts
│   └── errorHandler.middleware.ts
│
├── repositories/
│   ├── form.repo.ts
│   ├── response.repo.ts
│   └── user.repo.ts
│
├── routes/
│   ├── ai.routes.ts
│   ├── auth.routes.ts
│   ├── form.routes.ts
│   ├── insights.routes.ts
│   └── response.routes.ts
│
├── services/
│   ├── ai.service.ts
│   ├── analytics.service.ts
│   ├── auth.service.ts
│   ├── form.service.ts
│   ├── gemini.service.ts
│   ├── insights.service.ts
│   └── response.service.ts
│
├── utils/
│   ├── ApiError.ts
│   ├── apiResponses.ts
│   ├── asyncHandler.ts
│   ├── constants.ts
│   ├── csv.ts
│   ├── nanoid.ts
│   ├── seed.ts
│   └── token.ts
│
├── app.ts
├── server.ts
├── package.json
└── tsconfig.json
```

## 🔐 Authentication

Intake uses JWT-based authentication.

The authentication flow includes:

1. User registration
2. Password hashing with bcryptjs
3. JWT generation after authentication
4. Bearer token authentication for protected API routes
5. Automatic token attachment from the frontend
6. Automatic session cleanup when a 401 Unauthorized response is received

Authentication tokens are stored client-side and attached to API requests using the HTTP Authorization header.

## 🧩 API Structure

The backend exposes RESTful endpoints grouped by functionality.

```
/api/health

/api/auth
/api/forms
/api/ai
/api/responses
/api/insights
```

The exact endpoints are defined in the backend `routes/` directory.

### 🚀 Getting Started

#### 1. Clone the Repository

```bash
git clone https://github.com/nihalsheikh/intake.git

cd intake
```

#### 2. Configure the Backend

Navigate to the backend and install dependencies

```bash
cd backend
bun install
```

Create Env File: `backend/.env`

```bash
PORT=5000

DATABASE_URL=postgresql://user:password@host/neondb?sslmode=require

JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:5173

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.6-flash
```

#### 3. Seed Demo Data

If you want to populate the database with demo data:

```
bun run seed
```

This generates realistic sample data for testing the application's forms, responses, and analytics functionality.

Start Backend For development:

```bash
bun run dev
```

#### 5. Configure the Frontend

Open a new terminal go to frontend dir and install dependencies

```
cd frontend
bun install
```

Create Frontend Env file in `frontend/.env`

```
VITE_API_URL=http://localhost:5000/api
```

#### 6. Start the Frontend

```
bun run dev
```

### 🧪 Demo Account

If the database has been populated using the seed script, you can use the seeded demo account:

```
Email:    alex@timetoprogram.dev
Password: Test@1234
```

## 📁 Project Structure

```
intake/
│
├── backend/          # Express + Bun + PostgreSQL API
│
├── frontend/         # React + Vite application
│
└── README.md
```

The project is intentionally structured as a monorepo so the frontend and backend can be developed and deployed independently.

### 📌 Current Production Stack

```
Frontend
React + TypeScript + Vite
        │
        │ HTTPS / REST
        ▼
Backend
Express + TypeScript + Bun
        │
        ├───────────────┐
        ▼               ▼
   PostgreSQL       Google Gemini
      Neon              API
```

#### 🔒 License & Usage

This project is created primarily for educational, portfolio, and learning purposes.

---

### 👨‍💻 Author

Nihal Sheikh
Built with React, TypeScript, Express, PostgreSQL, Bun, and Google Gemini.
