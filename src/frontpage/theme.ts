export type ResolvedTheme = "light" | "dark";

const KEY = "forge.settings.v1";

function savedChoice(): "light" | "dark" | "system" {
  try {
    const choice = JSON.parse(localStorage.getItem(KEY) ?? "null")?.appearance
      ?.theme;
    return choice === "light" || choice === "system" ? choice : "dark";
  } catch {
    return "dark";
  }
}

export function readTheme(): ResolvedTheme {
  const choice = savedChoice();
  if (choice === "system") {
    return matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return choice;
}

export function saveTheme(theme: ResolvedTheme): void {
  let settings: Record<string, unknown> = {};
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "null");
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed))
      settings = parsed;
  } catch {
    // A malformed setting should not prevent someone from changing the theme.
  }
  const appearance = settings.appearance;
  settings.appearance = {
    ...(appearance &&
    typeof appearance === "object" &&
    !Array.isArray(appearance)
      ? appearance
      : {}),
    theme,
  };
  localStorage.setItem(KEY, JSON.stringify(settings));
}
