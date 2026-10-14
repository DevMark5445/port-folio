import { useCallback, useEffect, useState } from "react";
import { FaGithub, FaSignOutAlt, FaTrash, FaEdit, FaRedo } from "react-icons/fa";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Retry an Supabase RPC call with exponential backoff.
 * Helps ride through transient PostgREST schema-cache misses that
 * resolve themselves, e.g. right after a schema migration is applied.
 */
async function rpcWithRetry(client, rpcName, maxAttempts = 3) {
  let lastError;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await client.rpc(rpcName);
    if (!result.error) return result;
    lastError = result.error;
    if (attempt < maxAttempts - 1) {
      await sleep(500 * Math.pow(2, attempt));
    }
  }
  return { data: null, error: lastError };
}

/**
 * Classify a Supabase/PostgREST error so the UI can show an
 * actionable message instead of a raw server string.
 */
function categorizeRpcError(err) {
  const msg = (err?.message ?? "").toLowerCase();
  const code = err?.code;

  if (
    msg.includes("schema cache") ||
    msg.includes("could not find the function") ||
    code === "PGRST" ||
    msg.includes("pgrest")
  ) {
    return {
      kind: "schema",
      label: "Database function unavailable",
      hint:
        "The function public.is_project_admin is missing or cached stale. " +
        "Run frontend/supabase/admin_access_fix.sql in the SQL Editor for the Supabase project configured in frontend/.env.local, " +
        "then select Retry verification.",
    };
  }

  if (
    msg.includes("permission") ||
    msg.includes("policy") ||
    msg.includes("rls") ||
    code === "42501"
  ) {
    return { kind: "permission", label: "Permission denied" };
  }

  if (msg.includes("jwt") || msg.includes("unauthorized") || msg.includes("auth")) {
    return { kind: "auth", label: "Authentication required" };
  }

  return { kind: "network", label: "Network or server error" };
}

const emptyForm = {
  title: "",
  category: "",
  description: "",
  image_url: "",
  image_alt: "",
  repository_url: "",
  live_url: "",
};

export default function Admin() {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [adminIdentifier, setAdminIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [errorMeta, setErrorMeta] = useState(null);
  const [busy, setBusy] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const loadProjects = useCallback(async () => {
    const { data, error: queryError } = await supabase
      .from("projects")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (queryError) {
      setError(`Could not load projects: ${queryError.message}`);
      return;
    }

    setProjects(data);
  }, []);

  useEffect(() => {
    if (!supabase) return undefined;

    let active = true;
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) setError(`Could not check your session: ${sessionError.message}`);
      setSession(data.session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsAdmin(false);
      setAccessChecked(false);
      setProjects([]);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabase || !session) return undefined;

    let active = true;
    const verifyAdmin = async () => {
      const { data, error: accessError } = await rpcWithRetry(supabase, "is_project_admin");
      if (!active) return;

      if (accessError) {
        const c = categorizeRpcError(accessError);
        setError(
          `Could not verify administrator access: ${c.label}`
        );
        setErrorMeta(c.kind === "schema" ? c : null);
        setAccessChecked(true);
        return;
      }

      setError("");
      setErrorMeta(null);
      setIsAdmin(data === true);
      setAccessChecked(true);
      if (data === true) await loadProjects();
    };

    verifyAdmin();
    return () => {
      active = false;
    };
  }, [session, loadProjects, retryCount]);

  const handleRetry = useCallback(() => {
    setRetryCount((n) => n + 1);
    setError("");
    setErrorMeta(null);
    setIsAdmin(false);
    setAccessChecked(false);
    setProjects([]);
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const identifier = adminIdentifier.trim();
      if (!identifier) {
        throw new Error("Enter your admin username or email.");
      }

      let loginEmail = identifier;
      if (!identifier.includes("@")) {
        const { data, error: usernameError } = await supabase.rpc("get_admin_email_for_username", {
          p_username: identifier,
        });

        if (usernameError || !data) {
          throw new Error("This username is not linked to the portfolio admin.");
        }

        loginEmail = data;
      }

      const { error: loginError } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
      if (loginError) {
        throw new Error(loginError.message);
      }
    } catch (loginError) {
      setError(`Sign in failed: ${loginError.message}`);
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) setError(`Sign out failed: ${signOutError.message}`);
  };

  const importGithubDetails = async () => {
    const match = form.repository_url.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)/i);
    if (!match) {
      setError("Enter a GitHub repository URL before importing its details.");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`https://api.github.com/repos/${match[1]}/${match[2].replace(/\.git$/, "")}`);
      if (!response.ok) {
        throw new Error(response.status === 404 ? "Repository not found or not public." : `GitHub returned ${response.status}.`);
      }

      const repository = await response.json();
      setForm((current) => ({
        ...current,
        title: current.title || repository.name.replace(/[-_]/g, " "),
        category: current.category || repository.language || "Software project",
        description: current.description || repository.description || "",
        repository_url: repository.html_url,
      }));
      setMessage("GitHub repository details imported. Add a Vercel URL and image if you want, then save.");
    } catch (importError) {
      setError(`Could not import GitHub details: ${importError.message}`);
    } finally {
      setBusy(false);
    }
  };

  const startEditing = (project) => {
    setForm({
      title: project.title,
      category: project.category,
      description: project.description,
      image_url: project.image_url || "",
      image_alt: project.image_alt || "",
      repository_url: project.repository_url || "",
      live_url: project.live_url || "",
    });
    setEditingId(project.id);
    setError("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");

    const projectData = {
      title: form.title.trim(),
      category: form.category.trim(),
      description: form.description.trim(),
      image_url: form.image_url.trim() || null,
      image_alt: form.image_alt.trim() || null,
      repository_url: form.repository_url.trim() || null,
      live_url: form.live_url.trim() || null,
    };

    const result = editingId
      ? await supabase.from("projects").update(projectData).eq("id", editingId)
      : await supabase.from("projects").insert(projectData);

    if (result.error) {
      setError(`Could not save project: ${result.error.message}`);
    } else {
      setMessage(editingId ? "Project updated." : "Project added.");
      resetForm();
      await loadProjects();
    }
    setBusy(false);
  };

  const handleDelete = async (project) => {
    if (!window.confirm(`Remove "${project.title}" from the portfolio?`)) return;

    setBusy(true);
    setError("");
    setMessage("");
    const { error: deleteError } = await supabase.from("projects").delete().eq("id", project.id);
    if (deleteError) {
      setError(`Could not remove project: ${deleteError.message}`);
    } else {
      setMessage("Project removed.");
      if (editingId === project.id) resetForm();
      await loadProjects();
    }
    setBusy(false);
  };

  if (!isSupabaseConfigured) {
    return (
      <main className="mx-auto mt-24 max-w-3xl px-6 py-12">
        <h1 className="font-display text-3xl font-bold text-navy-950">Project admin</h1>
        <p className="mt-4 text-slate-700">
          Supabase is not configured yet. Follow the setup steps in the frontend README, then add the Supabase environment variables to your deployment.
        </p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="mx-auto mt-24 max-w-lg px-6 py-12">
        <h1 className="font-display text-3xl font-bold text-navy-950">Admin sign in</h1>
        <p className="mt-3 text-slate-600">Sign in with the administrator username or the Supabase email linked to the admin account.</p>
        <form className="mt-8 space-y-4" onSubmit={handleLogin}>
          <label className="block font-semibold text-slate-800">
            Admin username or email
            <input
              type="text"
              required
              autoComplete="username"
              value={adminIdentifier}
              onChange={(event) => setAdminIdentifier(event.target.value)}
              placeholder="mark or admin@domain.com"
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
          <button disabled={busy} className="rounded-md bg-indigo-600 px-5 py-3 font-semibold text-white disabled:opacity-60">
            {busy ? "Signing in..." : "Sign in"}
          </button>
        </form>
        {error && <p role="alert" className="mt-4 text-red-700">{error}</p>}
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="mx-auto mt-24 max-w-3xl px-6 py-12">
        <h1 className="font-display text-3xl font-bold text-navy-950">Project admin</h1>
        {error ? (
          <>
            <p role="alert" className="mt-4 text-red-700">{error}</p>
            {errorMeta && (
              <p className="mt-3 rounded-md bg-amber-50 p-4 text-sm text-amber-800">
                <strong>{errorMeta.label}</strong> — {errorMeta.hint}
              </p>
            )}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleRetry}
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 font-semibold hover:bg-slate-50"
              >
                <FaRedo aria-hidden="true" /> Retry verification
              </button>
              <button type="button" onClick={handleSignOut} className="rounded-md border px-4 py-2 font-semibold">
                Sign out
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="mt-4 text-slate-700">
              {accessChecked
                ? "This account is not authorized to manage portfolio projects."
                : "Checking administrator access..."}
            </p>
            <button type="button" onClick={handleSignOut} className="mt-6 rounded-md border px-4 py-2 font-semibold">
              Sign out
            </button>
          </>
        )}
      </main>
    );
  }

  return (
    <main className="mx-auto mt-20 max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy-950">Manage projects</h1>
          <p className="mt-2 text-slate-600">Changes are saved without a redeploy and appear on the portfolio within a minute, or after a refresh.</p>
        </div>
        <button type="button" onClick={handleSignOut} className="inline-flex items-center gap-2 rounded-md border px-4 py-2 font-semibold">
          <FaSignOutAlt aria-hidden="true" /> Sign out
        </button>
      </div>

      {error && <p role="alert" className="mt-5 rounded-md bg-red-50 p-3 text-red-800">{error}</p>}
      {message && <p role="status" className="mt-5 rounded-md bg-green-50 p-3 text-green-800">{message}</p>}

      <form onSubmit={handleSave} className="mt-8 grid gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2">
        <h2 className="font-display text-xl font-bold text-navy-950 sm:col-span-2">
          {editingId ? "Edit project" : "Add a project"}
        </h2>
        <label className="font-semibold text-slate-800">
          Project title
          <input required maxLength={120} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>
        <label className="font-semibold text-slate-800">
          Category
          <input required maxLength={80} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>
        <label className="font-semibold text-slate-800 sm:col-span-2">
          Description
          <textarea required maxLength={1000} rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>
        <label className="font-semibold text-slate-800 sm:col-span-2">
          GitHub repository URL
          <span className="mt-1 flex gap-2">
            <input type="url" value={form.repository_url} onChange={(event) => setForm({ ...form, repository_url: event.target.value })} className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2" placeholder="https://github.com/owner/repository" />
            <button type="button" onClick={importGithubDetails} disabled={busy || !form.repository_url} className="inline-flex shrink-0 items-center gap-2 rounded-md border px-3 font-semibold disabled:opacity-50">
              <FaGithub aria-hidden="true" /> Import
            </button>
          </span>
        </label>
        <label className="font-semibold text-slate-800 sm:col-span-2">
          Live project URL (Vercel or other host)
          <input type="url" value={form.live_url} onChange={(event) => setForm({ ...form, live_url: event.target.value })} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" placeholder="https://your-project.vercel.app" />
        </label>
        <label className="font-semibold text-slate-800 sm:col-span-2">
          Preview image URL (optional)
          <input value={form.image_url} onChange={(event) => setForm({ ...form, image_url: event.target.value })} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" placeholder="https://... or /projects/image.png" />
        </label>
        <label className="font-semibold text-slate-800 sm:col-span-2">
          Preview image description (optional)
          <input maxLength={250} value={form.image_alt} onChange={(event) => setForm({ ...form, image_alt: event.target.value })} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>
        <div className="flex flex-wrap gap-3 sm:col-span-2">
          <button disabled={busy} className="rounded-md bg-indigo-600 px-5 py-3 font-semibold text-white disabled:opacity-60">
            {busy ? "Saving..." : editingId ? "Save changes" : "Add project"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="rounded-md border px-5 py-3 font-semibold">
              Cancel edit
            </button>
          )}
        </div>
      </form>

      <section className="mt-10" aria-labelledby="project-list-heading">
        <h2 id="project-list-heading" className="font-display text-2xl font-bold text-navy-950">Published projects ({projects.length})</h2>
        {projects.length === 0 ? (
          <p className="mt-4 text-slate-600">No projects yet. Add your first project using the form above.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
            {projects.map((project) => (
              <li key={project.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div>
                  <h3 className="font-semibold text-navy-950">{project.title}</h3>
                  <p className="text-sm text-slate-600">{project.category}</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => startEditing(project)} className="inline-flex items-center gap-2 rounded-md border px-3 py-2 font-semibold">
                    <FaEdit aria-hidden="true" /> Edit
                  </button>
                  <button type="button" disabled={busy} onClick={() => handleDelete(project)} className="inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 font-semibold text-red-700 disabled:opacity-50">
                    <FaTrash aria-hidden="true" /> Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
