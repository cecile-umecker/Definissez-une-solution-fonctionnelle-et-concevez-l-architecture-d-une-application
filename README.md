# Your Car Your Way - Support Platform PoC

A real-time support ticket system with chat functionality for a unified car rental platform.

## 🎯 Project Overview

This is a Proof of Concept (PoC) for a customer support platform featuring:
- User authentication with JWT (cookie-based)
- Real-time chat via WebSocket/STOMP
- Support ticket management
- Role-based access (Client/Agent)
- Auto-assignment of agents to tickets

## 🏗️ Architecture

### Backend
- **Framework**: Spring Boot 4.0.2
- **Language**: Java 21
- **Database**: PostgreSQL
- **Authentication**: Spring Security + JWT
- **Real-time**: WebSocket + STOMP
- **ORM**: Spring Data JPA

### Frontend
- **Framework**: Angular 21
- **Language**: TypeScript 5.9
- **UI**: Angular Material 21
- **Real-time**: SockJS + STOMP.js
- **HTTP Client**: Angular HttpClient

## 📋 Prerequisites

- **Java**: JDK 21
- **Node.js**: v18+ with npm 10.9.3+
- **PostgreSQL**: 14+
- **Maven**: 3.8+
- **Angular CLI**: 21+

## 🗄️ Database Setup

### 1. Install PostgreSQL

Download and install from [postgresql.org](https://www.postgresql.org/download/)

### 2. Create User and Database

```sql
-- Connect to PostgreSQL as admin
psql -U postgres

-- Create user
CREATE USER ycyw_user WITH PASSWORD 'your_password';

-- Create database
CREATE DATABASE your_car_your_way OWNER ycyw_user;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE your_car_your_way TO ycyw_user;
```

### 3. Initialize Schema and Data

Using pgAdmin4 or psql:

```bash
# Initialize tables
psql -U ycyw_user -d your_car_your_way -f sql/init_db.sql

# Insert sample data
psql -U ycyw_user -d your_car_your_way -f sql/data.sql
```

## ⚙️ Backend Configuration

### 1. Create `.env` file

Create a `.env` file in the `back/` directory:

```env
DB_URL=jdbc:postgresql://localhost:5432/your_car_your_way
DB_USERNAME=ycyw_user
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key-here-at-least-256-bits-long
JWT_EXPIRATION=86400000
```

### 2. Install Dependencies

```bash
cd back
mvnw clean install
```

### 3. Run Backend

```bash
mvnw spring-boot:run
```

Backend runs on `http://localhost:8080`

## 🎨 Frontend Configuration

### 1. Install Dependencies

```bash
cd front
npm install
```

### 2. Run Frontend

```bash
npm start
```

Frontend runs on `http://localhost:4200`

## 🚀 Usage

### Default Users

After running `data.sql`, you'll have:

**Client Accounts:**
- Email: `jean.dupont@email.com` / Password: `password123`
- Email: `marie.curie@email.com` / Password: `password123`

**Agent Accounts:**
- Email: `marc.agent@yourcaryourway.com` / Password: `password123`
- Email: `lucie.agent@yourcaryourway.com` / Password: `password123`

### Features by Role

**Client:**
- Create support tickets
- Chat with assigned agent
- View own tickets only
- Close tickets

**Agent:**
- View all tickets
- Auto-assignment on first message
- Chat with clients
- Close tickets


## 🔧 Tech Stack

### Backend Dependencies
- **Spring Boot Starter Web** - REST API
- **Spring Boot Starter Security** - Authentication & Authorization
- **Spring Boot Starter WebSocket** - Real-time communication
- **Spring Boot Starter Data JPA** - Database ORM
- **PostgreSQL Driver** - Database connectivity
- **JJWT** (0.11.5) - JWT token generation/validation
- **Dotenv Java** (3.0.0) - Environment variable management
- **Lombok** - Reduce boilerplate code

### Frontend Dependencies
- **Angular** (21.1.0) - Framework
- **Angular Material** (21.1.3) - UI components
- **RxJS** (7.8.0) - Reactive programming
- **SockJS Client** (1.6.1) - WebSocket fallback
- **@stomp/stompjs** (7.3.0) - STOMP protocol
- **Lucide Angular** (0.563.0) - Icon library

## 🔐 Security

- **JWT Authentication** stored in HTTP-only cookies
- **CORS** configured for localhost:4200
- **Password Encryption** using BCrypt
- **CSRF** disabled (cookie-based auth)

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Tickets
- `POST /api/tickets/create` - Create ticket
- `GET /api/tickets/my` - Get user tickets (client)
- `GET /api/tickets/all` - Get all tickets (agent)
- `PUT /api/tickets/{id}/close` - Close ticket

### WebSocket
- **Endpoint**: `/ws`
- **Chat**: `/app/chat/{ticketId}` → `/topic/ticket/{ticketId}`
- **Events**: `/topic/tickets/new`, `/topic/ticket/{ticketId}`

## 📝 Notes

- This is a **PoC** - not production-ready
- Some code patterns (like `mapToDTO` in services) could be refactored for better SOLID compliance in a production app
- Debug logging should be removed before production deployment
- Consider extracting WebSocket logging decorator when moving to production

## 📄 License

This project is for educational purposes.




