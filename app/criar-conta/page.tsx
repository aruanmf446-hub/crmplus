import type { Metadata } from "next";
import { AuthPage } from "@/components/AuthPage";

export const metadata: Metadata = { title: "Criar conta", robots: { index: false, follow: false } };

export default function SignupPage() { return <AuthPage mode="signup" />; }
