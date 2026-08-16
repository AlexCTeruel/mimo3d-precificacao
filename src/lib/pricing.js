import { num } from "./format";

// ─── Custo da impressora por hora ──────────────────────────────────────────────
export function custoHoraImpressora(impressora, settings) {
  if (!impressora) return { depreciacao: 0, manutencao: 0, energia: 0, total: 0 };

  const vidaUtil = Math.max(1, num(impressora.vidaUtilHoras));
  const horasAno = Math.max(1, num(impressora.horasAno));

  const depreciacao = num(impressora.valor) / vidaUtil;
  const manutencao = num(impressora.manutencaoAno) / horasAno;
  const energia = (num(impressora.potenciaW) / 1000) * num(settings.energiaKwh);

  return {
    depreciacao,
    manutencao,
    energia,
    total: depreciacao + manutencao + energia,
  };
}

// ─── Preço do filamento por grama ──────────────────────────────────────────────
export function precoPorGrama(filamento) {
  if (!filamento) return 0;
  const peso = Math.max(1, num(filamento.pesoRoloG));
  return num(filamento.precoKg) / peso;
}

// ─── Quais filamentos e canais esse produto usa ────────────────────────────────
/** No modo simples é um filamento só; no multifilamento, um por cor. */
export function filamentosDoProduto(produto) {
  if (produto.multiFilamento) {
    return (produto.filamentosUsados || []).filter((u) => u.filamentoId);
  }
  return produto.filamentoId ? [{ filamentoId: produto.filamentoId, pesoG: produto.pesoG }] : [];
}

/** O primeiro da lista é o principal: é dele que sai o resultado em destaque. */
export function canaisDoProduto(produto, canais) {
  const ids = produto.canaisIds?.length
    ? produto.canaisIds
    : [produto.canalId].filter(Boolean);
  const escolhidos = ids.map((id) => canais.find((c) => c.id === id)).filter(Boolean);
  return escolhidos.length ? escolhidos : canais.slice(0, 1);
}

// ─── Custo de produção de UMA peça ─────────────────────────────────────────────
export function calcularCusto(produto, { impressoras, filamentos, settings }) {
  const impressora = impressoras.find((i) => i.id === produto.impressoraId);

  const pecas = Math.max(1, num(produto.pecasPorLote) || 1);
  const horasLote = num(produto.tempoH) + num(produto.tempoMin) / 60;
  const horas = horasLote / pecas;

  const hora = custoHoraImpressora(impressora, settings);

  // Cada cor entra com o próprio peso e o próprio preço por grama.
  const usos = filamentosDoProduto(produto);
  const porFilamento = usos.map((uso) => {
    const fil = filamentos.find((f) => f.id === uso.filamentoId);
    const gramasLote = num(uso.pesoG);
    return {
      filamento: fil,
      gramas: gramasLote / pecas,
      custo: (gramasLote / pecas) * precoPorGrama(fil),
    };
  });

  const material = porFilamento.reduce((s, f) => s + f.custo, 0);
  const gramas = porFilamento.reduce((s, f) => s + f.gramas, 0);
  const energia = horas * hora.energia;
  const depreciacao = horas * hora.depreciacao;
  const manutencao = horas * hora.manutencao;
  const custoFixo = horas * num(settings.custoFixoHora);
  const maoDeObra = (num(produto.posProcessoMin) / 60) * num(settings.maoDeObraHora);
  const modelo = num(produto.modeloCusto) / Math.max(1, num(produto.modeloRateio) || 1);
  const embalagem = num(produto.embalagem);
  const extra = num(produto.extraCusto);

  const subtotal =
    material + energia + depreciacao + manutencao + custoFixo +
    maoDeObra + modelo + embalagem + extra;

  const falha = subtotal * (num(settings.taxaFalha) / 100);

  // No multifilamento vale mais ver uma linha por cor do que um total só.
  const linhasMaterial = porFilamento.length > 1
    ? porFilamento.map((f, i) => ({
        chave: `material-${i}`,
        label: `${f.filamento?.nome || "Filamento"} · ${f.gramas.toFixed(0)} g`,
        valor: f.custo,
      }))
    : [{ chave: "material", label: "Filamento", valor: material }];

  return {
    impressora,
    porFilamento,
    filamento: porFilamento[0]?.filamento,
    horas,
    horasLote,
    gramas,
    pecas,
    linhas: [
      ...linhasMaterial,
      { chave: "energia", label: "Energia", valor: energia },
      { chave: "depreciacao", label: "Depreciação da máquina", valor: depreciacao },
      { chave: "manutencao", label: "Manutenção", valor: manutencao },
      { chave: "custoFixo", label: "Custo fixo rateado", valor: custoFixo },
      { chave: "maoDeObra", label: "Mão de obra / pós-processo", valor: maoDeObra },
      { chave: "modelo", label: "Modelo 3D (rateado)", valor: modelo },
      { chave: "embalagem", label: "Embalagem", valor: embalagem },
      { chave: "extra", label: produto.extraDesc?.trim() || "Extras", valor: extra },
      { chave: "falha", label: `Reserva de falha (${num(settings.taxaFalha)}%)`, valor: falha },
    ].filter((l) => l.valor > 0),
    subtotal,
    falha,
    total: subtotal + falha,
  };
}

// ─── Taxas do canal de venda ───────────────────────────────────────────────────
export function taxaDoCanal(canal, preco) {
  if (!canal) return { pct: 0, fixo: 0, valor: 0 };

  if (canal.tipo === "faixas") {
    const faixas = canal.faixas || [];
    const faixa =
      faixas.find((f) => f.ate === null || f.ate === undefined || preco <= num(f.ate)) ||
      faixas[faixas.length - 1] || { pct: 0, fixo: 0 };
    const pct = num(faixa.pct);
    const fixo = num(faixa.fixo);
    return { pct, fixo, valor: (preco * pct) / 100 + fixo };
  }

  const pct = num(canal.pct);
  const fixo = num(canal.fixo);
  return { pct, fixo, valor: (preco * pct) / 100 + fixo };
}

/** Todas as combinações (pct, fixo) possíveis de um canal, com o intervalo de preço de cada uma. */
function combinacoesDoCanal(canal) {
  if (!canal) return [{ pct: 0, fixo: 0, de: 0, ate: Infinity }];

  if (canal.tipo === "faixas") {
    let de = 0;
    return (canal.faixas || []).map((f) => {
      const ate = f.ate === null || f.ate === undefined ? Infinity : num(f.ate);
      const intervalo = { pct: num(f.pct), fixo: num(f.fixo), de, ate };
      de = ate;
      return intervalo;
    });
  }
  return [{ pct: num(canal.pct), fixo: num(canal.fixo), de: 0, ate: Infinity }];
}

// ─── Resultado da venda ────────────────────────────────────────────────────────
export function calcularVenda(custo, preco, canal, settings, fretePorConta = 0) {
  const taxa = taxaDoCanal(canal, preco);
  const imposto = (preco * num(settings.impostoPct)) / 100;
  const frete = num(fretePorConta);
  const liquido = preco - taxa.valor - imposto - frete;
  const lucro = liquido - custo;

  return {
    taxa,
    imposto,
    frete,
    liquido,
    lucro,
    margem: preco > 0 ? (lucro / preco) * 100 : 0,
    markup: custo > 0 ? preco / custo : 0,
  };
}

// ─── Arredondamento psicológico ────────────────────────────────────────────────
export function arredondar(preco, modo) {
  if (!Number.isFinite(preco) || preco <= 0) return 0;
  const eps = 1e-9;

  if (modo === "inteiro") return Math.ceil(preco - eps);

  if (modo === "0,90" || modo === "0,99") {
    const final = modo === "0,90" ? 0.9 : 0.99;
    const base = Math.floor(preco);
    const candidato = base + final;
    return candidato + eps >= preco ? candidato : base + 1 + final;
  }

  return Math.ceil((preco - eps) * 100) / 100;
}

// ─── Preço necessário pra bater uma margem ─────────────────────────────────────
export function precoParaMargem(custo, margemAlvo, canal, settings, fretePorConta = 0) {
  const frete = num(fretePorConta);
  const imp = num(settings.impostoPct) / 100;
  const alvo = num(margemAlvo) / 100;

  const candidatos = [];

  for (const c of combinacoesDoCanal(canal)) {
    const denominador = 1 - c.pct / 100 - imp - alvo;
    if (denominador <= 0.01) continue; // margem impossível nessa faixa
    const preco = (custo + c.fixo + frete) / denominador;
    // só vale se o preço realmente cai dentro da faixa que gerou essa taxa
    if (preco > c.de && preco <= c.ate) candidatos.push(preco);
    // a borda da faixa também é candidata (o salto de taxa pode pular o alvo)
    if (Number.isFinite(c.ate)) candidatos.push(c.ate);
  }

  const validos = candidatos
    .filter((p) => p > 0)
    .filter((p) => calcularVenda(custo, p, canal, settings, frete).margem >= alvo * 100 - 0.05)
    .sort((a, b) => a - b);

  if (validos.length) return validos[0];

  // nenhuma faixa fecha o alvo: devolve o melhor esforço com a última combinação
  const ultima = combinacoesDoCanal(canal).slice(-1)[0];
  const denominador = 1 - ultima.pct / 100 - imp - alvo;
  if (denominador <= 0.01) return 0;
  return (custo + ultima.fixo + frete) / denominador;
}

/** Preço em que o lucro é exatamente zero. */
export function precoMinimo(custo, canal, settings, fretePorConta = 0) {
  return precoParaMargem(custo, 0, canal, settings, fretePorConta);
}

// ─── Leitura da margem ─────────────────────────────────────────────────────────
export const FAIXAS_MARGEM = [
  { min: 40, label: "Ótima", cor: "var(--ok)", tom: "ok" },
  { min: 25, label: "Boa", cor: "var(--atencao)", tom: "atencao" },
  { min: 10, label: "Baixa", cor: "var(--alerta)", tom: "alerta" },
  { min: -Infinity, label: "Inviável", cor: "var(--risco)", tom: "risco" },
];

export function lerMargem(m) {
  return FAIXAS_MARGEM.find((f) => m >= f.min) || FAIXAS_MARGEM[FAIXAS_MARGEM.length - 1];
}

// ─── Tudo junto, do jeito que a tela precisa ───────────────────────────────────
export function analisarProduto(produto, base) {
  const custo = calcularCusto(produto, base);
  const canais = canaisDoProduto(produto, base.canais);
  const preco = num(produto.preco);
  const frete = num(produto.freteProprio);

  // O mesmo custo passa por cada canal escolhido — a taxa é que muda tudo.
  const porCanal = canais.map((canal) => {
    const sugerido = custo.total > 0
      ? arredondar(
          precoParaMargem(custo.total, base.settings.margemAlvo, canal, base.settings, frete),
          base.settings.arredondamento
        )
      : 0;
    const minimo = custo.total > 0
      ? arredondar(precoMinimo(custo.total, canal, base.settings, frete), "nenhum")
      : 0;
    const venda = preco > 0 ? calcularVenda(custo.total, preco, canal, base.settings, frete) : null;

    return { canal, sugerido, minimo, venda, leitura: venda ? lerMargem(venda.margem) : null };
  });

  // O primeiro canal é o principal: é dele que sai o número em destaque.
  const principal = porCanal[0];

  return {
    custo,
    canais,
    canal: principal.canal,
    porCanal,
    preco,
    sugerido: principal.sugerido,
    minimo: principal.minimo,
    venda: principal.venda,
    leitura: principal.leitura,
  };
}
