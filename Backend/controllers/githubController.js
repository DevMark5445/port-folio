import ApiError from "../utils/ApiError.js";
import Project from "../models/Project.js";
import { validateProjectPayload } from "../utils/validateProject.js";

function parseRepoUrl(repositoryUrl) {
  try {
    const parsed = new URL(repositoryUrl);
    const pathParts = parsed.pathname.split("/").filter(Boolean);
    if (
      !["http:", "https:"].includes(parsed.protocol)
      || !["github.com", "www.github.com"].includes(parsed.hostname.toLowerCase())
      || pathParts.length !== 2
    ) {
      return null;
    }

    return {
      owner: pathParts[0],
      repo: pathParts[1].replace(/\.git$/i, ""),
    };
  } catch {
    return null;
  }
}

async function getRepository(repositoryUrl) {
  if (typeof repositoryUrl !== "string") {
    throw new ApiError(400, "repository_url (GitHub URL) is required.");
  }

  const parsed = parseRepoUrl(repositoryUrl.trim());
  if (!parsed?.repo) {
    throw new ApiError(400, "Enter a GitHub repository URL in the format https://github.com/owner/repository.");
  }

  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "portfolio-project-admin",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  let response;
  try {
    response = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(parsed.owner)}/${encodeURIComponent(parsed.repo)}`,
      { headers, signal: AbortSignal.timeout(10000) },
    );
  } catch (error) {
    if (error.name === "TimeoutError" || error.name === "AbortError") {
      throw new ApiError(504, "GitHub did not respond in time. Try importing the repository again.");
    }
    throw new ApiError(502, "Could not connect to GitHub. Try importing the repository again.");
  }

  if (response.status === 404) {
    throw new ApiError(404, "Repository not found or not accessible to the configured GitHub token.");
  }
  if (response.status === 403 || response.status === 429) {
    throw new ApiError(429, "GitHub API rate limit reached. Set GITHUB_TOKEN in the backend environment or try again later.");
  }
  if (!response.ok) {
    throw new ApiError(502, `GitHub returned HTTP ${response.status} while importing the repository.`);
  }

  return response.json();
}

export async function fetchRepoDetails(request, response, next) {
  try {
    const repo = await getRepository(request.query.repository_url);
    response.json({
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description || "",
      language: repo.language,
      html_url: repo.html_url,
      homepage: repo.homepage,
      default_branch: repo.default_branch,
      owner_avatar_url: repo.owner?.avatar_url,
    });
  } catch (error) {
    next(error);
  }
}

export async function importRepo(request, response, next) {
  try {
    const repo = await getRepository(request.body?.repository_url);
    const fields = validateProjectPayload({
      title: repo.name?.replace(/[-_]/g, " ") || repo.full_name,
      category: repo.language || "Software project",
      description: repo.description || `A project from ${repo.full_name}.`,
      repository_url: repo.html_url,
      live_url: repo.homepage || null,
      image_url: repo.owner?.avatar_url || null,
      image_alt: repo.owner?.avatar_url ? `${repo.full_name} repository avatar` : null,
    });
    const highestOrder = await Project.findOne().sort({ sort_order: -1 }).select("sort_order");
    fields.sort_order = highestOrder ? highestOrder.sort_order + 1 : 0;
    const project = await Project.create(fields);
    response.status(201).json({ source: "github", project });
  } catch (error) {
    next(error);
  }
}
