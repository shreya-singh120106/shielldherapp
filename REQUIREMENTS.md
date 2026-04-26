# ShieldHer - Requirements & Setup Guide

## System Requirements

### Minimum Requirements
- **OS**: Windows, macOS, or Linux
- **RAM**: 4GB minimum (8GB recommended)
- **Disk Space**: 2GB available

### Required Software

#### Backend (FastAPI + MongoDB)
- **Python**: 3.8 or higher
- **pip**: Python package manager (comes with Python)
- **MongoDB**: 4.4 or higher (or use MongoDB Atlas for cloud)

#### Frontend (React Native Web + Expo)
- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher (or **Yarn**: 1.22.0 or higher)
- **Expo CLI**: Latest version

## Backend Dependencies

Located in `backend/requirements.txt`:

```
fastapi==0.110.1
uvicorn==0.25.0
boto3>=1.34.129
requests-oauthlib>=2.0.0
cryptography>=42.0.8
python-dotenv>=1.0.1
pymongo==4.5.0
pydantic>=2.6.4
email-validator>=2.2.0
pyjwt>=2.10.1
bcrypt==4.1.3
passlib>=1.7.4
tzdata>=2024.2
motor==3.3.1
pytest>=8.0.0
black>=24.1.1
isort>=5.13.2
flake8>=7.0.0
mypy>=1.8.0
python-jose>=3.3.0
requests>=2.31.0
pandas>=2.2.0
numpy>=1.26.0
python-multipart>=0.0.9
jq>=1.6.0
typer>=0.9.0
anthropic>=0.20.0
```

## Frontend Dependencies

Located in `frontend/package.json`:

### Key Dependencies:
- **expo**: React Native framework
- **expo-router**: File-based routing
- **react**: UI library
- **react-native**: Mobile framework
- **react-native-web**: Web support for React Native
- **@react-navigation**: Navigation library
- **@expo/vector-icons**: Icon library
- **typescript**: Type safety

## Installation Steps

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Configure environment variables
# Create .env file with your settings (MongoDB URI, API keys, etc.)
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install Node dependencies
yarn install
# OR
npm install
```

### 3. Development Servers

**Backend (FastAPI):**
```bash
cd backend
uvicorn server:app --reload --port 8001
```

**Frontend (React Native Web):**
```bash
cd frontend
yarn web
# Opens http://localhost:8081
```

## Environment Variables

### Backend (.env)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT authentication
- `AWS_ACCESS_KEY_ID`: AWS credentials
- `AWS_SECRET_ACCESS_KEY`: AWS credentials

### Frontend (.env)
- `EXPO_PUBLIC_BACKEND_URL`: Backend API URL (default: http://localhost:8001/api)

## Verification

After installation, verify everything is working:

```bash
# Check Python
python --version  # Should be 3.8+

# Check Node
node --version    # Should be 18.0+
npm --version     # Should be 9.0+

# Check Yarn
yarn --version    # Should be 1.22+
```

## Troubleshooting

- **Python version issues**: Use `python3` instead of `python` on macOS/Linux
- **Permission errors**: Add `--user` flag to pip install or use virtual environment
- **Port conflicts**: Change ports in uvicorn and Expo start commands if needed
- **MongoDB connection**: Ensure MongoDB service is running or use cloud connection string

## Additional Resources

See `frontend/RUN_ON_LAPTOP.md` for deployment and PWA setup options.
