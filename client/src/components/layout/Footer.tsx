import { CheckCircle2 } from "lucide-react";

import "./Footer.css";

function Footer() {
  return (
    <footer className="app-footer">
      <div className="app-footer-left">
        <strong>ABN FLEET SYSTEM</strong>

        <span>Fleet Management System</span>
      </div>

      <div className="app-footer-right">
        <span className="app-footer-status">
          <CheckCircle2 size={14} strokeWidth={2} />
          <span>System Online</span>
        </span>

        <span className="app-footer-separator">•</span>

        <span className="app-footer-version">Version 1.0.0</span>

        <span className="app-footer-separator app-footer-copyright-separator">
          •
        </span>

        <span className="app-footer-copyright">
          © {new Date().getFullYear()} ABN
        </span>
      </div>
    </footer>
  );
}

export default Footer;
