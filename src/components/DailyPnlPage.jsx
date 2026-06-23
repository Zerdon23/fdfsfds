import { useMemo, useState } from "react";
import {
  formatCurrency,
  getDisciplineLabel,
  getDisciplineTone,
  useJournal,
} from "../state/JournalContext.jsx";

const todayIso = () => new Date().toISOString().slice(0, 10);

const initialForm = {
  date: todayIso(),
  accountId: "",
  pnl: "",
  tradesTaken: "",
  rulesFollowed: "yes",
  notes: "",
  tags: "",
};

export default function DailyPnlPage() {
  const { accountSummaries, entries, addDailyEntry } = useJournal();
  const [form, setForm] = useState(initialForm);

  const accountById = useMemo(
    () => new Map(accountSummaries.map((account) => [account.id, account])),
    [accountSummaries],
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.accountId || form.pnl === "") {
      return;
    }

    addDailyEntry(form);
    setForm((current) => ({
      ...initialForm,
      date: current.date,
      accountId: current.accountId,
    }));
  };

  return (
    <section className="page-grid">
      <div className="panel form-panel">
        <div className="section-heading">
          <p>Daily closeout</p>
          <h2>Log P&amp;L</h2>
          <span>
            Positive values increase the selected account balance. Negative values reduce it and
            stay in history for review.
          </span>
        </div>

        <form className="stacked-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              Date
              <input name="date" type="date" value={form.date} onChange={handleChange} required />
            </label>
            <label>
              Account
              <select
                name="accountId"
                value={form.accountId}
                onChange={handleChange}
                required
                disabled={!accountSummaries.length}
              >
                <option value="">Select account</option>
                {accountSummaries.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.accountName}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-row">
            <label>
              P&amp;L amount
              <input
                name="pnl"
                type="number"
                step="0.01"
                value={form.pnl}
                onChange={handleChange}
                placeholder="450 or -275"
                required
              />
            </label>
            <label>
              Trades taken
              <input
                name="tradesTaken"
                type="number"
                min="0"
                step="1"
                value={form.tradesTaken}
                onChange={handleChange}
                placeholder="4"
              />
            </label>
          </div>

          <fieldset className="radio-panel">
            <legend>Rules followed?</legend>
            <label>
              <input
                type="radio"
                name="rulesFollowed"
                value="yes"
                checked={form.rulesFollowed === "yes"}
                onChange={handleChange}
              />
              Yes
            </label>
            <label>
              <input
                type="radio"
                name="rulesFollowed"
                value="no"
                checked={form.rulesFollowed === "no"}
                onChange={handleChange}
              />
              No
            </label>
          </fieldset>

          <label>
            Mistakes / tags
            <input
              name="tags"
              value={form.tags}
              onChange={handleChange}
              placeholder="overtrade, late entry, revenge trade"
            />
          </label>

          <label>
            Notes
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="What happened today? What needs to repeat or change?"
              rows="5"
            />
          </label>

          <button className="primary-button" type="submit" disabled={!accountSummaries.length}>
            Save daily P&amp;L
          </button>
        </form>
      </div>

      <div className="panel wide-panel">
        <div className="section-heading compact">
          <p>Journal history</p>
          <h2>Daily entries</h2>
        </div>

        {entries.length ? (
          <div className="history-list">
            {entries.map((entry) => {
              const account = accountById.get(entry.accountId);

              return (
                <article className="history-card" key={entry.id}>
                  <div>
                    <div className="history-card-header">
                      <strong>{account?.accountName ?? "Deleted account"}</strong>
                      <span className={`status-pill tone-${getDisciplineTone(entry)}`}>
                        {getDisciplineLabel(entry)}
                      </span>
                    </div>
                    <small>
                      {entry.date} · {entry.tradesTaken || 0} trades
                    </small>
                  </div>
                  <strong className={entry.pnl >= 0 ? "positive-text" : "negative-text"}>
                    {formatCurrency(entry.pnl)}
                  </strong>
                  {entry.tags.length ? (
                    <div className="tag-row">
                      {entry.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  ) : null}
                  {entry.notes ? <p>{entry.notes}</p> : null}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <strong>No P&amp;L entries yet</strong>
            <p>Create an account first, then submit daily results to build your discipline record.</p>
          </div>
        )}
      </div>
    </section>
  );
}
