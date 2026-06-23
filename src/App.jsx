import { useState } from "react";
import AccountsPage from "./components/AccountsPage.jsx";
import DailyPnlPage from "./components/DailyPnlPage.jsx";
import Dashboard from "./components/Dashboard.jsx";
import ThemeSettingsPage from "./components/ThemeSettingsPage.jsx";

const navigation = [
  { id: "dashboard", label: "Dashboard" },
  { id: "accounts", label: "Accounts" },
  { id: "journal", label: "Daily P&L" },
  { id: "settings", label: "Theme Settings" },
];

const pageMap = {
  dashboard: <Dashboard />,
  accounts: <AccountsPage />,
  journal: <DailyPnlPage />,
  settings: <ThemeSettingsPage />,
};

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-lockup">
          <div className="brand-mark">AL</div>
          <div>
            <strong>Apex Ledger</strong>
            <span>Trading Journal</span>
          </div>
        </div>

        <nav aria-label="Primary navigation">
          {navigation.map((item) => (
            <button
              className={activePage === item.id ? "active" : ""}
              type="button"
              key={item.id}
              onClick={() => setActivePage(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="security-note">
          <strong>Security first</strong>
          <p>
            Rithmic sync is intentionally manual for now. API credentials should only be handled by
            a secure backend integration later.
          </p>
        </div>
      </aside>

      <main>
        <header className="topbar">
          <div>
            <span>Manual mode</span>
            <strong>Prop account performance journal</strong>
          </div>
          <div className="topbar-pill">Local storage enabled</div>
        </header>

        {pageMap[activePage]}
      </main>
    </div>
  );
}
