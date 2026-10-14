# React + Vite

## Project administration

The portfolio can load projects from Supabase so the administrator can manage the live list at `/admin` without editing or redeploying code.

1. Create a Supabase project and run [`supabase/schema.sql`](./supabase/schema.sql) in its SQL Editor. If the admin page reports that `public.is_project_admin` is missing from the schema cache, run [`supabase/admin_access_fix.sql`](./supabase/admin_access_fix.sql) in the SQL Editor for that same project, then use **Retry verification** or refresh `/admin`.
2. In Supabase Authentication, create the administrator's email/password account. Keep public sign-ups disabled.
3. In the SQL Editor, register that account as the sole project administrator, replacing the UUID with the user's ID from Authentication and choosing a username the admin will use to sign in:

   ```sql
   insert into public.project_admin (singleton, user_id, username)
   values (true, 'ADMIN-AUTH-USER-UUID', 'markadmin');
   ```

   If the row already exists, update it with:

   ```sql
   update public.project_admin
   set username = 'markadmin'
   where singleton = true;
   ```

4. Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from the Supabase project's API settings. Set the same variables in the frontend deployment's environment settings and redeploy once to apply the initial configuration.
5. Open `/admin`, sign in with your admin username or the Supabase email linked to the admin account, and manage projects. The schema seeds the current portfolio projects. For new projects, paste a public GitHub repository URL and use **Import** to fill in its title, category, and description. Add its deployed Vercel URL in the live URL field. Project changes are saved directly to Supabase and appear on the portfolio within a minute (or after a refresh), without another code change or deployment.

The anon key is intended for frontend use; row-level security in the SQL schema permits public reads but restricts project changes to the configured admin. Never put a Supabase service-role key in frontend environment variables.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
