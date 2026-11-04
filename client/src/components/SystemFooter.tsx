import { Activity, Mountain, Radio } from "lucide-react";

interface SystemFooterProps {
  variant?: "compact" | "landing";
}

export default function SystemFooter({ variant = "compact" }: SystemFooterProps) {
  if (variant === "landing") {
    return (
      <footer className="system-footer-expanded">
        <div className="expanded-footer-columns">
          <section className="expanded-footer-brand" aria-label="NORTH">
            <div className="expanded-footer-wordmark">
              <span className="expanded-footer-mark" aria-hidden="true">
                <Mountain size={14} strokeWidth={1.7} />
              </span>
              <span>NORTH</span>
            </div>
            <p>
              Intelligent career operating experience engineered for high-performing technical
              operators. Architectural precision, sovereign telemetry, and high-craft editorial
              discovery.
            </p>
          </section>

          <section className="expanded-footer-group" aria-labelledby="footer-modules">
            <h2 id="footer-modules">MODULES</h2>
            <ul>
              <li>Dossier Feed</li>
              <li>Studio Synthesis</li>
              <li>Trajectory Map</li>
            </ul>
          </section>

          <section className="expanded-footer-group" aria-labelledby="footer-protocols">
            <h2 id="footer-protocols">PROTOCOLS</h2>
            <ul>
              <li>Linear Matching Engine</li>
              <li>Private Artifact Encryption</li>
              <li>Compensation Ledger</li>
            </ul>
          </section>

          <section
            className="expanded-footer-group expanded-footer-system"
            aria-labelledby="footer-system"
          >
            <h2 id="footer-system">SYSTEM</h2>
            <ul>
              <li>Version: v4.8.2-release</li>
              <li>Operational: 99.98%</li>
              <li>© 2025 NORTH Studio Inc.</li>
            </ul>
          </section>
        </div>

        <div className="expanded-footer-bottom">
          <ul className="expanded-footer-principles" aria-label="NORTH principles">
            <li>Zero Tracking Telemetry</li>
            <li>Tactile Ivory Canvas</li>
            <li>Editorial Standard</li>
          </ul>
          <p>Designed with quiet architectural restraint</p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="system-footer">
      <div className="footer-cluster">
        <span className="footer-brand">NORTH SYSTEMS</span>
        <span className="footer-divider" />
        <span className="footer-label">CAREER INTELLIGENCE, INDEPENDENTLY BUILT</span>
      </div>
      <div className="footer-status">
        <span className="footer-item">
          <Activity size={12} strokeWidth={1.8} />
          ALL SYSTEMS NOMINAL
        </span>
        <span className="footer-item footer-region">
          <Radio size={12} strokeWidth={1.8} />
          N. AMERICA
        </span>
        <span className="footer-build">BUILD 2.4.0</span>
      </div>
    </footer>
  );
}
