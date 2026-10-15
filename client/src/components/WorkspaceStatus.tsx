import { Database, ShieldCheck } from "lucide-react";

export default function WorkspaceStatus() {
  return (
    <section className="workspace-status" aria-label="Workspace status">
      <div className="workspace-identity">
        <span className="workspace-label">SOVEREIGN WORKSPACE</span>
        <span className="workspace-version">/ v2.4.0</span>
        <span className="workspace-separator" />
        <span className="cluster-meta">
          CLUSTER <span>US-EAST-01</span>
        </span>
      </div>

      <div className="workspace-health">
        <span className="database-status">
          <Database size={12} strokeWidth={1.8} />
          CLIENT READY
        </span>
        <span className="security-pill">
          <ShieldCheck size={12} strokeWidth={1.8} />
          HARDWARE SECURE
        </span>
      </div>
    </section>
  );
}
