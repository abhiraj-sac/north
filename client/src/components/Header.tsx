import {
  ChevronDown,
  FileStack,
  LogOut,
  Mountain,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useCandidateProfileStatus } from "../auth/CandidateProfileContext";
import { RESUME_LIMIT, useResumeLibrary } from "../auth/ResumeLibraryContext";

interface HeaderProps {
  onLogout?: () => void;
  variant?: "workspace" | "auth";
}

const navigationItems = [
  { label: "Landing", to: "/" },
  { label: "Profile & Resumes", to: "/profile" },
  { label: "Discovered Roles", to: "/roles" },
  { label: "Tailored Resume Studio", to: "/studio" },
  { label: "Application Journey", to: "/journey" },
];

const searchItems = [
  ...navigationItems,
  { label: "Your resumes", to: "/profile#pr-resumes-heading" },
  { label: "Career trajectory", to: "/profile#pr-trajectory-heading" },
  { label: "Technical expertise", to: "/profile#pr-skills-heading" },
  { label: "Projects & artifacts", to: "/profile#pr-projects-heading" },
  { label: "Profile integrity", to: "/profile#profile-integrity" },
];

function getInitials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "N"
  );
}

export default function Header({ onLogout, variant = "workspace" }: HeaderProps) {
  const { user } = useAuth();
  const { resumes } = useResumeLibrary();
  const { hasProfile } = useCandidateProfileStatus();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchResults = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const available = hasProfile
      ? searchItems
      : searchItems.filter((item) => item.to !== "/roles");
    return query
      ? available.filter((item) => item.label.toLowerCase().includes(query))
      : available.slice(0, 5);
  }, [searchTerm, hasProfile]);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    function handleSearchShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setProfileMenuOpen(false);
        setSearchOpen((open) => !open);
      }
    }

    window.addEventListener("keydown", handleSearchShortcut);
    return () => window.removeEventListener("keydown", handleSearchShortcut);
  }, []);

  function closeSearch() {
    setSearchOpen(false);
    setSearchTerm("");
  }

  return (
    <header className={`topbar${variant === "auth" ? " auth-topbar" : " north-topbar"}`}>
      <div className="header-brand-group">
        <Link className="brand" to="/" aria-label="NORTH home">
          <span className="brand-mark">
            <Mountain size={17} strokeWidth={1.7} />
          </span>
          <span className="brand-word">NORTH</span>
        </Link>
        <span className="header-product-label">
          {variant === "auth" ? "PROTOCOL 04" : "Career Intelligence"}
        </span>
      </div>

      {variant === "auth" ? (
        <div className="header-center">
          <span className="header-badge">
            <span className="badge-pulse" />
            PRIVATE BETA
          </span>
        </div>
      ) : (
        <>
          <nav className="header-nav" aria-label="Main navigation">
            {navigationItems.map(({ label, to }) =>
              to === "/roles" && !hasProfile ? (
                <span
                  key={to}
                  className="nav-disabled"
                  role="link"
                  aria-disabled="true"
                  title="Generate your profile first to unlock discovered roles"
                >
                  {label}
                </span>
              ) : (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) => (isActive ? "active" : undefined)}
              >
                {label}
              </NavLink>
              ),
            )}
          </nav>
          <div className="header-actions">
            <button
              type="button"
              className={`header-search-trigger${searchOpen ? " is-open" : ""}`}
              onClick={() => {
                setProfileMenuOpen(false);
                setSearchOpen((open) => !open);
              }}
              aria-expanded={searchOpen}
              aria-controls="north-search-panel"
            >
              {searchOpen ? <X size={15} /> : <Search size={15} />}
              <span>Search</span>
              <kbd>Ctrl K</kbd>
            </button>
            <Link
              to="/profile"
              className="header-resume-usage"
              aria-label={`${resumes.length} of ${RESUME_LIMIT} resume slots used`}
            >
              <FileStack size={14} />
              <span>{resumes.length} of {RESUME_LIMIT}</span>
            </Link>
            <div className="header-profile-wrap">
              <button
                className="header-profile-button"
                type="button"
                onClick={() => {
                  closeSearch();
                  setProfileMenuOpen((open) => !open);
                }}
                aria-label="Open profile menu"
                aria-expanded={profileMenuOpen}
                aria-controls="north-profile-menu"
              >
                <span className="header-user-avatar" aria-hidden="true">
                  {getInitials(user?.name ?? "")}
                </span>
                <ChevronDown size={13} />
              </button>
              {profileMenuOpen && (
                <div className="header-profile-menu" id="north-profile-menu">
                  <div className="header-menu-identity">
                    <strong>{user?.name ?? "NORTH member"}</strong>
                    <span>{user?.email}</span>
                  </div>
                  <Link to="/profile" onClick={() => setProfileMenuOpen(false)}>
                    <UserRound size={15} />
                    Professional identity
                  </Link>
                  {onLogout && (
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        onLogout();
                      }}
                    >
                      <LogOut size={15} />
                      Sign out
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          {searchOpen && (
            <div className="header-search-panel" id="north-search-panel">
              <label htmlFor="north-search-input">Search NORTH</label>
              <div className="header-search-field">
                <Search size={15} aria-hidden="true" />
                <input
                  ref={searchInputRef}
                  id="north-search-input"
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.currentTarget.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") closeSearch();
                  }}
                  placeholder="Find a workspace or section"
                />
              </div>
              <div className="header-search-results" aria-live="polite">
                {searchResults.length > 0 ? (
                  searchResults.map((item) => (
                    <Link key={item.label} to={item.to} onClick={closeSearch}>
                      {item.label}
                    </Link>
                  ))
                ) : (
                  <p>No matching NORTH pages or sections.</p>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </header>
  );
}
