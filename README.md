Attendance Dashboard web app built with Next.js (App Router) and Tailwind.

## Setup

1) Configure the API base URL by creating `.env.local`:

```bash
cp .env.local.example .env.local
```

Set `NEXT_PUBLIC_API_URL` to your FastAPI server (default `http://localhost:8000`).

2) Run (PowerShell):

```powershell
npm install
npm run dev
```

Open http://localhost:3000 to view the app.

## Routes

- `/` Home with links
- `/students` Manage students (list/add/remove with photo)
- `/check-in` Webcam capture and check-in

## Backend contract (expected)

- `GET /students` -> `Student[]`
- `POST /students` (multipart: `name`, optional `image`) -> `Student`
- `DELETE /students/{id}` -> 204
- `POST /attendance/check-in` (multipart: `photo`, `date`) -> `{ matched, student?, confidence?, date }`

Configure the FastAPI backend URL via `NEXT_PUBLIC_API_URL`.
