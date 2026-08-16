import { uid, hoje } from "./format";

// ─── Configurações globais ─────────────────────────────────────────────────────
export const SETTINGS_PADRAO = {
  energiaKwh: 0.95,        // R$ por kWh na conta de luz
  maoDeObraHora: 25,       // R$ por hora do seu trabalho (pós-processamento)
  custoFixoHora: 0,        // rateio de aluguel/internet/etc por hora de máquina
  taxaFalha: 7,            // % de refugo — impressão que dá errado também custa
  margemAlvo: 40,          // % de margem que você quer atingir
  impostoPct: 0,           // % de imposto (MEI/Simples), 0 se ainda é CPF
  arredondamento: "0,90",  // final psicológico do preço sugerido
};

export const OPCOES_ARREDONDAMENTO = [
  { id: "nenhum", label: "Sem arredondar" },
  { id: "0,90", label: "Terminar em ,90" },
  { id: "0,99", label: "Terminar em ,99" },
  { id: "inteiro", label: "Inteiro (,00)" },
];

// ─── Canais de venda ───────────────────────────────────────────────────────────
// tipo "faixas": comissão muda conforme o preço (Shopee).
// tipo "simples": percentual + valor fixo por pedido.
export const CANAIS_PADRAO = [
  {
    id: "shopee-cpf",
    nome: "Shopee (vendedor CPF)",
    tipo: "faixas",
    faixas: [
      { ate: 79.99, pct: 20, fixo: 4 },
      { ate: 99.99, pct: 14, fixo: 16 },
      { ate: 199.99, pct: 14, fixo: 20 },
      { ate: 499.99, pct: 14, fixo: 26 },
      { ate: null, pct: 14, fixo: 26 },
    ],
    nota: "Comissão + taxa do programa de frete grátis. Confira na sua conta, a Shopee muda a tabela de tempos em tempos.",
  },
  {
    id: "mercado-livre",
    nome: "Mercado Livre (clássico)",
    tipo: "simples",
    pct: 12,
    fixo: 6,
    nota: "Custo fixo por unidade em anúncios abaixo do limite de frete grátis.",
  },
  {
    id: "elo7",
    nome: "Elo7",
    tipo: "simples",
    pct: 12,
    fixo: 0,
    nota: "",
  },
  {
    id: "site-cartao",
    nome: "Site próprio / cartão",
    tipo: "simples",
    pct: 4.99,
    fixo: 0.39,
    nota: "Taxa típica de gateway de pagamento.",
  },
  {
    id: "direto-pix",
    nome: "Venda direta / PIX",
    tipo: "simples",
    pct: 0,
    fixo: 0,
    nota: "Instagram, WhatsApp, feira. Sem comissão de marketplace.",
  },
];

// ─── Onde o modelo veio ────────────────────────────────────────────────────────
export const ORIGENS_MODELO = [
  "Autoral (meu)",
  "Cults3D",
  "Printables",
  "MakerWorld",
  "Thingiverse",
  "Thangs",
  "Patreon / assinatura",
  "Encomenda de designer",
  "Outro",
];

export const LICENCAS = [
  { id: "comercial", label: "Uso comercial liberado", tom: "ok" },
  { id: "autoral", label: "Modelo autoral / meu", tom: "ok" },
  { id: "creditar", label: "Comercial com crédito ao autor", tom: "atencao" },
  { id: "pessoal", label: "Só uso pessoal — NÃO vender", tom: "risco" },
  { id: "checar", label: "Ainda não verifiquei", tom: "atencao" },
];

export const STATUS_PRODUTO = [
  { id: "ideia", label: "Ideia", tom: "neutro" },
  { id: "teste", label: "Em teste", tom: "atencao" },
  { id: "publicado", label: "Publicado", tom: "ok" },
  { id: "pausado", label: "Pausado", tom: "neutro" },
];

// ─── Templates vazios ──────────────────────────────────────────────────────────
export const novaImpressora = () => ({
  id: uid(),
  nome: "",
  valor: "",          // R$ pago na máquina
  vidaUtilHoras: 5000, // horas até trocar/aposentar
  manutencaoAno: "",  // R$/ano em bico, correia, placa...
  horasAno: 1200,     // quantas horas ela roda por ano
  potenciaW: 150,     // consumo médio em watts
});

export const novoFilamento = () => ({
  id: uid(),
  nome: "",
  tipo: "PLA",
  cor: "",
  precoKg: "",
  pesoRoloG: 1000,
  fornecedor: "",
});

export const novoProduto = () => ({
  id: uid(),
  criadoEm: hoje(),
  nome: "",
  emoji: "📦",
  status: "ideia",
  tags: "",

  // ── de onde veio o modelo
  modeloUrl: "",
  modeloOrigem: "Autoral (meu)",
  modeloLicenca: "autoral",
  modeloCusto: "",        // R$ pago pelo STL
  modeloRateio: 10,       // dividido em quantas peças
  modeloAutor: "",

  // ── onde ele está publicado
  anuncioUrl: "",
  anuncioSku: "",
  fotosUrl: "",           // pasta do Drive, canva, etc

  // ── produção
  impressoraId: "",
  filamentoId: "",
  pesoG: "",
  tempoH: "",
  tempoMin: "",
  pecasPorLote: 1,
  posProcessoMin: "",
  embalagem: "",
  extraCusto: "",
  extraDesc: "",

  // ── venda
  canalId: "shopee-cpf",
  freteProprio: "",       // frete que sai do seu bolso
  preco: "",
  precoConcorrencia: "",

  observacoes: "",
});

// ─── Dados de exemplo (primeiro acesso) ────────────────────────────────────────
export function dadosIniciais() {
  const impressora = {
    ...novaImpressora(),
    nome: "Ender 3 V3 SE",
    valor: 1400,
    vidaUtilHoras: 5000,
    manutencaoAno: 200,
    horasAno: 1200,
    potenciaW: 120,
  };
  const filamento = {
    ...novoFilamento(),
    nome: "PLA Branco",
    tipo: "PLA",
    cor: "Branco",
    precoKg: 110,
    pesoRoloG: 1000,
    fornecedor: "3D Fila",
  };
  return {
    settings: SETTINGS_PADRAO,
    canais: CANAIS_PADRAO,
    impressoras: [impressora],
    filamentos: [filamento],
    produtos: [
      {
        ...novoProduto(),
        nome: "Vaso geométrico médio",
        emoji: "🪴",
        status: "publicado",
        modeloOrigem: "Autoral (meu)",
        modeloLicenca: "autoral",
        impressoraId: impressora.id,
        filamentoId: filamento.id,
        pesoG: 320,
        tempoH: 14,
        tempoMin: 30,
        posProcessoMin: 25,
        embalagem: 3.5,
        canalId: "shopee-cpf",
        preco: 119.9,
      },
    ],
  };
}
