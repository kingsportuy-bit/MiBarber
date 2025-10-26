"use client";

import { usePathname } from "next/navigation";
import './Footer.css';

export function QoderFooter() {
  return (
    <footer className="footer">
      Todos los derechos reservados | © 2025 <a href="https://codexa.uy" className="footer-link">Code<span className="codexa-x">x</span>a.uy</a>
    </footer>
  );
}
