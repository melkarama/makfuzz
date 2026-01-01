# 🧶 MakFuzz Web Application

> **The Ultimate Fuzzy Matching Engine for Data Cleaning & Deduplication** ✨

A modern **React + Spring Boot** web application featuring a stunning 2026 UX design with glassmorphism, dark mode, and micro-animations.

## 🏗️ Architecture

```
makfuzz/
├── backend/                    # Spring Boot REST API
│   ├── src/main/java/
│   │   └── com/makfuzz/api/
│   │       ├── config/         # CORS, etc.
│   │       ├── controller/     # REST endpoints
│   │       ├── core/           # Fuzzy matching engine
│   │       ├── dto/            # Data transfer objects
│   │       └── service/        # Business logic
│   └── pom.xml
│
├── frontend/                   # React + Vite SPA
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page components
│   │   ├── App.tsx             # Main app with routing
│   │   ├── api.ts              # API service layer
│   │   ├── types.ts            # TypeScript interfaces
│   │   └── index.css           # 2026 Design System
│   └── package.json
```

## 🚀 Quick Start

### Backend (Spring Boot)

```bash
cd backend
JAVA_HOME=/opt/dev/dev-tools/jdk-17 /opt/dev/dev-tools/maven-3.9/bin/mvn spring-boot:run
```

The API will be available at `http://localhost:8080`

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **API Docs**: http://localhost:8080/api-docs

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:3000`

## 🎨 Design System (2026 UX Trends)

- **Glassmorphism**: Frosted glass effects with backdrop blur
- **Dark Mode First**: Rich dark palette with vibrant accents
- **Micro-Animations**: Smooth transitions with Framer Motion
- **Gradient Accents**: Primary purple-to-coral gradient
- **Responsive App Shell**: Sidebar + Header layout

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/fuzz/upload` | Upload CSV file |
| GET | `/api/v1/fuzz/file/{id}` | Get file info |
| DELETE | `/api/v1/fuzz/file/{id}` | Delete file |
| POST | `/api/v1/fuzz/search/{id}` | Run fuzzy search |
| POST | `/api/v1/fuzz/export/{id}/csv` | Export results |
| GET | `/api/v1/fuzz/health` | Health check |

## 🧠 Fuzzy Matching Engine

### Algorithms

- **Jaro-Winkler**: Spelling similarity for typo detection
- **Beider-Morse**: Phonetic encoding for multi-language names
- **French Soundex**: French-specific phonetic rules

### Features

- Multiple search criteria with weighted scoring
- Configurable thresholds (spelling, phonetic, overall)
- Match types: Similarity, Exact, Regex
- Language selection (EN/FR)

## 🛠️ Tech Stack

### Backend
- Java 17 + Spring Boot 3.2
- Apache Commons Text/Codec
- Apache POI (Excel export)
- Springdoc OpenAPI

### Frontend
- React 18 + TypeScript
- Vite 5
- Framer Motion
- React Router 6
- Lucide React Icons
- Axios

## 📦 Building for Production

### Backend
```bash
cd backend
JAVA_HOME=/opt/dev/dev-tools/jdk-17 /opt/dev/dev-tools/maven-3.9/bin/mvn clean package
java -jar target/makfuzz-api-1.0.0.jar
```

### Frontend
```bash
cd frontend
npm run build
# Serve the dist/ folder
```

## 💖 Support

Love the tool? Help keep the algorithms fuzzy and the UI crisp!

[![Donate with PayPal](https://img.shields.io/badge/Donate-PayPal-blue.svg?logo=paypal&style=for-the-badge)](https://www.paypal.com/ncp/payment/45JPEGLFJQQSJ)
