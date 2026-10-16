# Portfolio backend

Express API for the portfolio admin panel. MongoDB stores the administrator account and projects. The public portfolio can list projects without an account; creating, editing, deleting, reordering, and importing GitHub repository details require an admin token.

## Configure and run

1. Create a MongoDB database (MongoDB Atlas works). Copy `.env.example` to `.env` and set `MONGODB_URI` to the database connection string.
2. Start the API, then open the frontend at `/admin`. When the database has no configured administrator, the page offers one-time administrator setup. Create the admin username, email, and a strong password there; after the first account is created, registration is permanently closed and the page only offers sign-in. On databases from the previous version, setup can claim the old environment-seeded admin record and replace its credentials. The backend also seeds the two projects already displayed in the portfolio.
3. Generate a JWT secret at least 32 characters long. For example, run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` and put the result in `JWT_SECRET`.
4. Install packages and start the API:

   ```powershell
   npm install
   npm run dev
   ```

By default the API listens on `http://localhost:5000`, even if MongoDB is unavailable. In that state, `/api/health` and database-backed routes return `503`; the backend retries the MongoDB connection with increasing delays (up to one minute) and administrator setup and authentication become available once the connection succeeds. CORS allows the local frontend and `https://port-folio-indol-nine.vercel.app` by default. Configure `FRONTEND_ORIGIN` in the backend hosting environment to add other frontend origins; multiple comma-separated origins are supported. Set `GITHUB_TOKEN` if you need a higher GitHub API rate limit; public repositories work without it.

## API routes

| Method | Route | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api` | Public | API route index |
| `GET` | `/api/health` | Public | API and MongoDB health |
| `GET` | `/api/auth/setup-status` | Public | Check whether the one-time administrator setup is still available |
| `POST` | `/api/auth/register` | Public, rate limited, one time only | Create the sole administrator account |
| `POST` | `/api/auth/login` | Public, rate limited | Sign in with admin username/email and password |
| `GET` | `/api/auth/me` | Admin | Verify the current admin token |
| `GET` | `/api/projects` | Public | List projects |
| `GET` | `/api/projects/:id` | Public | Get a project |
| `POST` | `/api/projects` | Admin | Create a project |
| `PUT` / `PATCH` | `/api/projects/:id` | Admin | Update a project |
| `DELETE` | `/api/projects/:id` | Admin | Delete a project |
| `PATCH` | `/api/projects/reorder` | Admin | Save the project order |
| `GET` | `/api/github/details?repository_url=...` | Admin | Read GitHub repository details for the admin form |
| `POST` | `/api/github/import` | Admin | Create a project directly from a GitHub repository |

Send the token returned from login on protected requests as `Authorization: Bearer <token>`. The frontend handles admin login and project management at `/admin`.
