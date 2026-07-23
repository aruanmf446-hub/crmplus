import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Termos da demonstração",
  description: "Condições de uso da demonstração local dos aplicativos CRMPlus+.",
};

export default function TermsPage() {
  return <><Header /><main className="legal-page"><div className="legal-shell"><Link className="legal-back" href="/">← Voltar para a loja</Link><article className="legal-document"><small>Documento da demonstração</small><h1>Termos de uso</h1><p>Estes termos se aplicam à versão de demonstração do CRMPlus+ disponibilizada para avaliação de interface, organização e fluxos operacionais.</p><section><h2>Finalidade</h2><p>Os aplicativos simulam rotinas de pequenas empresas. Eles não substituem sistemas fiscais, contábeis, financeiros, jurídicos, médicos, veterinários ou de segurança obrigatória.</p></section><section><h2>Sem cobrança real</h2><p>Planos, preços e períodos exibidos são uma apresentação comercial. Nenhum cartão é solicitado e nenhuma assinatura é criada nesta fase.</p></section><section><h2>Dados de teste</h2><p>Evite inserir informações sigilosas ou dados pessoais reais. Use exemplos suficientes para validar o fluxo. A conservação dos dados depende do navegador e dos backups exportados pelo próprio usuário.</p></section><section><h2>Responsabilidade pelo backup</h2><p>Como não existe nuvem nesta demonstração, o usuário deve exportar uma cópia antes de limpar o navegador, trocar de dispositivo ou redefinir um aplicativo.</p></section><section><h2>Evolução do produto</h2><p>Funções, textos, aparência e estrutura podem mudar durante o desenvolvimento. Qualquer contratação futura deverá apresentar condições definitivas, suporte, segurança e tratamento de dados em documentos próprios.</p></section><section><h2>Aceite</h2><p className="legal-note">Ao usar a demonstração, você reconhece que ela é local, experimental e não realiza operações financeiras, fiscais ou armazenamento remoto.</p></section></article></div></main><Footer /></>;
}
