import { useCallback, useEffect, useRef, useState } from "react";
import {
  FaExternalLinkAlt,
  FaGithub,
  FaGlobe,
  FaSignOutAlt,
  FaTrash,
  FaEdit,
  FaRedo,
  FaSearch,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";

/* ---------- constants & helpers ---------- */

const emptyForm = { title: "", category: "", description: "", live_url: "" };
const GH_USER_KEY = "admin:githubUsername";

const HOSTS = [
  { name: "Vercel", url: "https://vercel.com/dashboard" },
  { name: "Netlify", url: "https://app.netlify.com/" },
  { name: "Render", url: "https://dashboard.render.com/" },
  { name: "Cloudflare Pages", url: "https://dash.cloudflare.com/" },
];

const inputCls =
  "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200";
const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-60";
const secondaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 font-semibold hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50";

/** Returns a clean http(s) URL string, or null if the value isn't a valid web address. */
function normalizeUrl(value) {
  const raw = (value || "").trim();
  if (!raw) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    if (!["http:", "https:"].includes(url.protocol) || !url.hostname.includes(".")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function parseGithubRepo(value) {
  const match = (value || "").trim().match(/^https?:\/\/github\.com\/([^/\s]+)\/([^/\s?#]+)/i);
  return match ? { owner: match[1], repo: match[2].replace(/\.git$/i, "") } : null;
}

function cleanGithubUsername(value) {
  return (value || "")
    .trim()
    .replace(/^https?:\/\/github\.com\//i, "")
    .replace(/^@/, "")
    .split(/[/?#]/)[0];
}

const prettify = (text) =>
  (text || "").replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();

const hostOf = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

/* ---------- small components ---------- */

function GithubImporter({ onImport, disabled }) {
  const [username, setUsername] = useState(() => {
    try {
      return localStorage.getItem(GH_USER_KEY) || "";
    } catch {
      return "";
    }
  });
  const [repos, setRepos] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");
  const [pasteUrl, setPasteUrl] = useState("");
  const [pasting, setPasting] = useState(false);
  const controllerRef = useRef(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const name = cleanGithubUsername(username);
  const githubHref = name ? `https://github.com/${name}?tab=repositories` : "https://github.com/";

  const loadRepos = async (event) => {
    event.preventDefault();
    if (!/^[a-z\d](?:[a-z\d-]{0,38})$/i.test(name)) {
      setError("Enter your GitHub username, for example “octocat”.");
      return;
    }
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `https://api.github.com/users/${encodeURIComponent(name)}/repos?per_page=100&sort=updated`,
        { signal: controller.signal, headers: { Accept: "application/vnd.github+json" } }
      );
      if (res.status === 404) throw new Error(`No GitHub user named “${name}” was found.`);
      if (res.status === 403 || res.status === 429)
        throw new Error("GitHub's request limit was reached. Wait a few minutes, or import with a repository link below.");
      if (!res.ok) throw new Error(`GitHub returned an error (${res.status}). Try again shortly.`);
      setRepos(await res.json());
      setLoaded(true);
      try {
        localStorage.setItem(GH_USER_KEY, name);
      } catch {
        /* storage unavailable: not critical */
      }
    } catch (err) {
      if (err.name !== "AbortError") setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const importFromLink = async (event) => {
    event.preventDefault();
    if (!parseGithubRepo(pasteUrl)) {
      setError("That doesn't look like a GitHub repository link (https://github.com/owner/repository).");
      return;
    }
    setPasting(true);
    setError("");
    try {
      onImport(await api.fetchGithubDetails(pasteUrl.trim()));
      setPasteUrl("");
    } catch (err) {
      setError(`Could not import this repository: ${err.message}`);
    } finally {
      setPasting(false);
    }
  };

  const visible = repos.filter((r) =>
    `${r.name} ${r.description || ""}`.toLowerCase().includes(filter.trim().toLowerCase())
  );

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="gh-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="gh-heading" className="font-display text-lg font-bold text-navy-950">
          <FaGithub className="mr-2 inline" aria-hidden="true" />
          Import from GitHub
        </h2>
        <a href={githubHref} target="_blank" rel="noopener noreferrer" className={secondaryBtn}>
          <FaExternalLinkAlt aria-hidden="true" /> Open GitHub
        </a>
      </div>
      <p className="mt-2 text-sm text-slate-600">
        Pick a repository to fill in the title, category and description. If the repository has a website
        set, the live link is filled in too.
      </p>

      <form onSubmit={loadRepos} className="mt-4 flex gap-2">
        <label className="min-w-0 flex-1 text-sm font-semibold text-slate-800">
          GitHub username
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={inputCls}
            placeholder="octocat"
            autoComplete="off"
            spellCheck={false}
          />
        </label>
        <button type="submit" disabled={loading || disabled} className={`${secondaryBtn} self-end`}>
          {loading ? "Loading…" : "Load repositories"}
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-800">
          {error}
        </p>
      )}

      {loaded && (
        <div className="mt-4">
          <label className="relative block">
            <span className="sr-only">Search your repositories</span>
            <FaSearch className="absolute left-3 top-3.5 text-slate-400" aria-hidden="true" />
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={`Search ${repos.length} repositories`}
              className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 focus:border-indigo-500 focus:outline-none"
            />
          </label>
          {visible.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">
              {repos.length === 0 ? "This account has no public repositories." : "No repositories match your search."}
            </p>
          ) : (
            <ul className="mt-3 max-h-64 divide-y divide-slate-100 overflow-y-auto rounded-md border border-slate-200">
              {visible.map((repo) => (
                <li key={repo.id}>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onImport(repo)}
                    className="block w-full px-3 py-2 text-left hover:bg-indigo-50 focus-visible:bg-indigo-50 focus-visible:outline-none disabled:opacity-50"
                  >
                    <span className="font-semibold text-navy-950">{repo.name}</span>
                    {repo.language && <span className="ml-2 text-xs text-slate-500">{repo.language}</span>}
                    {normalizeUrl(repo.homepage) && (
                      <span className="ml-2 rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-800">
                        has live site
                      </span>
                    )}
                    {repo.description && (
                      <span className="block truncate text-sm text-slate-600">{repo.description}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <details className="mt-4 text-sm">
        <summary className="cursor-pointer font-semibold text-indigo-700">Import with a repository link instead</summary>
        <form onSubmit={importFromLink} className="mt-3 flex gap-2">
          <input
            aria-label="GitHub repository link"
            value={pasteUrl}
            onChange={(e) => setPasteUrl(e.target.value)}
            placeholder="https://github.com/owner/repository"
            className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2"
          />
          <button type="submit" disabled={pasting || disabled || !pasteUrl} className={secondaryBtn}>
            {pasting ? "Importing…" : "Import"}
          </button>
        </form>
      </details>
    </section>
  );
}

function ProjectPreview({ form }) {
  const liveUrl = normalizeUrl(form.live_url);
  const empty = !form.title && !form.category && !form.description;
  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24" aria-label="Portfolio preview">
      <h2 className="font-display text-lg font-bold text-navy-950">Portfolio preview</h2>
      <p className="mt-1 text-sm text-slate-600">This is what visitors will see.</p>
      <div className="mt-4 rounded-lg border border-slate-200 p-4">
        {empty ? (
          <p className="text-sm text-slate-500">Your project will appear here as you fill in the form.</p>
        ) : (
          <>
            <p className="text-sm text-slate-500">{form.category || "Category"}</p>
            <h3 className="mt-1 font-display text-xl font-bold text-navy-950">{form.title || "Project title"}</h3>
            <p className="mt-2 text-sm text-slate-700">{form.description || "Description"}</p>
          </>
        )}
        {liveUrl ? (
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <FaExternalLinkAlt aria-hidden="true" /> Visit live site
          </a>
        ) : (
          <p className="mt-4 text-sm text-amber-700">Add a live site link so visitors can open this project.</p>
        )}
      </div>
    </aside>
  );
}

/* ---------- page ---------- */

export default function Admin() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const [setupRequired, setSetupRequired] = useState(null);
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsLoadFailed, setProjectsLoadFailed] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [baseline, setBaseline] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const dirty = JSON.stringify(form) !== JSON.stringify(baseline);

  const loadProjects = useCallback(async () => {
    try {
      setProjects(await api.getProjects());
      setProjectsLoadFailed(false);
    } catch (err) {
      setProjectsLoadFailed(true);
      setError(`Could not load projects: ${err.message}`);
    } finally {
      setProjectsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const checkAccess = async () => {
      try {
        if (api.getToken()) {
          const { user } = await api.me();
          if (!active) return;
          setSession(user);
          setIsAdmin(true);
          setSetupRequired(false);
          setError("");
        } else {
          const { setupRequired: isSetupRequired } = await api.getSetupStatus();
          if (!active) return;
          setSetupRequired(isSetupRequired);
          setError("");
        }
      } catch (err) {
        if (!active) return;
        if (api.getToken()) {
          api.setToken(null);
          setSession(null);
          setIsAdmin(false);
          try {
            const { setupRequired: isSetupRequired } = await api.getSetupStatus();
            if (!active) return;
            setSetupRequired(isSetupRequired);
          } catch (statusError) {
            if (!active) return;
            setSetupRequired(null);
            setError(`Could not check administrator setup: ${statusError.message}`);
          }
        } else {
          setSetupRequired(null);
          setError(`Could not check administrator setup: ${err.message}`);
        }
        setAccessChecked(true);
        return;
      }
      if (active) setAccessChecked(true);
    };
    checkAccess();
    return () => {
      active = false;
    };
  }, [retryCount]);

  useEffect(() => {
    if (isAdmin) loadProjects();
  }, [isAdmin, loadProjects]);

  // Success messages dismiss themselves.
  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(() => setMessage(""), 6000);
    return () => clearTimeout(timer);
  }, [message]);

  // Warn before leaving the page with unsaved changes.
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const handleRetry = useCallback(() => {
    setAccessChecked(false);
    setRetryCount((n) => n + 1);
    setError("");
  }, []);

  const handleSignOut = useCallback(() => {
    api.setToken(null);
    setSession(null);
    setIsAdmin(false);
    setAccessChecked(true);
    setProjects([]);
    setForm(emptyForm);
    setBaseline(emptyForm);
    setEditingId(null);
    setError("");
    setMessage("");
    navigate("/", { replace: true });
  }, [navigate]);

  // An expired session on any request signs the admin out instead of showing a vague error.
  const handleApiError = (err, prefix) => {
    if (err?.status === 401) {
      handleSignOut();
      return;
    }
    setError(`${prefix}: ${err.message}`);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setBaseline(emptyForm);
    setEditingId(null);
  };

  const startEditing = (project) => {
    const next = {
      title: project.title || "",
      category: project.category || "",
      description: project.description || "",
      live_url: project.live_url || "",
    };
    setForm(next);
    setBaseline(next);
    setEditingId(project.id);
    setError("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /** GitHub is only a source of details. The repository link is never saved or published. */
  const importFromRepository = (repo) => {
    const homepage = normalizeUrl(repo.homepage);
    setForm((current) => ({
      title: prettify(repo.name) || current.title,
      category: repo.language || current.category || "Software project",
      description: repo.description || current.description,
      live_url: homepage || current.live_url,
    }));
    setError("");
    setMessage(
      homepage
        ? `Imported “${repo.name}” with its live site link. Check the details, then save.`
        : `Imported “${repo.name}”. Add the live site link below to finish.`
    );
  };

  /** Fills details from the hosted site (Vercel, Netlify, Render, anywhere). */
  const importFromLiveSite = async () => {
    const url = normalizeUrl(form.live_url);
    if (!url) {
      setError("Enter the address of your live site first, for example https://my-project.vercel.app.");
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");

    let details = {};
    let fetched = false;
    if (typeof api.fetchSiteDetails === "function") {
      try {
        details = (await api.fetchSiteDetails(url)) || {};
        fetched = Boolean(details.title || details.description);
      } catch {
        /* fall back to the address-based title below */
      }
    }
    const fallbackTitle = prettify(hostOf(url).split(".")[0]);
    setForm((current) => ({
      ...current,
      live_url: url,
      title: details.title || current.title || fallbackTitle,
      description: details.description || current.description,
      category: current.category || "Web project",
    }));
    setMessage(
      fetched
        ? "Details imported from your live site. Review them, then save."
        : "Couldn't read details from the site, so the title was taken from its address. Please check the rest."
    );
    setBusy(false);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const liveUrl = normalizeUrl(form.live_url);
    if (!liveUrl) {
      setError("Enter a valid live site link, for example https://my-project.vercel.app.");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    const projectData = {
      title: form.title.trim(),
      category: form.category.trim(),
      description: form.description.trim(),
      live_url: liveUrl,
      repository_url: null, // source code links are not published on the portfolio
    };

    try {
      if (editingId) await api.updateProject(editingId, projectData);
      else await api.createProject(projectData);
      setMessage(editingId ? "Project updated." : "Project added to your portfolio.");
      resetForm();
      setProjectsLoading(true);
      await loadProjects();
    } catch (saveError) {
      handleApiError(saveError, "Could not save project");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (project) => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await api.deleteProject(project.id);
      setMessage("Project removed.");
      if (editingId === project.id) resetForm();
      setConfirmId(null);
      setProjectsLoading(true);
      await loadProjects();
    } catch (deleteError) {
      handleApiError(deleteError, "Could not remove project");
    } finally {
      setBusy(false);
    }
  };

  /* ----- loading / access screens ----- */

  if (!accessChecked) {
    return (
      <main className="mx-auto mt-20 max-w-6xl px-6 py-12" aria-busy="true">
        <span className="sr-only" role="status">Loading admin dashboard...</span>
        <div className="space-y-3" aria-hidden="true">
          <div className="admin-skeleton h-9 w-64 rounded-md" />
          <div className="admin-skeleton h-4 w-full max-w-lg rounded" />
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-3" aria-hidden="true">
          <div className="admin-skeleton h-72 rounded-xl lg:col-span-2" />
          <div className="admin-skeleton h-72 rounded-xl" />
        </div>
      </main>
    );
  }

  if (!session) {
    if (setupRequired === null) {
      return (
        <main className="mx-auto mt-24 max-w-lg px-6 py-12">
          <h1 className="font-display text-3xl font-bold text-navy-950">Admin setup unavailable</h1>
          <p role="alert" className="mt-4 text-red-700">
            {error || "Could not determine whether administrator setup is required."}
          </p>
          <p className="mt-3 text-slate-600">
            The admin registration form appears only after the backend confirms that no admin
            account exists. Make sure the backend is running and connected to MongoDB, then retry.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/signup" className={primaryBtn}>Open administrator sign up</Link>
            <button type="button" onClick={handleRetry} className={secondaryBtn}>
              <FaRedo aria-hidden="true" /> Retry
            </button>
          </div>
        </main>
      );
    }

    return (
      <main className="mx-auto mt-24 max-w-lg px-6 py-12">
        <h1 className="font-display text-3xl font-bold text-navy-950">
          {setupRequired ? "Administrator setup required" : "Admin sign in"}
        </h1>
        <p className="mt-3 text-slate-600">
          {setupRequired
            ? "Create the single administrator account. Registration closes automatically after this account is created."
            : "Sign in with your admin username or the email linked to the admin account."}
        </p>
        <Link to={setupRequired ? "/signup" : "/login"} className={`${primaryBtn} mt-8`}>
          {setupRequired ? "Create administrator account" : "Sign in"}
        </Link>
        {error && <p role="alert" className="mt-4 text-red-700">{error}</p>}
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="mx-auto mt-24 max-w-3xl px-6 py-12">
        <h1 className="font-display text-3xl font-bold text-navy-950">Project admin</h1>
        <p role="alert" className="mt-4 text-red-700">{error}</p>
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={handleRetry} className={secondaryBtn}>
            <FaRedo aria-hidden="true" /> Retry
          </button>
          <button type="button" onClick={handleSignOut} className={secondaryBtn}>Sign out</button>
        </div>
      </main>
    );
  }

  /* ----- dashboard ----- */

  return (
    <main className="mx-auto mt-20 max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy-950">Manage projects</h1>
          <p className="mt-2 max-w-xl text-slate-600">
            Add a project by importing it from GitHub or your hosting site. Changes go live on the
            portfolio within a minute, or after a refresh. No redeploy needed.
          </p>
        </div>
        <button type="button" onClick={handleSignOut} className={secondaryBtn}>
          <FaSignOutAlt aria-hidden="true" /> Sign out
        </button>
      </div>

      <div aria-live="polite" className="empty:hidden">
        {error && (
          <p role="alert" className="mt-5 rounded-md bg-red-50 p-3 text-red-800">
            {error}
            {projectsLoadFailed && (
              <button
                type="button"
                onClick={() => {
                  setProjectsLoading(true);
                  setError("");
                  loadProjects();
                }}
                className="ml-3 font-semibold underline"
              >
                Try again
              </button>
            )}
          </p>
        )}
        {message && (
          <p role="status" className="mt-5 rounded-md bg-green-50 p-3 text-green-800">{message}</p>
        )}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {!editingId && <GithubImporter onImport={importFromRepository} disabled={busy} />}

          <form
            onSubmit={handleSave}
            className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2"
          >
            <h2 className="font-display text-xl font-bold text-navy-950 sm:col-span-2">
              {editingId ? "Edit project" : "Project details"}
            </h2>

            <label className="font-semibold text-slate-800 sm:col-span-2">
              Live website link
              <span className="mt-1 flex gap-2">
                <input
                  required
                  inputMode="url"
                  autoComplete="off"
                  value={form.live_url}
                  onChange={(e) => setForm({ ...form, live_url: e.target.value })}
                  className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200"
                  placeholder="https://my-project.vercel.app"
                />
                <button
                  type="button"
                  onClick={importFromLiveSite}
                  disabled={busy || !form.live_url.trim()}
                  className={`${secondaryBtn} shrink-0`}
                >
                  <FaGlobe aria-hidden="true" /> Import from site
                </button>
              </span>
              <span className="mt-1 block text-sm font-normal text-slate-600">
                Visitors open this link from your portfolio. Any public site works, not only Vercel. Find
                yours on:{" "}
                {HOSTS.map((host, index) => (
                  <span key={host.name}>
                    <a
                      href={host.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-indigo-700 underline"
                    >
                      {host.name}
                    </a>
                    {index < HOSTS.length - 1 ? ", " : "."}
                  </span>
                ))}
              </span>
            </label>

            <label className="font-semibold text-slate-800">
              Project title
              <input
                required
                maxLength={120}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={inputCls}
              />
            </label>
            <label className="font-semibold text-slate-800">
              Category
              <input
                required
                maxLength={80}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={inputCls}
                placeholder="e.g. Web app, Mobile app"
              />
            </label>
            <label className="font-semibold text-slate-800 sm:col-span-2">
              Description
              <textarea
                required
                maxLength={1000}
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={inputCls}
              />
              <span className="mt-1 block text-right text-xs font-normal text-slate-500">
                {form.description.length}/1000
              </span>
            </label>

            <p className="text-sm text-slate-600 sm:col-span-2">
              Source code links are never shown on your portfolio. Only the live site is published.
            </p>

            <div className="flex flex-wrap gap-3 sm:col-span-2">
              <button disabled={busy} className={primaryBtn}>
                {busy ? "Saving..." : editingId ? "Save changes" : "Add to portfolio"}
              </button>
              {(editingId || dirty) && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    if (!dirty || window.confirm("Discard your unsaved changes?")) resetForm();
                  }}
                  className={`${secondaryBtn} px-5 py-3`}
                >
                  {editingId ? "Cancel edit" : "Clear form"}
                </button>
              )}
            </div>
          </form>
        </div>

        <ProjectPreview form={form} />
      </div>

      <section className="mt-10" aria-labelledby="project-list-heading">
        <h2 id="project-list-heading" className="font-display text-2xl font-bold text-navy-950">
          Published projects ({projects.length})
        </h2>
        {projectsLoading ? (
          <div className="mt-4 space-y-3" aria-busy="true">
            <span className="sr-only" role="status">Loading projects...</span>
            {[0, 1, 2].map((item) => (
              <div key={item} className="admin-skeleton h-20 rounded-xl border border-slate-200" aria-hidden="true" />
            ))}
          </div>
        ) : projects.length === 0 && !projectsLoadFailed ? (
          <p className="mt-4 rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-600">
            No projects yet. Import one from GitHub above, or enter your live site link to get started.
          </p>
        ) : projects.length > 0 ? (
          <ul className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
            {projects.map((project) => (
              <li key={project.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <h3 className="font-semibold text-navy-950">{project.title}</h3>
                  <p className="text-sm text-slate-600">
                    {project.category}
                    {project.live_url && <> · {hostOf(project.live_url)}</>}
                  </p>
                </div>
                {confirmId === project.id ? (
                  <div className="flex items-center gap-2" role="group" aria-label={`Confirm removing ${project.title}`}>
                    <span className="text-sm font-semibold text-red-700">Remove this project?</span>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleDelete(project)}
                      className="rounded-md bg-red-600 px-3 py-2 font-semibold text-white disabled:opacity-50"
                    >
                      Yes, remove
                    </button>
                    <button type="button" onClick={() => setConfirmId(null)} className={secondaryBtn}>
                      Keep
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {project.live_url && (
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={secondaryBtn}
                      >
                        <FaExternalLinkAlt aria-hidden="true" /> Visit live site
                      </a>
                    )}
                    <button type="button" onClick={() => startEditing(project)} className={secondaryBtn}>
                      <FaEdit aria-hidden="true" /> Edit
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setConfirmId(project.id)}
                      className="inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                    >
                      <FaTrash aria-hidden="true" /> Remove
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </main>
  );
}