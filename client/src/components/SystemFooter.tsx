import { Activity, Radio } from "lucide-react";

export default function SystemFooter() {
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
