import Link from "next/link";
import { Header } from "@/components/Header";

export default function NotFound() {
  return <><Header /><main className="not-found shell"><p className="eyebrow">Página não encontrada</p><h1>Essa solução ainda não está por aqui.</h1><Link className="button button-primary" href="/">Voltar para a CRM Plus Store</Link></main></>;
}
