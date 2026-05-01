Live Link --> https://team-task-manager-9.onrender.com/

# Team Task Manager

A production-ready full-stack Team Task Manager built with React 19, Node.js, Express, and MongoDB.

## Tech Stack

- **Frontend**: React 19, Tailwind CSS v4, React Router, Axios
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT

## Local Development

### Backend
```bash
cd backend
cp .env.example .env   # fill in your values
npm install
npm run dev            # runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
echo "VITE_API_URL=http://localhost:5000/api" > .env
npm install
npm run dev            # runs on http://localhost:5173
```

## Deploy to Render

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → New → Blueprint
3. Connect your GitHub repo — Render will read `render.yaml` automatically
4. Set the following environment variables in Render dashboard:

**Backend service (`ttm-backend`):**
| Key | Value |
|-----|-------|
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A long random secret string |
| `CLIENT_URL` | Your frontend Render URL (e.g. `https://ttm-frontend.onrender.com`) |

**Frontend service (`ttm-frontend`):**
| Key | Value |
|-----|-------|
| `VITE_API_URL` | Your backend Render URL + `/api` (e.g. `https://ttm-backend.onrender.com/api`) |


```
