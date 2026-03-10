const GITHUB_REPO =
  process.env.NEXT_PUBLIC_GITHUB_REPO || 'yigang666/yigang666.github.io';
const GITHUB_API_BASE =
  process.env.NEXT_PUBLIC_GITHUB_API_BASE || 'https://api.github.com';

export interface CommitInfo {
  sha: string;
  message: string;
  author: string;
  date: string;
}

export interface WorkflowRun {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  created_at: string;
  updated_at: string;
  html_url: string;
}

export interface RepoInfo {
  name: string;
  full_name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  pushed_at: string;
  default_branch: string;
}

async function apiFetch<T>(endpoint: string): Promise<T> {
  const url = `${GITHUB_API_BASE}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (response.status === 403) {
    const remaining = response.headers.get('x-ratelimit-remaining');
    if (remaining === '0') {
      throw new Error('RATE_LIMITED');
    }
  }

  if (!response.ok) {
    throw new Error(`API_ERROR: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchLatestCommit(): Promise<CommitInfo> {
  const data = await apiFetch<
    Array<{
      sha: string;
      commit: {
        message: string;
        author: { name: string; date: string };
      };
    }>
  >(`/repos/${GITHUB_REPO}/commits?per_page=1`);

  if (!data || data.length === 0) {
    throw new Error('NO_COMMITS');
  }

  const commit = data[0];
  return {
    sha: commit.sha.slice(0, 7),
    message: commit.commit.message.split('\n')[0].slice(0, 60),
    author: commit.commit.author.name,
    date: commit.commit.author.date,
  };
}

export async function fetchWorkflowRuns(): Promise<{
  build: WorkflowRun | null;
  deploy: WorkflowRun | null;
  security: WorkflowRun | null;
}> {
  const data = await apiFetch<{ workflow_runs: WorkflowRun[] }>(
    `/repos/${GITHUB_REPO}/actions/runs?per_page=30`
  );

  const runs = data.workflow_runs || [];

  const findLatest = (namePart: string): WorkflowRun | null => {
    return (
      runs.find(
        (r) =>
          r.name.toLowerCase().includes(namePart.toLowerCase()) &&
          r.status === 'completed'
      ) || null
    );
  };

  return {
    build: findLatest('build'),
    deploy: findLatest('deploy'),
    security: findLatest('security'),
  };
}

export async function fetchRepoInfo(): Promise<RepoInfo> {
  return apiFetch<RepoInfo>(`/repos/${GITHUB_REPO}`);
}

export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toISOString().split('T')[0];
}

export function conclusionToStatus(conclusion: string | null): string {
  if (!conclusion) return 'PENDING';
  switch (conclusion.toLowerCase()) {
    case 'success':
      return 'SUCCESS';
    case 'failure':
      return 'FAILURE';
    case 'cancelled':
      return 'CANCELLED';
    case 'skipped':
      return 'SKIPPED';
    default:
      return conclusion.toUpperCase();
  }
}
