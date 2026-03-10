import React, { useEffect, useState, useCallback } from 'react';
import {
  fetchLatestCommit,
  fetchWorkflowRuns,
  fetchRepoInfo,
  formatDate,
  conclusionToStatus,
  type CommitInfo,
  type WorkflowRun,
  type RepoInfo,
} from '../../lib/githubApi';

const REFRESH_MS =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_DASHBOARD_REFRESH_SECONDS
    ? parseInt(process.env.NEXT_PUBLIC_DASHBOARD_REFRESH_SECONDS, 10)
    : 60) * 1000;

const G = '#00ff41';
const C = '#00e5ff';
const A = '#ffb300';
const R = '#ff3b3b';
const DIM = '#4a7c59';
const W = '#c8ffc8';

interface State {
  loading: boolean;
  rateLimited: boolean;
  commit: CommitInfo | null;
  buildRun: WorkflowRun | null;
  deployRun: WorkflowRun | null;
  securityRun: WorkflowRun | null;
  repoInfo: RepoInfo | null;
  lastFetched: string | null;
}

function Badge({ value }: { value: string | null }) {
  if (!value) return <span style={{ color: DIM }}>N/A</span>;
  if (value === 'SUCCESS' || value === 'PASS')
    return <span className="glow" style={{ color: G }}>✔ {value}</span>;
  if (value === 'FAILURE' || value === 'FAIL')
    return <span className="glow-red" style={{ color: R }}>✘ {value}</span>;
  if (value === 'PENDING' || value === 'IN_PROGRESS')
    return <span className="glow-amber" style={{ color: A }}>{value}</span>;
  if (value === 'RATE_LIMITED')
    return <span style={{ color: R }}>⚠ RATE LIMITED</span>;
  return <span style={{ color: W }}>{value}</span>;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2 items-baseline">
      <span className="w-32 flex-shrink-0 glow text-xs" style={{ color: G }}>{label}</span>
      <span className="font-mono text-sm">{children}</span>
    </div>
  );
}

export default function DashboardCommand() {
  const [s, setS] = useState<State>({
    loading: true, rateLimited: false,
    commit: null, buildRun: null, deployRun: null, securityRun: null,
    repoInfo: null, lastFetched: null,
  });

  const fetchAll = useCallback(async () => {
    setS(p => ({ ...p, loading: true }));
    const [c, w, r] = await Promise.allSettled([
      fetchLatestCommit(), fetchWorkflowRuns(), fetchRepoInfo(),
    ]);
    setS(p => {
      const n = { ...p, loading: false, lastFetched: new Date().toISOString() };
      if (c.status === 'fulfilled') n.commit = c.value;
      else if ((c.reason as Error)?.message === 'RATE_LIMITED') n.rateLimited = true;
      if (w.status === 'fulfilled') {
        n.buildRun = w.value.build;
        n.deployRun = w.value.deploy;
        n.securityRun = w.value.security;
      } else if ((w.reason as Error)?.message === 'RATE_LIMITED') n.rateLimited = true;
      if (r.status === 'fulfilled') n.repoInfo = r.value;
      return n;
    });
  }, []);

  useEffect(() => {
    fetchAll();
    const id = setInterval(fetchAll, REFRESH_MS);
    return () => clearInterval(id);
  }, [fetchAll]);

  const repo = process.env.NEXT_PUBLIC_GITHUB_REPO || 'yigang666/yigang666.github.io';
  const Fetching = () => <span className="glow-amber animate-pulse" style={{ color: A }}>FETCHING...</span>;

  return (
    <div className="font-mono text-sm">
      <div style={{ color: C }} className="glow-cyan">╔══════════════════════════════════════════╗</div>
      <div style={{ color: C }} className="glow-cyan">║&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;DEVOPS DASHBOARD&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;║</div>
      <div style={{ color: C }} className="glow-cyan mb-2">╚══════════════════════════════════════════╝</div>

      <Row label="REPO">{<span style={{ color: C }} className="glow-cyan">{repo}</span>}</Row>

      {s.rateLimited && (
        <div className="mt-1 glow-red" style={{ color: R }}>⚠ GitHub API rate limited — data may be stale</div>
      )}

      <div className="my-2" style={{ borderTop: '1px solid #0d2b0d' }} />

      <div className="space-y-1.5">
        <Row label="CI STATUS">
          {s.loading ? <Fetching /> : <Badge value={s.buildRun ? conclusionToStatus(s.buildRun.conclusion) : null} />}
        </Row>
        <Row label="LAST DEPLOY">
          {s.loading ? <Fetching /> : s.deployRun
            ? <span style={{ color: W }}>{formatDate(s.deployRun.updated_at)}</span>
            : <span style={{ color: DIM }}>N/A</span>}
        </Row>
        <Row label="LATEST COMMIT">
          {s.loading ? <Fetching /> : s.commit
            ? <span>
                <span className="glow-amber" style={{ color: A }}>[{s.commit.sha}]</span>
                {' '}
                <span style={{ color: W }}>{s.commit.message}</span>
              </span>
            : <span style={{ color: DIM }}>N/A</span>}
        </Row>
        <Row label="SECURITY SCAN">
          {s.loading ? <Fetching /> : <Badge value={s.securityRun ? conclusionToStatus(s.securityRun.conclusion) : null} />}
        </Row>
        <Row label="REPO ACTIVITY">
          {s.loading ? <Fetching /> : s.repoInfo
            ? <span>
                <span className="glow-amber" style={{ color: A }}>★ {s.repoInfo.stargazers_count}</span>
                {' · '}
                <span className="glow-cyan" style={{ color: C }}>{s.repoInfo.open_issues_count} issues</span>
                {' · '}
                <span style={{ color: DIM }}>pushed {formatDate(s.repoInfo.pushed_at)}</span>
              </span>
            : <span style={{ color: DIM }}>N/A</span>}
        </Row>
      </div>

      <div className="my-2" style={{ borderTop: '1px solid #0d2b0d' }} />

      <div style={{ color: DIM }} className="text-xs">
        auto-refresh every {REFRESH_MS / 1000}s
        {s.lastFetched && <span> · updated {new Date(s.lastFetched).toLocaleTimeString()}</span>}
        <span> · </span>
        <a href={`https://github.com/${repo}`} target="_blank" rel="noopener noreferrer"
          style={{ color: C }} className="glow-cyan hover:underline">
          view on github
        </a>
      </div>
    </div>
  );
}
