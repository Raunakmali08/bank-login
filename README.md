# 🏦 NexusBank - Secure Banking Login System

A full-stack secure banking login application featuring device fingerprinting, multi-device authentication, and advanced security mechanisms. Built with FastAPI (backend), SQLite (database), and Vanilla JavaScript (frontend).

## 📋 Table of Contents
- [Features](#features)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
  - [Local Setup](#local-setup)
  - [Docker Setup](#docker-setup)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Security Features](#security-features)
- [Project Phases](#project-phases)

---

## ✨ Features

✅ **User Authentication**
- Secure user registration and login
- JWT-based authentication
- Password hashing with bcrypt

✅ **Device Management**
- Device fingerprinting (SHA-256 based on IP + User Agent)
- Multi-device support with trust levels
- Device approval/rejection mechanism
- Remote device session revocation

✅ **Security**
- Context-aware device verification
- CORS protection with explicit policies
- HTTP 403 Forbidden for untrusted devices
- Secure token validation
- Out-of-band device authorization

✅ **User Interface**
- Modern, responsive dashboard design
- Interactive registration and login portals
- Live account simulation (checking/savings)
- Device administration panel
- Beautiful NexusBank aesthetic with CSS variables and gradients

---

## 📁 Project Structure

```
bank-login/
├── backend/
│   ├── main.py              # FastAPI app initialization
│   ├── routes.py            # API endpoints
│   ├── models.py            # SQLAlchemy ORM models
│   ├── database.py          # Database configuration
│   ├── schemas.py           # Pydantic validation schemas
│   ├── security.py          # JWT & security utilities
│   ├── requirements.txt     # Python dependencies
│   └── banking.db           # SQLite database
│
├── frontend/
│   ├── index.html           # Login page
│   ├── register.html        # Registration page
│   ├── dashboard.html       # User dashboard
│   ├── app.js               # Vanilla JavaScript client
│   └── styles.css           # CSS styling
│
├── Dockerfile              # Multi-tier containerization
├── Jenkinsfile             # CI/CD pipeline configuration
├── task.md                 # Project breakdown
└── README.md              # This file
```

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **Backend** | FastAPI (Python 3.11) |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Database** | SQLite with SQLAlchemy ORM |
| **Authentication** | JWT (JSON Web Tokens) |
| **Password Hashing** | bcrypt |
| **Containerization** | Docker |
| **CI/CD** | Jenkins |

---

## 📦 Prerequisites

### For Local Setup
- Python 3.11 or higher
- pip (Python package manager)
- Modern web browser
- Git

### For Docker Setup
- Docker (version 20.10+)
- Docker Compose (optional, but recommended)

---

## 🚀 Installation & Setup

### Local Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/Raunakmali08/bank-login.git
cd bank-login
```

#### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### 3. Start Backend Server
```bash
# From backend directory (with venv activated)
uvicorn main:app --host 0.0.0.0 --port 3000 --reload
```

The backend API will be available at: `http://localhost:3000`

API documentation (Swagger UI): `http://localhost:3000/docs`

#### 4. Start Frontend Server
```bash
# Open a new terminal, navigate to frontend directory
cd frontend

# Start Python HTTP server
python -m http.server 8080
```

The frontend will be available at: `http://localhost:8080`

### Docker Setup

#### Build and Run with Docker

```bash
# From the root directory of the repository
docker build -t nexusbank:latest .

# Run the container
docker run -p 3000:3000 -p 8080:8080 nexusbank:latest
```

Access the application:
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/docs

#### Alternative: Using Docker Compose

Create a `docker-compose.yml` file:
```yaml
version: '3.8'
services:
  nexusbank:
    build: .
    ports:
      - "3000:3000"
      - "8080:8080"
    environment:
      - PYTHONUNBUFFERED=1
```

Then run:
```bash
docker-compose up
```

---

## 💻 Usage

### 1. Register a New User
- Navigate to the login page (`http://localhost:8080/frontend/index.html`)
- Click "Register" or go to `register.html`
- Fill in your credentials
- Your device will be automatically registered and trusted

### 2. Login
- Enter your registered credentials
- If logging from a trusted device, you'll be authenticated immediately
- If logging from a new device, you'll receive a 403 error and need to approve the device

### 3. Approve New Devices
- On the dashboard, go to **Device Management**
- View pending device approval requests
- Approve by re-entering your credentials
- The new device will be added to your trusted devices

### 4. View Dashboard
- After successful authentication, access your account dashboard
- View mock checking and savings accounts
- Manage your trusted devices
- Revoke access from devices you don't recognize

---

## 🔌 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Authenticate user with device verification |
| `GET` | `/auth/me` | Validate and retrieve current user info |

### Device Management Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/auth/devices` | List all trusted devices |
| `POST` | `/auth/devices/approve` | Approve a new device |
| `DELETE` | `/auth/devices/{id}` | Revoke a device |

---

## 🔒 Security Features

### Device Fingerprinting
- **Algorithm**: SHA-256(IP Address + User Agent)
- Unique identification of each device
- Deterministic and consistent

### JWT Authentication
- Token-based authentication
- Secure credential exchange
- localStorage-based token management

### Password Security
- bcrypt hashing with salt rounds
- No plaintext passwords stored
- PyCA implementation for cryptographic security

### CORS Protection
- Explicit origin validation
- Prevents cross-origin attacks
- Configurable allowed origins

### Device Approval Flow
- Out-of-band authorization mechanism
- User must re-authenticate to approve new devices
- HTTP 403 Forbidden for untrusted devices
- Inline approval UI for seamless experience

---

## 📊 Project Phases

### Phase 1: Architecture & Backend ✅
- FastAPI application setup
- SQLAlchemy ORM database models
- Cryptographic utilities (JWT, bcrypt)
- Device fingerprinting algorithm
- RESTful API endpoints

### Phase 2: User Interface & Experience ✅
- Registration and login portals
- Responsive dashboard
- Device management UI
- Premium NexusBank design
- Vanilla JS API client

### Phase 3: Integration & Verification ✅
- End-to-end testing
- Device trust mapping
- Security trigger validation
- Device approval flows

### Phase 4: DevOps & Containerization ✅
- Docker containerization
- Multi-tier deployment
- Jenkins CI/CD pipeline
- Port configuration optimization

---

## 🐛 Troubleshooting

### Backend Connection Issues
```
Error: Connection refused on localhost:3000
Solution: Ensure backend server is running with: uvicorn main:app --host 0.0.0.0 --port 3000
```

### Database Errors
```
Error: banking.db not found
Solution: The database is auto-created on first run. If corrupted, delete banking.db and restart backend.
```

### CORS Errors
```
Error: Access to XMLHttpRequest blocked by CORS
Solution: Verify frontend URL is in backend's CORS allowed origins.
```

### Docker Port Conflicts
```
Error: Bind for 0.0.0.0:3000 failed
Solution: Change port mapping: docker run -p 3001:3000 -p 8081:8080 nexusbank:latest
```

---

## 📝 Environment Variables

Create a `.env` file in the backend directory (optional):
```
DATABASE_URL=sqlite:///./banking.db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the MIT License.

---

## 👨‍💻 Author

**Raunakmali08(Ronin)**

---

---

**Happy Banking! 🚀**
