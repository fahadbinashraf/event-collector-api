# Event Collector API

Production-ready API for collecting and validating marketing/analytics events - similar to Adobe Analytics data collection. Built with TypeScript, Node.js, Express, PostgreSQL, and Docker.

![CI Pipeline](https://github.com/fahadbinashraf/event-collector-api/workflows/CI%20Pipeline/badge.svg)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [API Documentation](#api-documentation)
- [Architecture](#architecture)
- [Development](#development)
- [Testing](#testing)
- [Docker](#docker)
- [CI/CD](#cicd)
- [Project Structure](#project-structure)

## 🎯 Overview

This project demonstrates a scalable event collection API similar to what marketing automation platforms like **Adobe Experience Platform** use for web/mobile data ingestion. It provides:

- **Event ingestion** with real-time validation
- **Data enrichment** with metadata (browser info, geo-location)
- **Flexible querying** with filtering and pagination
- **Statistics and analytics** on collected events

Built with modern DevOps practices including Infrastructure as Code (Docker), CI/CD pipelines, comprehensive testing, and production-ready monitoring.

## ✨ Features

- ✅ **Multiple Event Types**: Page views, clicks, custom events
- ✅ **Schema Validation**: Zod-based type-safe validation
- ✅ **Data Enrichment**: Automatic metadata addition (timestamp, IP, browser info)
- ✅ **Query API**: Filter events by type, user, session, date range
- ✅ **Statistics**: Real-time analytics on event data
- ✅ **Rate Limiting**: Built-in protection against abuse
- ✅ **Health Checks**: Database connectivity monitoring
- ✅ **Structured Logging**: Winston-based logging with levels
- ✅ **Docker Support**: Full containerization with docker-compose
- ✅ **CI/CD Pipeline**: GitHub Actions with linting, testing, building
- ✅ **Type Safety**: 100% TypeScript with strict mode
- ✅ **Testing**: Unit and integration tests with >70% coverage

## 🛠 Tech Stack

### Backend
- **Node.js 20** - Runtime environment
- **TypeScript 5** - Type-safe development
- **Express 4** - Web framework
- **PostgreSQL 16** - Relational database
- **Zod** - Schema validation

### DevOps
- **Docker & Docker Compose** - Containerization
- **GitHub Actions** - CI/CD pipeline
- **Winston** - Structured logging

### Quality
- **Vitest** - Testing framework
- **Supertest** - API testing
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📦 Prerequisites

- **Node.js** >= 25.0.0
- **npm** >= 11.0.0
- **Docker** >= 24.0.0 (optional, for containerized deployment)
- **PostgreSQL** >= 16.0 (if running without Docker)

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/fahadbinashraf/event-collector-api.git
cd event-collector-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Start with Docker (Recommended)

```bash
# Start PostgreSQL and API
docker-compose up -d

# Check logs
docker-compose logs -f api

# API will be available at http://localhost:3000
```

### 5. OR Start without Docker

```bash
# Make sure PostgreSQL is running
# Update .env with your database credentials

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

### 6. Test the API

```bash
# Health check
curl http://localhost:3000/health

# Create an event
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "pageView",
    "timestamp": "2026-02-02T10:00:00Z",
    "sessionId": "session_123",
    "page": {
      "url": "https://example.com",
      "title": "Example Page"
    }
  }'

# Get events
curl http://localhost:3000/api/events

# Get statistics
curl http://localhost:3000/api/events/statistics
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000
```

### Endpoints

#### 1. Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-02T10:00:00Z",
  "uptime": 3600,
  "checks": {
    "database": true
  }
}
```

#### 2. Create Event
```http
POST /api/events
```

**Request Body (Page View):**
```json
{
  "eventType": "pageView",
  "timestamp": "2026-02-02T10:00:00Z",
  "userId": "user_123",
  "sessionId": "session_456",
  "page": {
    "url": "https://example.com/product",
    "title": "Product Page",
    "referrer": "https://google.com"
  },
  "device": {
    "userAgent": "Mozilla/5.0...",
    "screenResolution": "1920x1080"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "eventType": "pageView",
    "timestamp": "2026-02-02T10:00:00Z"
  }
}
```

#### 3. Get Events
```http
GET /api/events?eventType=pageView&userId=user_123&limit=10&offset=0
```

**Query Parameters:**
- `eventType` (optional): Filter by event type (pageView, click, custom)
- `userId` (optional): Filter by user ID
- `sessionId` (optional): Filter by session ID
- `startDate` (optional): Filter events after this date (ISO 8601)
- `endDate` (optional): Filter events before this date (ISO 8601)
- `limit` (optional, default: 10, max: 100): Number of results
- `offset` (optional, default: 0): Pagination offset

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "eventType": "pageView",
      "userId": "user_123",
      "sessionId": "session_456",
      "timestamp": "2026-02-02T10:00:00Z",
      "rawData": { ... },
      "enrichedData": { ... }
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

#### 4. Get Event by ID
```http
GET /api/events/:id
```

#### 5. Get Statistics
```http
GET /api/events/statistics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalEvents": 1523,
    "eventsByType": {
      "pageView": 850,
      "click": 573,
      "custom": 100
    },
    "uniqueUsers": 342,
    "uniqueSessions": 456,
    "timestamp": "2026-02-02T10:00:00Z"
  }
}
```

See [API.md](docs/API.md) for complete API documentation.

## 🏗 Architecture

The application follows a layered architecture:

```
┌─────────────────────┐
│   API Layer         │  Express routes, controllers
│   (HTTP Interface)  │  Validation, rate limiting
└─────────────────────┘
         ↓
┌─────────────────────┐
│  Service Layer      │  Business logic
│  (Core Logic)       │  Event processing, enrichment
└─────────────────────┘
         ↓
┌─────────────────────┐
│  Repository Layer   │  Database operations
│  (Data Access)      │  SQL queries, transactions
└─────────────────────┘
         ↓
┌─────────────────────┐
│   PostgreSQL        │  Event storage
│   (Database)        │  Indexes, relationships
└─────────────────────┘
```

### Key Design Decisions

1. **Validation at the Edge**: Zod schemas validate all incoming data before processing
2. **Enrichment Pipeline**: Events are automatically enriched with metadata
3. **Repository Pattern**: Clean separation between business logic and data access
4. **Structured Logging**: All operations are logged with context for debugging
5. **Graceful Shutdown**: Proper cleanup of connections on termination
6. **Rate Limiting**: Protection against abuse and DDoS
7. **Health Checks**: Database connectivity monitoring

See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed technical decisions.

## 💻 Development

### Available Scripts

```bash
# Development
npm run dev              # Start with hot reload (tsx watch)
npm run build            # Compile TypeScript
npm start                # Start production build

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run typecheck        # TypeScript type checking

# Testing
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report
npm run test:ui          # Run tests with Vitest UI

# Database
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database with sample data

# Docker
npm run docker:build     # Build Docker image
npm run docker:up        # Start containers
npm run docker:down      # Stop containers
```

### Development Workflow

1. Create a feature branch
2. Make changes with TypeScript strict mode
3. Write tests (aim for >70% coverage)
4. Run linting and formatting
5. Commit with descriptive messages
6. Push and create Pull Request
7. CI pipeline will run automatically

## 🧪 Testing

### Run Tests

```bash
# All tests
npm test

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch

# Specific test file
npm test -- events.controller.test.ts
```

### Test Structure

```
tests/
├── unit/               # Unit tests (services, utils)
│   ├── services/
│   └── validation/
└── integration/        # Integration tests (API endpoints)
    └── api.test.ts
```

### Coverage Requirements

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## 🐳 Docker

### Build and Run

```bash
# Build image
docker build -t event-collector-api .

# Run with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

### Docker Configuration

- **Multi-stage build** for optimized image size
- **Non-root user** for security
- **Health checks** for container monitoring
- **Volume persistence** for PostgreSQL data

## 🔄 CI/CD

GitHub Actions pipeline automatically runs on push and pull requests:

### Pipeline Stages

1. **Lint** - ESLint and Prettier checks
2. **Type Check** - TypeScript compilation
3. **Test** - Unit and integration tests with PostgreSQL service
4. **Build** - Compile TypeScript to JavaScript
5. **Docker** - Build and test Docker image (main branch only)

### Status Badges

Add to your repository:
```markdown
![CI Pipeline](https://github.com/fahadbinashraf/event-collector-api/workflows/CI%20Pipeline/badge.svg)
```

## 📁 Project Structure

```
event-collector-api/
├── src/
│   ├── api/                    # API layer
│   │   ├── controllers/        # Request handlers
│   │   ├── middleware/         # Express middleware
│   │   ├── routes/             # Route definitions
│   │   └── app.ts              # Express app configuration
│   ├── database/               # Database layer
│   │   ├── repositories/       # Data access objects
│   │   └── connection.ts       # Database connection
│   ├── services/               # Business logic
│   │   ├── event-processor.service.ts
│   │   └── enrichment.service.ts
│   ├── types/                  # TypeScript types
│   ├── utils/                  # Utilities (logger, etc.)
│   ├── validation/             # Zod schemas
│   └── server.ts               # Application entry point
├── tests/                      # Test files
│   ├── unit/                   # Unit tests
│   └── integration/            # Integration tests
├── docs/                       # Documentation
│   ├── ARCHITECTURE.md         # Architecture decisions
│   ├── API.md                  # API documentation
│   └── DEPLOYMENT.md           # Deployment guide
├── .github/
│   └── workflows/              # CI/CD pipelines
├── docker-compose.yml          # Docker orchestration
├── Dockerfile                  # Docker image definition
├── init.sql                    # Database initialization
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript configuration
├── vitest.config.ts            # Vitest configuration
├── .eslintrc.js                # ESLint configuration
└── .prettierrc                 # Prettier configuration
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Fahad Bin Ashraf**
- Full Stack Engineer with 7+ years of experience
- Expertise in TypeScript, Node.js, React, and cloud infrastructure
- [GitHub](https://github.com/fahadbinashraf)

## 🙏 Acknowledgments

- Inspired by Adobe Experience Platform's event collection architecture
- Built with modern DevOps practices for production readiness
- Designed to demonstrate scalable API development with TypeScript and Node.js

---

**Note**: This is a proof-of-concept demonstrating production-ready patterns. For production deployment, consider adding:
- Real geo-IP service (e.g., MaxMind)
- Message queue for high-volume ingestion (e.g., RabbitMQ, Kafka)
- Caching layer (e.g., Redis)
- Monitoring and alerting (e.g., Prometheus, Grafana)
- API authentication and authorization
- Load balancing and horizontal scaling
