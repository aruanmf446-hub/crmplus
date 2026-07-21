import type { Metadata } from "next";
import { AuthPage } from "@/components/AuthPage";

export const metadata: Metadata = { title: "Recuperar senha", robots: { index: false, follow: false } };

export default function ForgotPasswordPage() { return <AuthPage mode="forgot" />; }
