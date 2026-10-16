# React + Vite

## Project administration

The portfolio loads its projects from a separate backend API. The administrator
can manage the live project list through the admin panel at `/admin` — adding
projects directly from a GitHub repository URL — without editing or redeploying
code.

1. Run the backend (see [`../Backend/README.md`](../Backend/README.md)):

   ```bash
   cd ../Backend
   npm install
   npm start
   ```

2. The frontend uses `http://localhost:5000/api` in development. Production
   builds use the backend URL in `.env.production`; update `VITE_API_BASE` there
   if the deployed API URL changes. You can instead set `VITE_API_BASE` in the
   frontend hosting environment.

3. Open `/signup` to create the sole administrator account. The page is
   available only until the first account is created. After setup, registration
   is closed. Sign in at `/login`; successful sign-in opens the admin panel at
   `/admin`. Public user registration is not available.

4. Paste a public GitHub repository URL and use **Import** to fill in the title,
   category, and description. Add a live/deploy URL or a preview image if you
   want, then save. The project is stored in the backend's MongoDB database and
   appears on the portfolio immediately (or after a refresh).

This template provides a minimal setup to get React working in Vite with HMR and
some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/plugin-react/blob/main/packages/plugin-react)
  uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/plugin-react-swc) uses
  [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev
& build performances. To add it, see
[this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend TypeScript with
type-aware lint rules enabled. Check out
the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts)
for information on how to integrate TypeScript and Oxlint's TypeScript related
rules in your project.
