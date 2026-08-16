// ─────────────────────────────────────────────────────────────────────────────
// Identidade e apoio do projeto.
// É o único arquivo que você precisa mexer pra renomear a ferramenta ou trocar
// pra onde vai o dinheiro do apoio.
// ─────────────────────────────────────────────────────────────────────────────

export const MARCA = {
  nome: "Calibra",
  tagline: "O preço certo da sua peça",
  descricao:
    "Calculadora de precificação para impressão 3D: custo real da peça, taxas do marketplace, margem e os links do modelo e do anúncio.",
};

export const APOIO = {
  // Deixe false pra sumir com o botão de apoio do site inteiro.
  ativo: true,

  titulo: "Apoie o Calibra",
  texto:
    "A ferramenta é gratuita e sem anúncio. Se ela te ajudou a não vender no prejuízo, um café ajuda a manter o servidor de pé e as tabelas de taxa atualizadas.",

  // ── Como preencher ─────────────────────────────────────────────────────────
  // No Mercado Pago: Seu negócio → Link de pagamento → crie um link para cada
  // valor e cole a URL curta (mpago.la/...) aqui. Valor sem link fica desativado.
  valores: [
    { rotulo: "R$ 5", nota: "um cafezinho", url: "" },
    { rotulo: "R$ 15", nota: "um rolo de café", url: "", destaque: true },
    { rotulo: "R$ 30", nota: "padrinho da peça", url: "" },
  ],

  // Link de valor livre (o pagador escolha quanto). Opcional.
  urlValorLivre: "",

  // Aparece embaixo do painel, se você quiser deixar um contato.
  contato: "",
};

/** true quando pelo menos um link de pagamento foi configurado. */
export const apoioConfigurado = () =>
  APOIO.ativo &&
  (APOIO.valores.some((v) => v.url.trim()) || APOIO.urlValorLivre.trim());
