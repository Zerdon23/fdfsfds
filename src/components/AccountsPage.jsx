import { useState } from "react";
import { formatCurrency, formatPercent, useJournal } from "../state/JournalContext.jsx";

const initialForm = {
  accountName: "",
  propFirm: "",
  platform: "Rithmic",
  startingBalance: "",
  currentBalance: "",
};

export default function AccountsPage() {
  const { accountSummaries, addAccount } = useJournal();
  const [form, setForm] = useState(initialForm);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.accountName.trim() || !form.startingBalance) {
      return;
    }

    addAccount(form);
    setForm(initialForm);
  };

  return (
    <section className="page-grid">
      <div className="panel form-panel">
        <div className="section-heading">
          <p>Manual account tracking</p>
          <h2>Add trading account</h2>
          <span>
            Track Lucid, Alpha, Rithmic, and other prop accounts manually before secure sync is
            introduced later.
          </span>
        </div>

        <form className="stacked-form" onSubmit={handleSubmit}>
          <label>
            Account name
            <input
              name="accountName"
              value={form.accountName}
              onChange={handleChange}
              placeholder="Alpha evaluation 150K"
              required
            />
          </label>

          <div className="form-row">
            <label>
              Prop firm
              <input
                name="propFirm"
                value={form.propFirm}
                onChange={handleChange}
                placeholder="Alpha Futures"
              />
            </label>
            <label>
              Platform
              <input
                name="platform"
                value={form.platform}
                onChange={handleChange}
                placeholder="Rithmic"
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Starting balance
              <input
                name="startingBalance"
                type="number"
                min="0"
                step="0.01"
                value={form.startingBalance}
                onChange={handleChange}
                placeholder="50000"
                required
              />
            </label>
            <label>
              Current balance
              <input
                name="currentBalance"
                type="number"
                min="0"
                step="0.01"
                value={form.currentBalance}
                onChange={handleChange}
                placeholder="Defaults to starting"
              />
            </label>
          </div>

          <button className="primary-button" type="submit">
            Add account
          </button>
        </form>
      </div>

      <div className="panel wide-panel">
        <div className="section-heading compact">
          <p>Portfolio</p>
          <h2>Accounts</h2>
        </div>

        {accountSummaries.length ? (
          <div className="account-table">
            <div className="table-row table-head">
              <span>Account</span>
              <span>Current</span>
              <span>Starting</span>
              <span>Total P&L</span>
              <span>Return</span>
            </div>
            {accountSummaries.map((account) => (
              <div className="table-row" key={account.id}>
                <div>
                  <strong>{account.accountName}</strong>
                  <small>
                    {[account.propFirm, account.platform].filter(Boolean).join(" / ") ||
                      "Manual account"}
                  </small>
                </div>
                <span>{formatCurrency(account.currentBalance)}</span>
                <span>{formatCurrency(account.startingBalance)}</span>
                <span className={account.totalPnl >= 0 ? "positive-text" : "negative-text"}>
                  {formatCurrency(account.totalPnl)}
                </span>
                <span className={account.percentageReturn >= 0 ? "positive-text" : "negative-text"}>
                  {formatPercent(account.percentageReturn)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <strong>No accounts yet</strong>
            <p>Add your first manual account to unlock dashboard balances and P&L tracking.</p>
          </div>
        )}
      </div>
    </section>
  );
}
