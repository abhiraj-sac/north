import { ArrowUpRight, Mountain } from "lucide-react";

export default function Header() {
  return (
    <header className="topbar">
      <a className="brand" href="#" aria-label="NORTH home">
        <span className="brand-mark">
          <Mountain size={17} strokeWidth={1.7} />
        </span>
        <span className="brand-word">NORTH</span>
        <span className="brand-protocol">
          <span className="status-dot" />
          PROTOCOL 04
        </span>
      </a>

      <div className="header-center">
        <span className="header-badge">
          <span className="badge-pulse" />
          PRIVATE BETA
        </span>
      </div>

      <nav className="header-nav" aria-label="Main navigation">
        <a href="#public-dossiers">
          Explore Public Dossiers <ArrowUpRight size={12} strokeWidth={1.8} />
        </a>
        <span className="nav-divider" />
        <a href="#landing">Return to Landing</a>
        <span className="avatar-placeholder" aria-label="Account" role="img">
          N
        </span>
      </nav>
    </header>
  );
}
