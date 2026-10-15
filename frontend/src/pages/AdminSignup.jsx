import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaRedo } from "react-icons/fa";
import api from "../lib/api";

export default function AdminSignup() {
  const navigate = useNavigate();
  const [setupRequired, setSetupRequired] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;

    api.getSetupStatus()
      .then(({ setupRequired: isSetupRequired }) => {
        if (active) {
          setSetupRequired(isSetupRequired);
          setError("");
        }
      })
      .catch((statusError) => {
        if (active) {
          setSetupRequired(null);
          setError(`Could not check administrator setup: ${statusError.message}`);
        }
      });

    return () => {
      active = false;
    };
  }, [retryCount]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (password !== passwordConfirmation) {
      setError("The passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      await api.registerAdmin({ username, email, password });
      navigate("/login", {
        replace: true,
        state: { accountCreated: true, identifier: username },
      });
    } catch (registrationError) {
      if (registrationError.status === 409) {
        setSetupRequired(false);
        setError("Administrator setup was already completed. Sign in with the existing admin account.");
      } else {
        setError(`Could not create administrator account: ${registrationError.message}`);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto mt-24 max-w-lg px-6 py-12">
      <h1 className="font-display text-3xl font-bold text-navy-950">
        Create administrator account
      </h1>

      {setupRequired === false ? (
        <p className="mt-4 text-slate-600">
          Administrator sign up is closed because an account already exists.{" "}
          <Link to="/login" className="font-semibold text-indigo-700 underline">
            Sign in
          </Link>
          .
        </p>
      ) : (
        <>
          <p className="mt-3 text-slate-600">
            This is the only account that can be created. Once it is registered, sign up will
            be permanently disabled. The backend verifies this before creating the account.
          </p>
          {setupRequired === null && (
            <div className="mt-4 rounded-md bg-amber-50 p-3 text-amber-900">
              <p role={error ? "alert" : "status"}>
                {error || "Checking administrator setup..."}
              </p>
              {error && (
                <>
                  <p className="mt-2 text-sm">
                    The backend must be reachable to create an account. You can fill out this
                    form now; registration is still verified by the backend when submitted.
                  </p>
                  <button
                    type="button"
                    onClick={() => setRetryCount((count) => count + 1)}
                    className="mt-3 inline-flex items-center gap-2 rounded-md border border-amber-300 px-3 py-2 font-semibold hover:bg-amber-100"
                  >
                    <FaRedo aria-hidden="true" /> Retry setup check
                  </button>
                </>
              )}
            </div>
          )}
          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <label className="block font-semibold text-slate-800">
              Admin username
              <input
                type="text"
                required
                minLength={3}
                maxLength={32}
                pattern="[A-Za-z0-9._-]+"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              />
            </label>
            <label className="block font-semibold text-slate-800">
              Admin email
              <input
                type="email"
                required
                maxLength={254}
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              />
            </label>
            <label className="block font-semibold text-slate-800">
              Password (at least 12 characters)
              <input
                type="password"
                required
                minLength={12}
                maxLength={128}
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              />
            </label>
            <label className="block font-semibold text-slate-800">
              Confirm password
              <input
                type="password"
                required
                minLength={12}
                maxLength={128}
                autoComplete="new-password"
                value={passwordConfirmation}
                onChange={(event) => setPasswordConfirmation(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              />
            </label>
            <button
              disabled={busy}
              className="rounded-md bg-indigo-600 px-5 py-3 font-semibold text-white disabled:opacity-60"
            >
              {busy ? "Creating account..." : "Create administrator account"}
            </button>
          </form>
        </>
      )}

      {error && setupRequired !== null && (
        <p role="alert" className="mt-4 text-red-700">{error}</p>
      )}
      <p className="mt-6 text-sm text-slate-600">
        Already created the administrator account?{" "}
        <Link to="/login" className="font-semibold text-indigo-700 underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}
