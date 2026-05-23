# LedgerLite - Bookkeeping for African SMEs

LedgerLite is a production-ready bookkeeping web app designed for African SMEs. It features a Node.js/Express backend and a React/Vite frontend, with Supabase handling authentication and database operations.

## Project Structure

- `backend/`: Node.js Express API
- `frontend/`: React Vite Frontend

## Setup Instructions

### 1. Supabase Setup
1. Create a new project on [Supabase](https://supabase.com).
2. Run the SQL schema provided in the backend documentation to create necessary tables.
3. Enable Email Auth and Row Level Security (RLS) on all tables.

### 2. Backend Setup
1. Navigate to `backend/`.
2. Copy `.env.example` to `.env`.
3. Fill in your `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `FRONTEND_URL`.
4. Run `npm install` and `npm start`.

### 3. Frontend Setup
1. Navigate to `frontend/`.
2. Copy `.env.example` to `.env`.
3. Fill in your `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_API_URL`.
4. Run `npm install` and `npm run dev`.

## Deployment to Render.com

This project is configured for easy deployment to [Render](https://render.com).

1. **Backend**:
   - Create a new "Web Service" on Render.
   - Connect your repository.
   - Set the root directory to `backend/`.
   - Render will automatically detect the `render.yaml` configuration.
   - Add your environment variables in the Render dashboard.

2. **Frontend**:
   - Create a new "Static Site" on Render.
   - Connect your repository.
   - Set the root directory to `frontend/`.
   - Render will automatically detect the `render.yaml` configuration.
   - Add your environment variables in the Render dashboard.

## Deployment Checklist
- [ ] Supabase tables created with RLS enabled.
- [ ] Backend environment variables configured on Render.
- [ ] Frontend environment variables configured on Render.
- [ ] CORS in backend allowed for the frontend URL.
- [ ] Email verification enabled in Supabase Auth settings.
