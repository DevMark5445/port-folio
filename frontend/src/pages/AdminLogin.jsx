import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function AdminLogin() {
  const location = useLocation();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState(location.state?.identifier || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const accountCreated = location.state?.accountCreated === true;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const { token } = await api.login(identifier.trim(), password);
      api.setToken(token);
      navigate("/admin", { replace: true });
    } catch (loginError) {
      setError(`Sign in failed: ${loginError.message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto mt-24 max-w-lg px-6 py-12">
      <h1 className="font-display text-3xl font-bold text-navy-950">
        Administrator sign in
      </h1>
      <p className="mt-3 text-slate-600">
        Sign in with the admin username or email and password you registered.
      </p>
      {accountCreated && (
        <p role="status" className="mt-5 rounded-md bg-green-50 p-3 text-green-800">
          Administrator account created. Sign in to continue.
        </p>
      )}

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <label className="block font-semibold text-slate-800">
          Admin username or email
          <input
            type="text"
            required
            autoComplete="username"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block font-semibold text-slate-800">
          Password
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <button
          disabled={busy}
          className="rounded-md bg-indigo-600 px-5 py-3 font-semibold text-white disabled:opacity-60"
        >
          {busy ? (
            <span className="inline-flex items-center gap-2" role="status">
              <span className="admin-login-spinner" aria-hidden="true" />
              Signing in...
            </span>
          ) : "Sign in"}
        </button>
      </form>

      {error && <p role="alert" className="mt-4 text-red-700">{error}</p>}
      <p className="mt-6 text-sm text-slate-600">
        Administrator account not created yet?{" "}
        <Link to="/signup" className="font-semibold text-indigo-700 underline">
          Create the admin account
        </Link>
      </p>
    </main>
  );
}
