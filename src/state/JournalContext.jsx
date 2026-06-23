import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const JournalContext = createContext(null);

const STORAGE_KEYS = {
  accounts: "apex-ledger:accounts",
  entries: "apex-ledger:daily-pnl-entries",
  theme: "apex-ledger:theme",
  customTheme: "apex-ledger:custom-theme",
};

export const themeOptions = [
  {
    id: "dark",
    name: "Dark",
    description: "Deep neutral workspace for night sessions.",
  },
  {
    id: "light",
    name: "Light",
    description: "Bright, crisp layout for daytime reviews.",
  },
  {
    id: "purple",
    name: "Purple",
    description: "Premium violet accents with a dark base.",
  },
  {
    id: "blue",
    name: "Blue",
    description: "Cool institutional blue with strong contrast.",
  },
  {
    id: "custom",
    name: "Custom",
    description: "Use your own accent and surface colors.",
  },
];

export const defaultCustomTheme = {
  accent: "#9b7cff",
  accent2: "#25d8ff",
  background: "#0b1020",
  surface: "#151b2d",
};

const todayIso = () => new Date().toISOString().slice(0, 10);

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 2,
});

const readStorage = (key, fallback) => {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const writeStorage = (key, value) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
};

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const createId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const formatCurrency = (value) => currencyFormatter.format(toNumber(value));

export const formatPercent = (value) => percentFormatter.format(toNumber(value) / 100);

export const getDisciplineLabel = (entry) => {
  const pnl = toNumber(entry.pnl);
  const followedRules = Boolean(entry.rulesFollowed);

  if (pnl > 0 && followedRules) {
    return "Green day";
  }

  if (pnl > 0 && !followedRules) {
    return "Profitable but undisciplined";
  }

  if (pnl < 0 && followedRules) {
    return "Red day but disciplined";
  }

  if (pnl < 0 && !followedRules) {
    return "Red day and undisciplined";
  }

  return followedRules ? "Flat day and disciplined" : "Flat day needs review";
};

export const getDisciplineTone = (entry) => {
  const pnl = toNumber(entry.pnl);

  if (pnl > 0 && entry.rulesFollowed) {
    return "positive";
  }

  if (pnl < 0 && !entry.rulesFollowed) {
    return "negative";
  }

  return "warning";
};

const normalizeTags = (tags) =>
  String(tags ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

export function JournalProvider({ children }) {
  const [accounts, setAccounts] = useState(() => readStorage(STORAGE_KEYS.accounts, []));
  const [entries, setEntries] = useState(() => readStorage(STORAGE_KEYS.entries, []));
  const [theme, setThemeState] = useState(() => readStorage(STORAGE_KEYS.theme, "dark"));
  const [customTheme, setCustomThemeState] = useState(() =>
    readStorage(STORAGE_KEYS.customTheme, defaultCustomTheme),
  );

  useEffect(() => writeStorage(STORAGE_KEYS.accounts, accounts), [accounts]);
  useEffect(() => writeStorage(STORAGE_KEYS.entries, entries), [entries]);
  useEffect(() => writeStorage(STORAGE_KEYS.theme, theme), [theme]);
  useEffect(() => writeStorage(STORAGE_KEYS.customTheme, customTheme), [customTheme]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;

    if (theme === "custom") {
      root.style.setProperty("--custom-accent", customTheme.accent);
      root.style.setProperty("--custom-accent-2", customTheme.accent2);
      root.style.setProperty("--custom-bg", customTheme.background);
      root.style.setProperty("--custom-surface", customTheme.surface);
    }
  }, [theme, customTheme]);

  const addAccount = useCallback((account) => {
    const startingBalance = toNumber(account.startingBalance);
    const currentBalance =
      account.currentBalance === "" || account.currentBalance === undefined
        ? startingBalance
        : toNumber(account.currentBalance);

    setAccounts((current) => [
      {
        id: createId(),
        accountName: account.accountName.trim(),
        propFirm: account.propFirm.trim(),
        platform: account.platform.trim(),
        startingBalance,
        currentBalance,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
  }, []);

  const addDailyEntry = useCallback((entry) => {
    const pnl = toNumber(entry.pnl);
    const accountId = entry.accountId;

    setEntries((current) => [
      {
        id: createId(),
        date: entry.date || todayIso(),
        accountId,
        pnl,
        tradesTaken: Math.max(0, toNumber(entry.tradesTaken)),
        rulesFollowed: entry.rulesFollowed === true || entry.rulesFollowed === "yes",
        notes: entry.notes.trim(),
        tags: normalizeTags(entry.tags),
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);

    setAccounts((current) =>
      current.map((account) =>
        account.id === accountId
          ? { ...account, currentBalance: toNumber(account.currentBalance) + pnl }
          : account,
      ),
    );
  }, []);

  const setTheme = useCallback((themeId) => {
    setThemeState(themeId);
  }, []);

  const setCustomTheme = useCallback((updates) => {
    setCustomThemeState((current) => ({ ...current, ...updates }));
  }, []);

  const metrics = useMemo(() => {
    const currentDay = todayIso();
    const entriesToday = entries.filter((entry) => entry.date === currentDay);
    const startingBalance = accounts.reduce(
      (sum, account) => sum + toNumber(account.startingBalance),
      0,
    );
    const currentBalance = accounts.reduce(
      (sum, account) => sum + toNumber(account.currentBalance),
      0,
    );
    const dailyPnl = entriesToday.reduce((sum, entry) => sum + toNumber(entry.pnl), 0);
    const totalPnl = currentBalance - startingBalance;
    const disciplinedDays = entries.filter((entry) => entry.rulesFollowed).length;
    const undisciplinedDays = entries.length - disciplinedDays;
    const greenDays = entries.filter((entry) => entry.pnl > 0 && entry.rulesFollowed).length;
    const redDays = entries.filter((entry) => entry.pnl < 0).length;

    return {
      accountCount: accounts.length,
      currentBalance,
      startingBalance,
      totalPnl,
      dailyPnl,
      greenDays,
      redDays,
      disciplinedDays,
      undisciplinedDays,
      ruleFollowingPercentage: entries.length ? (disciplinedDays / entries.length) * 100 : 0,
      combinedReturnPercentage: startingBalance ? (totalPnl / startingBalance) * 100 : 0,
    };
  }, [accounts, entries]);

  const accountSummaries = useMemo(
    () =>
      accounts.map((account) => {
        const accountEntries = entries.filter((entry) => entry.accountId === account.id);
        const dailyPnl = accountEntries
          .filter((entry) => entry.date === todayIso())
          .reduce((sum, entry) => sum + toNumber(entry.pnl), 0);
        const totalPnl = toNumber(account.currentBalance) - toNumber(account.startingBalance);

        return {
          ...account,
          dailyPnl,
          totalPnl,
          percentageReturn: account.startingBalance
            ? (totalPnl / toNumber(account.startingBalance)) * 100
            : 0,
          entryCount: accountEntries.length,
        };
      }),
    [accounts, entries],
  );

  const value = useMemo(
    () => ({
      accounts,
      accountSummaries,
      entries,
      metrics,
      theme,
      customTheme,
      addAccount,
      addDailyEntry,
      setTheme,
      setCustomTheme,
    }),
    [
      accounts,
      accountSummaries,
      entries,
      metrics,
      theme,
      customTheme,
      addAccount,
      addDailyEntry,
      setTheme,
      setCustomTheme,
    ],
  );

  return <JournalContext.Provider value={value}>{children}</JournalContext.Provider>;
}

export function useJournal() {
  const context = useContext(JournalContext);

  if (!context) {
    throw new Error("useJournal must be used within JournalProvider");
  }

  return context;
}
