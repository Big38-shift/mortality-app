# Mortality Predictor Frontend - Refactored with Backend Integration

## Overview
The frontend has been professionally refactored to:
- ✅ Connect to the FastAPI backend
- ✅ Implement JWT-based authentication
- ✅ Remove local SQLite database
- ✅ Add login and signup pages
- ✅ Load all data from backend API

## Architecture Changes

### Before
- Express + SQLite for local data persistence
- No authentication
- Standalone application

### After
- Vite + React frontend only
- JWT authentication with FastAPI backend
- Protected routes
- API service layer for clean backend calls
- React Router for navigation

## Project Structure

```
src/
├── pages/
│   ├── LoginPage.tsx        # Login form
│   ├── SignupPage.tsx       # Signup form
├── context/
│   └── AuthContext.tsx      # Auth state management & JWT handling
├── components/
│   └── ProtectedRoute.tsx   # Route protection wrapper
├── services/
│   ├── apiService.ts        # Backend API client
│   └── predictionLogic.ts   # Prediction simulation (unchanged)
├── App.tsx                  # Main predictor component (renamed from export)
├── main.tsx                 # Router & auth provider setup
└── ...other files
```

## Key Files

### 1. AuthContext.tsx
Manages:
- User authentication state
- JWT token storage in localStorage
- Login/register/logout functionality
- Auto-login after registration
- Token refresh on mount

```typescript
// Usage
const { token, user, login, register, logout, isAuthenticated } = useAuth();
```

### 2. apiService.ts
Centralized API client with:
- Automatic JWT header injection
- Error handling
- All prediction endpoints (GET, POST, DELETE)
- Stats endpoint

```typescript
// Usage
await apiService.getPredictions(token);
await apiService.savePrediction(data, token);
```

### 3. LoginPage & SignupPage
- Email/password forms
- Error handling with visual feedback
- Navigation between login/signup
- Auto-redirect to dashboard on success

### 4. main.tsx
- React Router setup with protected routes
- AuthProvider wrapping entire app
- Auto-redirect to /login if not authenticated

## Setup Instructions

### Prerequisites
Ensure the FastAPI backend is running:
```bash
cd mortality_backend
pip install -r requirements.txt
export DATABASE_URL="postgresql://user:password@localhost/mortality_db"
export SECRET_KEY="your-secret-key-here"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

1. **Install dependencies:**
```bash
cd mortality_frontend
npm install
```

2. **Configure backend URL** (if needed):
The app currently expects the backend at the same origin (/api).

If your backend is on a different host, update `API_BASE_URL` in `src/services/apiService.ts`:
```typescript
const API_BASE_URL = 'http://your-backend-url/api';
```

3. **Run development server:**
```bash
npm run dev
```
Open http://localhost:5173

4. **Build for production:**
```bash
npm run build
```

## Workflow

### 1. **User Registration**
```
User enters details → /signup → POST /api/auth/register → Auto-login → Dashboard
```

### 2. **User Login**
```
User enters email/password → /login → POST /api/auth/login → Get JWT → Store in localStorage → Dashboard
```

### 3. **Protected Dashboard**
```
User actions → API calls with Bearer token → Backend verifies JWT → Returns user-specific data
```

### 4. **Data Flow**
```
User interacts with inputs
    ↓
Click "Run Prediction Model"
    ↓
simulatePrediction() - client-side simulation
    ↓
savePrediction() - POST to backend with JWT
    ↓
Backend saves to PostgreSQL with user_id
    ↓
Frontend fetches updated predictions list
```

## Authentication Details

### Token Storage
- JWT stored in `localStorage` as `access_token`
- Automatically included in all API requests via `Authorization: Bearer <token>` header
- Persists across page reloads

### Token Lifecycle
1. **Registration**: User creates account → Server issues JWT → Frontend stores token
2. **Login**: User enters credentials → Server verifies → Issues JWT → Frontend stores token
3. **Session**: Every API call includes token in header
4. **Logout**: Remove token from localStorage → Redirect to /login
5. **Auto-validation**: User profile verified on app load

### Error Handling
- Invalid/expired token → Auto-redirect to /login
- API errors → Display error banner with user-friendly message
- Network errors → Caught and displayed in UI

## Backend Integration Points

### Required Backend Endpoints

| Endpoint | Method | Headers | Body | Response |
|----------|--------|---------|------|----------|
| `/api/auth/register` | POST | Content-Type | `{email, full_name, password}` | User object |
| `/api/auth/login` | POST | Content-Type | `{email, password}` | `{access_token, token_type}` |
| `/api/auth/me` | GET | Authorization | - | User object |
| `/api/predictions` | GET | Authorization | - | Array of predictions |
| `/api/predictions` | POST | Authorization | Prediction data | Saved prediction |
| `/api/predictions/{id}` | DELETE | Authorization | - | `{success: true}` |
| `/api/predictions` | DELETE | Authorization | - | `{success: true}` |
| `/api/stats` | GET | Authorization | - | `{total, highRisk, lowRisk, avgProbability}` |

### CORS Configuration
Backend CORS is already configured in `mortality_backend/app/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Ensure `ALLOWED_ORIGINS` in `.env` includes your frontend URL (default: `http://localhost:3000`, update if needed).

## Development Notes

### Files NOT Used Anymore
- `database.ts` - Local SQLite (can be deleted)
- `server.ts` - Express dev server (can be deleted)

### State Management
- Auth state: React Context (simple & sufficient)
- UI state: Local component state
- Server state: Fetched fresh via API calls

### Error Handling
- Try-catch blocks in all async operations
- User-friendly error messages displayed in UI
- Errors logged to console for debugging

### Security Considerations
- ✅ JWT tokens stored in localStorage (consider httpOnly cookies for production)
- ✅ All API calls include authorization header
- ✅ Backend verifies token before returning user-specific data
- ✅ Password not stored in frontend
- ✅ CORS configured on backend

## Troubleshooting

### "Failed to load data" / API Errors
1. Verify backend is running on correct port (8000)
2. Check CORS configuration in backend `.env`
3. Verify `ALLOWED_ORIGINS` includes frontend URL
4. Check browser console for detailed error

### "Username or password is incorrect"
- Verify user exists in database
- Check backend logs for authentication errors

### Token not persisting
- Check browser's localStorage is enabled
- Verify token is being stored: `localStorage.getItem('access_token')`
- Check token expiration: `ACCESS_TOKEN_EXPIRE_MINUTES` in backend

### Blank page after login
- Check if user was loaded: `useAuth().user`
- Verify `/api/auth/me` endpoint is working
- Check browser console for React errors

## Future Enhancements
- [ ] Implement refresh token rotation
- [ ] Add password reset functionality
- [ ] Implement httpOnly cookie storage for tokens
- [ ] Add user profile settings page
- [ ] Export predictions to CSV
- [ ] Email notifications
- [ ] Advanced analytics dashboard
