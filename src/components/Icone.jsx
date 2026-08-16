// Ícones de traço, desenhados numa grade de 24. Só os que o app usa.
const CAMINHOS = {
  painel: <><path d="M4 19V11" /><path d="M10 19V5" /><path d="M16 19v-6" /><path d="M22 19H2" /></>,
  produtos: <><path d="M3 8.5 12 3l9 5.5v7L12 21l-9-5.5z" /><path d="M3 8.5 12 14l9-5.5" /><path d="M12 14v7" /></>,
  impressora: <><rect x="5" y="3" width="14" height="6" rx="1.5" /><path d="M5 9h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-1" /><path d="M6 18H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2" /><rect x="7" y="14" width="10" height="7" rx="1.5" /></>,
  filamento: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3.2" /><path d="M12 3v5.8" /><path d="m19.8 16.5-5-2.9" /><path d="m4.2 16.5 5-2.9" /></>,
  ajustes: <><path d="M4 7h9" /><path d="M17 7h3" /><circle cx="15" cy="7" r="2" /><path d="M4 17h3" /><path d="M11 17h9" /><circle cx="9" cy="17" r="2" /></>,
  guia: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15H6.5A2.5 2.5 0 0 0 4 20.5z" /><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H19v3H6.5" /><path d="M9 8h6" /></>,
  coracao: <path d="M12 20s-7.5-4.6-7.5-10A4 4 0 0 1 12 7.4 4 4 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z" />,
  cubo: <><path d="M12 2.5 20.5 7v10L12 21.5 3.5 17V7z" /><path d="M3.5 7 12 11.6 20.5 7" /><path d="M12 11.6v9.9" /></>,
  loja: <><path d="M4 8h16l-1 12H5z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>,
  moeda: <><circle cx="12" cy="12" r="9" /><path d="M14.5 9.2a3 3 0 0 0-2.5-1.2c-1.5 0-2.5.8-2.5 2s1 1.8 2.5 2 2.5.8 2.5 2-1 2-2.5 2a3 3 0 0 1-2.5-1.2" /><path d="M12 6.2v11.6" /></>,
  link: <><path d="M10 13.5a4 4 0 0 0 5.7 0l2.6-2.6a4 4 0 0 0-5.7-5.7l-1.3 1.3" /><path d="M14 10.5a4 4 0 0 0-5.7 0l-2.6 2.6a4 4 0 1 0 5.7 5.7l1.3-1.3" /></>,
  mais: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
  lixeira: <><path d="M4 7h16" /><path d="M9 7V5h6v2" /><path d="M6 7l1 13h10l1-13" /></>,
  copiar: <><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v1" /></>,
  baixar: <><path d="M12 3v12" /><path d="m7 11 5 5 5-5" /><path d="M4 20h16" /></>,
  enviar: <><path d="M12 21V9" /><path d="m7 13 5-5 5 5" /><path d="M4 4h16" /></>,
  busca: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.6-3.6" /></>,
  fechar: <><path d="m6 6 12 12" /><path d="m18 6-12 12" /></>,
  check: <path d="m4 12.5 5 5L20 6.5" />,
  duplicar: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
  alerta: <><path d="M12 4 2.5 20h19z" /><path d="M12 10v4.5" /><path d="M12 17.4v.1" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5.5" /><path d="M12 7.6v.1" /></>,
  seta: <path d="m9 5 7 7-7 7" />,
  cartoes: <><rect x="3" y="4" width="18" height="7" rx="2" /><rect x="3" y="13" width="18" height="7" rx="2" /></>,
  lista: <><path d="M9 6h11" /><path d="M9 12h11" /><path d="M9 18h11" /><path d="M4.5 6h.01" /><path d="M4.5 12h.01" /><path d="M4.5 18h.01" /></>,
  grade: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.8" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.8" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.8" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.8" /></>,
  externo: <><path d="M14 4h6v6" /><path d="m20 4-8.5 8.5" /><path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" /></>,
};

export default function Icone({ nome, tamanho = 18, className }) {
  const caminho = CAMINHOS[nome];
  if (!caminho) return null;
  return (
    <svg
      className={className}
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {caminho}
    </svg>
  );
}
