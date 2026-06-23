import {
  defaultCustomTheme,
  themeOptions,
  useJournal,
} from "../state/JournalContext.jsx";

const customFields = [
  ["accent", "Primary accent"],
  ["accent2", "Secondary accent"],
  ["background", "Background"],
  ["surface", "Surface"],
];

export default function ThemeSettingsPage() {
  const { theme, customTheme, setTheme, setCustomTheme } = useJournal();

  return (
    <section className="settings-layout">
      <div className="panel">
        <div className="section-heading">
          <p>Workspace theme</p>
          <h2>Theme Settings</h2>
          <span>
            Theme selection is saved locally and applied globally across the dashboard, accounts,
            and journal pages.
          </span>
        </div>

        <div className="theme-grid">
          {themeOptions.map((option) => (
            <button
              className={`theme-option ${theme === option.id ? "active" : ""}`}
              type="button"
              key={option.id}
              onClick={() => setTheme(option.id)}
            >
              <span className={`theme-swatch swatch-${option.id}`} />
              <strong>{option.name}</strong>
              <small>{option.description}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="section-heading compact">
          <p>Custom palette</p>
          <h2>Fine tune colors</h2>
        </div>

        <div className="custom-theme-form">
          {customFields.map(([key, label]) => (
            <label key={key}>
              {label}
              <input
                type="color"
                value={customTheme[key]}
                onChange={(event) => setCustomTheme({ [key]: event.target.value })}
              />
            </label>
          ))}
        </div>

        <div className="theme-preview-card">
          <span>Preview</span>
          <strong>Premium journal workspace</strong>
          <p>Custom accents update the active app theme when Custom is selected.</p>
          <button
            type="button"
            className="secondary-button"
            onClick={() => setCustomTheme(defaultCustomTheme)}
          >
            Reset custom colors
          </button>
        </div>
      </div>
    </section>
  );
}
