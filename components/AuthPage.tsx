import { AppSelector } from "./AppSelector";

export function AuthPage({ mode }: { mode: "signup" | "login" | "forgot" }) {
  return <AppSelector mode={mode} />;
}
