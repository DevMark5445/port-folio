import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../lib/api";

function EyeIcon({ off }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
      {off && <path d="M4 4l16 16" />}
    </svg>
  );
}

export default function AdminLogin() {
  const location = useLocation();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState(location.state?.identifier || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
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
      setError(
        loginError.message ||
          "We couldn't sign you in. Check your details and try again."
      );
      setPassword("");
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    "mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 transition focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl md:grid-cols-5">
        {/* Welcome panel */}
        <aside className="hidden flex-col justify-between bg-navy-950 p-10 text-white md:col-span-2 md:flex">
          <div>
            <h2 className="font-display text-2xl font-bold leading-snug">
              Welcome back
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Sign in to manage your content, review activity and keep
              everything running smoothly.
            </p>
          </div>
          <p className="text-sm text-slate-400">
            Having trouble? Contact the person who set up your account.
          </p>
        </aside>

        {/* Form panel */}
        <section className="p-6 sm:p-10 md:col-span-3">
          <h1 className="font-display text-3xl font-bold text-navy-950">
            Sign in to your admin account
          </h1>
          <p className="mt-2 text-slate-600">
            Use the username or email you registered with.
          </p>

          {accountCreated && (
            <p
              role="status"
              className="mt-6 flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800"
            >
              <span aria-hidden="true">✓</span>
              Your administrator account is ready. Sign in to continue.
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="mt-6 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
            >
              <span aria-hidden="true">!</span>
              <span>
                {error}
                <span className="block text-red-700/80">
                  Check your username or email and password, then try again.
                </span>
              </span>
            </p>
          )}

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <label className="block text-sm font-semibold text-slate-800">
              Username or email
              <input
                type="text"
                required
                autoFocus={!identifier}
                autoComplete="username"
                placeholder="e.g. jane@company.com"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                className={inputClass}
              />
            </label>

            <label className="block text-sm font-semibold text-slate-800">
              Password
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoFocus={Boolean(identifier)}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  onKeyUp={(event) =>
                    setCapsOn(event.getModifierState?.("CapsLock") === true)
                  }
                  onBlur={() => setCapsOn(false)}
                  className={`${inputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute right-2 top-1/2 mt-0.5 -translate-y-1/2 rounded-md p-2 text-slate-500 hover:text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                >
                  <EyeIcon off={showPassword} />
                </button>
              </div>
              {capsOn && (
                <span className="mt-1.5 block text-xs font-normal text-amber-700">
                  Caps Lock is on.
                </span>
              )}
            </label>

            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {busy ? (
                <span className="inline-flex items-center gap-2" role="status">
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                    aria-hidden="true"
                  />
                  Signing in…
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className="mt-8 border-t border-slate-200 pt-5 text-sm text-slate-600">
            New here and no admin account yet?{" "}
            <Link
              to="/signup"
              className="font-semibold text-indigo-700 underline underline-offset-2 hover:text-indigo-900"
            >
              Create the admin account
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}