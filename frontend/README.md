# SplitEasy demo UI

React + Vite frontend for the SplitEasy Spring Boot API. **Built with AI help** to demo the backend; all calculations happen on the server.

```powershell
copy .env.example .env
npm install
npm run dev        # http://localhost:5173 (backend must run on :8080)
npm run seed       # optional: demo data, empty database only
npm run build      # production build into dist/
```

Structure:
- `src/api/` – one Axios instance (`client.js`) and one function per endpoint (`spliteasy.js`)
- `src/pages/` – Dashboard, People, Groups, Group details, Expenses
- `src/components/` – panels for members, expenses, balances, settlements; shared UI
- `scripts/seed-demo.mjs` – creates demo data through the real API

See the main [README](../README.md) for setup, the endpoint map and limitations.
