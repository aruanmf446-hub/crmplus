import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacidade da demonstração",
  description: "Entenda como a demonstração local do CRMPlus+ mantém conta e registros somente no navegador.",
};

export default function PrivacyPage() {
  return <><Header /><main className="legal-page"><div className="legal-shell"><Link className="legal-back" href="/">← Voltar para a loja</Link><article className="legal-document"><small>Documento da demonstração</small><h1>Privacidade</h1><p>Esta versão do CRMPlus+ foi criada para validar interface e fluxos sem servidor externo. Os pontos abaixo descrevem o comportamento atual da demonstração.</p><section><h2>Onde os dados ficam</h2><p>Conta, sessão, preferências e registros dos aplicativos são armazenados localmente neste navegador. A demonstração não envia esses dados ao GitHub, a um banco externo ou a um serviço de pagamento.</p></section><section><h2>Senha e PIN</h2><p>Senha e PIN são transformados em hash antes de serem gravados. Mesmo assim, esta é uma demonstração local: não use uma senha que você utiliza em outros serviços.</p></section><section><h2>Fotos e anexos</h2><p>Imagens são comprimidas antes do armazenamento. O espaço disponível depende do navegador e do dispositivo. Quando a quota local se aproxima do limite, exporte um backup e remova anexos desnecessários.</p></section><section><h2>Backup e exclusão</h2><p>Cada aplicativo permite exportar e importar um arquivo de backup. A opção de redefinir remove somente os dados daquele aplicativo neste navegador. Limpar os dados do navegador também apaga a demonstração local.</p></section><section><h2>Limites desta fase</h2><p className="legal-note">Não existe sincronização entre dispositivos, recuperação por e-mail, armazenamento em nuvem, cobrança real ou compartilhamento automático de dados nesta versão.</p></section></article></div></main><Footer /></>;
}
