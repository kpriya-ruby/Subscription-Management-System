# Brightloop frontend starter

A React + Vite starter for the Brightloop Subscription Management System hackathon project.

## Run locally

```bash
npm install
copy .env.example .env
npm run dev
```

On Windows PowerShell, if `copy` does not work, use:

```powershell
Copy-Item .env.example .env
```

Open the local URL printed by Vite (normally http://localhost:5173).

## Backend connection

Set `VITE_API_BASE_URL` in `.env` to your Flask API base URL. The starter currently uses clearly separated demo data so the UI can be developed before the backend is ready.

## Suggested integration order

1. Agree on endpoint paths and JSON response shapes with the backend teammate.
2. Replace demo functions in `src/services/*` with Axios calls.
3. Connect login and role-based access.
4. Connect plans → subscription → invoice → payment.
5. Test the full flow with both frontend and backend running.

## Notes

- This is a frontend starter, not a complete billing application.
- Payment actions are demo-only and do not charge money.
- Do not put secret keys or payment-provider credentials in frontend code.
