import React from "react";
import "../components/footer.css";

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <span>© {new Date().getFullYear()} cashier web app</span>
        <span>Developed by soldier: Shady ahmed</span>
        <span>All rights reserved</span>
      </div>
    </footer>
  );
}
