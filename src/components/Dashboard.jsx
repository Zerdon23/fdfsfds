import {
  formatCurrency,
  formatPercent,
  getDisciplineLabel,
  getDisciplineTone,
  useJournal,
} from "../state/JournalContext.jsx";
import StatCard from "./StatCard.jsx";

export default function Dashboard() {
  const { accountSummaries, entries, metrics } = useJournal();
  const latestEntries = entries.slice(0, 5);

  return (
    <section className="dashboard">
      <div className="hero-panel">
        <div>
          <p className="eyebrow">Premium trading journal</p>
          <h1>Command center for funded account discipline.</h1>
          <p>
            Track Lucid, Alpha, Rithmic, and other trading accounts manually today. Secure API
            syncing can be added later without asking for passwords in the frontend.
          </p>
        </div>
        <div className="hero-balance">
          <span>Combined balance</span>
          <strong>{formatCurrency(metrics.currentBalance)}</strong>
          <small className={metrics.totalPnl >= 0 ? "positive-text" : "negative-text"}>
            {formatCurrency(metrics.totalPnl)} · {formatPercent(metrics.combinedReturnPercentage)}
          </small>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard label="Current balance" value={formatCurrency(metrics.currentBalance)} />
        <StatCard label="Starting balance" value={formatCurrency(metrics.startingBalance)} />
        <StatCard
          label="Total P&L"
          value={formatCurrency(metrics.totalPnl)}
          tone={metrics.totalPnl >= 0 ? "positive" : "negative"}
        />
        <StatCard
          label="Daily P&L"
          value={formatCurrency(metrics.dailyPnl)}
          helper="Today's logged P&L"
          tone={metrics.dailyPnl >= 0 ? "positive" : "negative"}
        />
        <StatCard label="Green days" value={metrics.greenDays} helper="Profitable + rules followed" />
        <StatCard label="Red days" value={metrics.redDays} helper="Negative P&L entries" />
        <StatCard label="Disciplined days" value={metrics.disciplinedDays} helper="Rules followed" />
        <StatCard
          label="Undisciplined days"
          value={metrics.undisciplinedDays}
          helper="Rules not followed"
          tone={metrics.undisciplinedDays ? "warning" : "neutral"}
        />
        <StatCard
          label="Rule-following"
          value={formatPercent(metrics.ruleFollowingPercentage)}
          helper="Disciplined entries / all entries"
        />
      </div>

      <div className="dashboard-grid">
        <div className="panel">
          <div className="section-heading compact">
            <p>Accounts</p>
            <h2>Balance cards</h2>
          </div>

          {accountSummaries.length ? (
            <div className="account-card-grid">
              {accountSummaries.map((account) => (
                <article className="account-card" key={account.id}>
                  <div>
                    <span>{account.propFirm || "Manual account"}</span>
                    <h3>{account.accountName}</h3>
                    <small>{account.platform || "Platform not set"}</small>
                  </div>
                  <strong>{formatCurrency(account.currentBalance)}</strong>
                  <dl>
                    <div>
                      <dt>Starting</dt>
                      <dd>{formatCurrency(account.startingBalance)}</dd>
                    </div>
                    <div>
                      <dt>Total P&L</dt>
                      <dd className={account.totalPnl >= 0 ? "positive-text" : "negative-text"}>
                        {formatCurrency(account.totalPnl)}
                      </dd>
                    </div>
                    <div>
                      <dt>Daily P&L</dt>
                      <dd className={account.dailyPnl >= 0 ? "positive-text" : "negative-text"}>
                        {formatCurrency(account.dailyPnl)}
                      </dd>
                    </div>
                    <div>
                      <dt>Return</dt>
                      <dd
                        className={
                          account.percentageReturn >= 0 ? "positive-text" : "negative-text"
                        }
                      >
                        {formatPercent(account.percentageReturn)}
                      </dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <strong>No accounts connected</strong>
              <p>Add manual accounts to see current balance, daily P&L, and total return here.</p>
            </div>
          )}
        </div>

        <div className="panel">
          <div className="section-heading compact">
            <p>Review loop</p>
            <h2>Latest discipline notes</h2>
          </div>

          {latestEntries.length ? (
            <div className="compact-history">
              {latestEntries.map((entry) => (
                <article key={entry.id}>
                  <div>
                    <strong>{entry.date}</strong>
                    <span className={`status-pill tone-${getDisciplineTone(entry)}`}>
                      {getDisciplineLabel(entry)}
                    </span>
                  </div>
                  <small className={entry.pnl >= 0 ? "positive-text" : "negative-text"}>
                    {formatCurrency(entry.pnl)}
                  </small>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <strong>No entries yet</strong>
              <p>Your latest rule-following decisions and P&L labels will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
