# 🌱 Sapling — AI Powered Hiring Platform

Sapling is an **AI-powered hiring platform** designed to streamline the recruitment process for both **candidates and recruiters**.

The platform combines **resume analysis, AI-powered interviews, coding assessments, job applications, recruiter shortlisting, and RAG-based AI capabilities** into a single hiring workflow.

---

## 🚀 Features

### 👨‍💻 Candidate Features

- 🔐 User Registration & Login
- 🔑 JWT-based Authentication
- 📄 Upload Resume
- 🤖 AI Resume Analysis
- 📊 Resume Score & Feedback
- 💼 Browse Active Jobs
- 📝 Apply for Jobs
- 📋 Track Applied Jobs
- 🎤 AI-Powered Interview
- 💻 AI-Powered Coding Assessment
- 📈 View Individual Assessment Scores
- 🔎 Job-specific Application Flow

---

### 🧑‍💼 Recruiter Features

- 🔐 Recruiter Authentication
- ➕ Create Jobs
- ✏️ Edit Jobs
- 🔄 Open / Close Jobs
- 📋 View Created Jobs
- 👥 View Job Applicants
- 👤 View Candidate Details
- 📊 Candidate Evaluation
- 🤖 AI Resume Matching
- 🎯 Candidate Shortlisting
- 📈 View Candidate Evaluation Results

Recruiters can evaluate candidates using multiple assessment components including:

- Resume Analysis
- AI Interview
- Coding Assessment
- Overall Evaluation

---

# 🤖 AI Capabilities

Sapling integrates AI throughout the recruitment process.

### 📄 AI Resume Analysis

Uploaded resumes are processed and analyzed using AI to generate:

- Resume score
- Candidate strengths
- Candidate weaknesses
- Skill analysis
- Improvement suggestions
- Overall resume feedback

---

### 🎤 AI Interview

The platform generates an AI-powered technical interview where:

1. Candidate starts an interview.
2. AI generates interview questions.
3. Candidate submits answers.
4. AI evaluates each answer.
5. Individual scores and feedback are generated.
6. Final interview score is calculated.

---

### 💻 Coding Assessment

Candidates receive coding questions as part of the technical evaluation.

The system:

- Generates coding questions
- Accepts candidate submissions
- Evaluates submitted solutions
- Calculates question-wise scores
- Calculates the overall coding score

---

### 🔎 RAG-Based AI

Sapling also uses **Retrieval-Augmented Generation (RAG)** for AI-powered contextual information retrieval.

The RAG architecture uses:

- PostgreSQL
- PGVector
- Embeddings
- Vector similarity search
- Ollama
- Nomic Embed Text

---

# 🏗️ Project Architecture

```text
                    ┌─────────────────────┐
                    │       React UI      │
                    │      Frontend       │
                    └──────────┬──────────┘
                               │
                               │ REST API
                               ▼
                    ┌─────────────────────┐
                    │    Spring Boot      │
                    │      Backend        │
                    └──────────┬──────────┘
                               │
             ┌─────────────────┼─────────────────┐
             │                 │                 │
             ▼                 ▼                 ▼
        ┌─────────┐       ┌──────────┐      ┌──────────┐
        │  MySQL  │       │PostgreSQL│      │  Ollama  │
        │         │       │ + PGVector│      │   + AI   │
        └─────────┘       └──────────┘      └──────────┘
```

---

# 🛠️ Tech Stack

## Backend

- Java 21
- Spring Boot
- Spring Security
- Spring Data JPA
- Spring AI
- JWT Authentication
- Maven
- MySQL
- PostgreSQL
- PGVector
- Apache PDFBox
- Ollama

## Frontend

- React.js
- JavaScript
- Vite
- HTML5
- CSS3

## AI / LLM

- Mistral
- Ollama
- Nomic Embed Text
- Spring AI
- RAG
- Vector Embeddings

---

# 🔐 Authentication

Sapling uses **JWT-based authentication**.

The platform supports two primary roles:

```text
USER
RECRUITER
```

### User

Candidates can:

- Register
- Login
- Upload resumes
- Apply for jobs
- Take AI interviews
- Complete coding assessments
- Track applications

### Recruiter

Recruiters can:

- Create jobs
- Manage jobs
- View applicants
- Evaluate candidates
- Shortlist candidates

---

# 🔄 Hiring Workflow

The complete candidate workflow is:

```text
Register / Login
       ↓
Upload Resume
       ↓
Browse Active Jobs
       ↓
Apply for Job
       ↓
AI Resume Analysis
       ↓
AI Interview
       ↓
Coding Assessment
       ↓
Application Evaluation
       ↓
Recruiter Review
       ↓
Shortlisting
```

---

# 📊 Candidate Evaluation

Sapling separates candidate evaluation into multiple components.

```text
Resume Analysis
       +
AI Interview
       +
Coding Assessment
       ↓
Candidate Evaluation
```

Candidates can view their individual assessment results, while recruiters can use the combined evaluation information during the hiring process.

---

# 📁 Project Structure

```text
sapling/
│
├── sapling-backend/
│   │
│   └── ai-backend/
│       │
│       ├── src/
│       │   ├── main/
│       │   └── test/
│       │
│       ├── pom.xml
│       └── ...
│
├── sapling-frontend/
│   │
│   └── frontend-new/
│       │
│       ├── src/
│       ├── public/
│       ├── package.json
│       └── ...
│
└── README.md
```

---

# ⚙️ Backend Setup

### 1. Clone the repository

```bash
git clone https://github.com/binary-adarsh/Sapling.git
```

### 2. Open the backend

```bash
cd sapling/sapling-backend/ai-backend
```

### 3. Configure MySQL

Create the required database:

```sql
CREATE DATABASE ai_project;
```

Update your database configuration in:

```text
src/main/resources/application.properties
```

Example:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/ai_project
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
```

> Do not commit real database passwords, API keys, JWT secrets, or other credentials to GitHub.

---

# 🐘 PostgreSQL + PGVector

Sapling uses PostgreSQL with **PGVector** for vector-based AI/RAG functionality.

Create the required database:

```sql
CREATE DATABASE ai_rag;
```

Make sure PostgreSQL and the required vector extension are configured before starting the RAG functionality.

---

# 🤖 Ollama Setup

Sapling uses Ollama for local AI inference.

Install Ollama and make sure the Ollama server is running.

Default Ollama address:

```text
http://localhost:11434
```

Required models:

```bash
ollama pull mistral
ollama pull nomic-embed-text
```

You can verify installed models using:

```bash
ollama list
```

---

# ▶️ Run Backend

From the backend directory:

```bash
mvn spring-boot:run
```

The Spring Boot application will start on its configured port.

---

# ▶️ Run Frontend

Open another terminal:

```bash
cd sapling/sapling-frontend/frontend-new
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Vite will provide the local frontend URL in the terminal.

---

# 🔌 API Architecture

The frontend communicates with the Spring Boot backend through REST APIs.

Major API areas include:

```text
/api/auth
/api/resume
/api/ai
/api/jobs
/api/applications
/api/interview
/api/coding
```

Authentication-protected endpoints use JWT Bearer authentication.

Example:

```text
Authorization: Bearer <JWT_TOKEN>
```

---

# 🧠 AI Technology Flow

```text
Candidate Resume
       ↓
PDF Processing
       ↓
Text Extraction
       ↓
AI Analysis
       ↓
Score + Feedback
```

For RAG:

```text
Documents
    ↓
Text Processing
    ↓
Embeddings
    ↓
PGVector
    ↓
Similarity Search
    ↓
Relevant Context
    ↓
LLM
    ↓
AI Response
```

---

# 🔒 Security

The application implements security features including:

- JWT authentication
- Role-based authorization
- Password protection
- Protected REST APIs
- Candidate-specific application access
- Recruiter-specific functionality
- Resume ownership validation

For production deployment, environment variables should be used for sensitive configuration such as:

```text
DATABASE_USERNAME
DATABASE_PASSWORD
JWT_SECRET
AI_CONFIGURATION
```

---

# 🎯 Project Goals

Sapling aims to simplify traditional hiring by combining:

- AI
- Automated Resume Screening
- Technical Interviews
- Coding Assessments
- Job Management
- Candidate Applications
- Recruiter Evaluation

into one integrated platform.

---

# 🔮 Future Improvements

Potential future improvements include:

- Real-time interview communication
- Advanced recruiter analytics
- Improved AI candidate matching
- Automated interview scheduling
- Email notifications
- Candidate recommendation system
- Advanced RAG capabilities
- Cloud deployment
- Dockerized deployment
- Production-grade monitoring
- More programming languages for coding assessments

---

# 📌 Important

This project is developed as a full-stack AI-powered hiring platform using:

```text
React
     +
Spring Boot
     +
MySQL
     +
PostgreSQL / PGVector
     +
Spring AI
     +
Ollama
```

---

# 👨‍💻 Developer

**Adarsh Nirmal**

B.Tech Computer Science & Engineering

- 💻 GitHub: [binary-adarsh](https://github.com/binary-adarsh)
- 🔗 LinkedIn: [Adarsh Nirmal](https://www.linkedin.com/in/adarsh-nirmal-19238a327/)

---

# 📄 License

This project is intended for educational, development, and demonstration purposes.
