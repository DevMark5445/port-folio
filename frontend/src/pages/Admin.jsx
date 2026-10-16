import { useCallback, useEffect, useState } from "react";
import { FaGithub, FaSignOutAlt, FaTrash, FaEdit, FaRedo } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";

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
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const [setupRequired, setSetupRequired] = useState(null);
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const loadProjects = useCallback(async () => {
    try {
      const data = await api.getProjects();
      setProjects(data);
      setError("");
    } catch (err) {
      setError(`Could not load projects: ${err.message}`);
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
    if (isAdmin) {
      loadProjects();
    }
  }, [isAdmin, loadProjects]);

  const handleRetry = useCallback(() => {
    setAccessChecked(false);
    setRetryCount((n) => n + 1);
    setError("");
  }, []);

  const handleSignOut = () => {
    api.setToken(null);
    setSession(null);
    setIsAdmin(false);
    setAccessChecked(true);
    setProjects([]);
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setMessage("");
    navigate("/", { replace: true });
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
      const repository = await api.fetchGithubDetails(form.repository_url);
      setForm((current) => ({
        ...current,
        title: current.title || repository.name.replace(/[-_]/g, " "),
        category: current.category || repository.language || "Software project",
        description: current.description || repository.description || "",
        repository_url: repository.html_url,
      }));
      setMessage(
        "GitHub repository details imported. Add a Vercel URL and image if you want, then save."
      );
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

    try {
      if (editingId) {
        await api.updateProject(editingId, projectData);
      } else {
        await api.createProject(projectData);
      }
      setMessage(editingId ? "Project updated." : "Project added.");
      resetForm();
      await loadProjects();
    } catch (saveError) {
      setError(`Could not save project: ${saveError.message}`);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (project) => {
    if (!window.confirm(`Remove "${project.title}" from the portfolio?`)) return;

    setBusy(true);
    setError("");
    setMessage("");

    try {
      await api.deleteProject(project.id);
      setMessage("Project removed.");
      if (editingId === project.id) resetForm();
      await loadProjects();
    } catch (deleteError) {
      setError(`Could not remove project: ${deleteError.message}`);
    } finally {
      setBusy(false);
    }
  };

  if (!accessChecked) {
    return (
      <main className="mx-auto mt-24 max-w-3xl px-6 py-12">
        <h1 className="font-display text-3xl font-bold text-navy-950">Project admin</h1>
        <p className="mt-4 text-slate-700">Checking administrator access...</p>
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
          <Link
            to="/signup"
            className="mt-6 inline-flex rounded-md bg-indigo-600 px-5 py-3 font-semibold text-white"
          >
            Open administrator sign up
          </Link>
          <button
            type="button"
            onClick={handleRetry}
            className="ml-3 mt-6 inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 font-semibold hover:bg-slate-50"
          >
            <FaRedo aria-hidden="true" /> Retry
          </button>
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
        {setupRequired ? (
          <Link
            to="/signup"
            className="mt-8 inline-flex rounded-md bg-indigo-600 px-5 py-3 font-semibold text-white"
          >
            Create administrator account
          </Link>
        ) : (
          <Link
            to="/login"
            className="mt-8 inline-flex rounded-md bg-indigo-600 px-5 py-3 font-semibold text-white"
          >
            Sign in
          </Link>
        )}
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
          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 font-semibold hover:bg-slate-50"
          >
            <FaRedo aria-hidden="true" /> Retry
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-md border px-4 py-2 font-semibold"
          >
            Sign out
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto mt-20 max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy-950">Manage projects</h1>
          <p className="mt-2 text-slate-600">
            Changes are saved without a redeploy and appear on the portfolio within a minute, or after a refresh.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="inline-flex items-center gap-2 rounded-md border px-4 py-2 font-semibold"
        >
          <FaSignOutAlt aria-hidden="true" /> Sign out
        </button>
      </div>

      {error && <p role="alert" className="mt-5 rounded-md bg-red-50 p-3 text-red-800">{error}</p>}
      {message && <p role="status" className="mt-5 rounded-md bg-green-50 p-3 text-green-800">{message}</p>}

      <form
        onSubmit={handleSave}
        className="mt-8 grid gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2"
      >
        <h2 className="font-display text-xl font-bold text-navy-950 sm:col-span-2">
          {editingId ? "Edit project" : "Add a project"}
        </h2>
        <label className="font-semibold text-slate-800">
          Project title
          <input
            required
            maxLength={120}
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="font-semibold text-slate-800">
          Category
          <input
            required
            maxLength={80}
            value={form.category}
            onChange={(event) => setForm({ ...form, category: event.target.value })}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="font-semibold text-slate-800 sm:col-span-2">
          Description
          <textarea
            required
            maxLength={1000}
            rows={3}
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="font-semibold text-slate-800 sm:col-span-2">
          GitHub repository URL
          <span className="mt-1 flex gap-2">
            <input
              type="url"
              value={form.repository_url}
              onChange={(event) => setForm({ ...form, repository_url: event.target.value })}
              className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2"
              placeholder="https://github.com/owner/repository"
            />
            <button
              type="button"
              onClick={importGithubDetails}
              disabled={busy || !form.repository_url}
              className="inline-flex shrink-0 items-center gap-2 rounded-md border px-3 font-semibold disabled:opacity-50"
            >
              <FaGithub aria-hidden="true" /> Import
            </button>
          </span>
        </label>
        <label className="font-semibold text-slate-800 sm:col-span-2">
          Live project URL (Vercel or other host)
          <input
            type="url"
            value={form.live_url}
            onChange={(event) => setForm({ ...form, live_url: event.target.value })}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            placeholder="https://your-project.vercel.app"
          />
        </label>
        <label className="font-semibold text-slate-800 sm:col-span-2">
          Preview image URL (optional)
          <input
            value={form.image_url}
            onChange={(event) => setForm({ ...form, image_url: event.target.value })}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            placeholder="https://... or /projects/image.png"
          />
        </label>
        <label className="font-semibold text-slate-800 sm:col-span-2">
          Preview image description (optional)
          <input
            maxLength={250}
            value={form.image_alt}
            onChange={(event) => setForm({ ...form, image_alt: event.target.value })}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <div className="flex flex-wrap gap-3 sm:col-span-2">
          <button
            disabled={busy}
            className="rounded-md bg-indigo-600 px-5 py-3 font-semibold text-white disabled:opacity-60"
          >
            {busy ? "Saving..." : editingId ? "Save changes" : "Add project"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-md border px-5 py-3 font-semibold"
            >
              Cancel edit
            </button>
          )}
        </div>
      </form>

      <section className="mt-10" aria-labelledby="project-list-heading">
        <h2 id="project-list-heading" className="font-display text-2xl font-bold text-navy-950">
          Published projects ({projects.length})
        </h2>
        {projects.length === 0 ? (
          <p className="mt-4 text-slate-600">
            No projects yet. Add your first project using the form above.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
            {projects.map((project) => (
              <li
                key={project.id}
                className="flex flex-wrap items-center justify-between gap-4 p-4"
              >
                <div>
                  <h3 className="font-semibold text-navy-950">{project.title}</h3>
                  <p className="text-sm text-slate-600">{project.category}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEditing(project)}
                    className="inline-flex items-center gap-2 rounded-md border px-3 py-2 font-semibold"
                  >
                    <FaEdit aria-hidden="true" /> Edit
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleDelete(project)}
                    className="inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 font-semibold text-red-700 disabled:opacity-50"
                  >
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
