import { useState } from "react";
import {
  Bloco, Campo, CampoDinheiro, CampoLink, CampoNumero, CampoSelecao, CampoTexto,
  Aviso, ChipLink, Selo,
} from "./ui";
import Icone from "./Icone";
import { ORIGENS_MODELO, LICENCAS, STATUS_PRODUTO, novoUsoFilamento } from "../lib/defaults";
import { MARCA } from "../lib/marca";
import { analisarProduto } from "../lib/pricing";
import { brl, pct, horas, gramas, num } from "../lib/format";

const EMOJIS = ["📦", "🚀", "🌸", "🧸", "🐱", "🦖", "💐", "🕯️", "🪴", "🔑", "🧩", "☕", "🎁", "⭐", "🐝", "🏠"];

function proximoEmoji(atual) {
  const i = EMOJIS.indexOf(atual);
  return EMOJIS[(i + 1) % EMOJIS.length];
}

// ─── Bloco de filamentos: um só ou uma linha de peso por cor ──────────────────
function FilamentosDoProduto({ produto, base, aoMudar }) {
  const usos = produto.filamentosUsados || [];

  const ligarMulti = () => {
    // leva o que já estava preenchido no modo simples pra primeira cor
    const inicial = [
      { ...novoUsoFilamento(produto.filamentoId), pesoG: produto.pesoG },
      novoUsoFilamento(),
    ];
    aoMudar("filamentosUsados", usos.length ? usos : inicial);
    aoMudar("multiFilamento", true);
  };

  const desligarMulti = () => {
    const primeiro = usos.find((u) => u.filamentoId);
    if (primeiro) {
      aoMudar("filamentoId", primeiro.filamentoId);
      aoMudar("pesoG", primeiro.pesoG);
    }
    aoMudar("multiFilamento", false);
  };

  const mudarUso = (id, campo, valor) =>
    aoMudar("filamentosUsados", usos.map((u) => (u.id === id ? { ...u, [campo]: valor } : u)));

  const pesoTotal = usos.reduce((s, u) => s + num(u.pesoG), 0);

  if (!produto.multiFilamento) {
    return (
      <button className="alternar-modo" onClick={ligarMulti} style={{ marginBottom: 13 }}>
        <Icone nome="mais" tamanho={14} />
        A peça usa mais de uma cor? Lançar peso por filamento
      </button>
    );
  }

  return (
    <div className="multifilamento">
      <div className="multifilamento-topo">
        <span className="rotulo">
          <Icone nome="filamento" tamanho={14} /> Filamentos da peça
        </span>
        <button className="botao botao-claro botao-pequeno" onClick={desligarMulti}>
          Usar um filamento só
        </button>
      </div>

      {usos.map((uso, i) => (
        <div className="multifilamento-linha" key={uso.id}>
          <span className="ordem">{i + 1}</span>
          <select
            className="entrada"
            value={uso.filamentoId}
            onChange={(e) => mudarUso(uso.id, "filamentoId", e.target.value)}
            aria-label={`Filamento ${i + 1}`}
          >
            <option value="">— escolha a cor —</option>
            {base.filamentos.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nome || "Sem nome"}
                {f.cor ? ` · ${f.cor}` : ""}
                {f.precoKg ? ` · ${brl(f.precoKg)}/kg` : ""}
              </option>
            ))}
          </select>
          <div className="entrada-sufixo" style={{ width: 116 }}>
            <span>g</span>
            <input
              className="entrada"
              type="number"
              step="1"
              min="0"
              placeholder="0"
              value={uso.pesoG}
              onChange={(e) => mudarUso(uso.id, "pesoG", e.target.value)}
              aria-label={`Peso do filamento ${i + 1}`}
            />
          </div>
          <button
            className="botao-icone"
            aria-label="Remover cor"
            onClick={() =>
              aoMudar("filamentosUsados", usos.filter((u) => u.id !== uso.id))
            }
          >
            <Icone nome="lixeira" tamanho={14} />
          </button>
        </div>
      ))}

      <div className="multifilamento-rodape">
        <button
          className="botao botao-claro botao-pequeno"
          onClick={() => aoMudar("filamentosUsados", [...usos, novoUsoFilamento()])}
        >
          <Icone nome="mais" tamanho={14} /> Adicionar cor
        </button>
        <span>
          peso total da impressão <b>{gramas(pesoTotal)}</b>
        </span>
      </div>
    </div>
  );
}

// ─── Canais de venda: escolhe vários, o primeiro manda no destaque ────────────
function CanaisDoProduto({ produto, base, analise, aoMudar }) {
  const selecionados = analise.canais.map((c) => c.id);

  const alternar = (id) => {
    if (selecionados.includes(id)) {
      if (selecionados.length === 1) return; // sempre resta um
      aoMudar("canaisIds", selecionados.filter((c) => c !== id));
    } else {
      aoMudar("canaisIds", [...selecionados, id]);
    }
  };

  const tornarPrincipal = (id) =>
    aoMudar("canaisIds", [id, ...selecionados.filter((c) => c !== id)]);

  return (
    <div className="campo" style={{ marginBottom: 13 }}>
      <label>Canais de venda</label>
      <div className="canais-chips">
        {base.canais.map((canal) => {
          const ativo = selecionados.includes(canal.id);
          const principal = selecionados[0] === canal.id;
          return (
            <button
              key={canal.id}
              className={`canal-chip${ativo ? " ativo" : ""}${principal ? " principal" : ""}`}
              onClick={() => alternar(canal.id)}
              aria-pressed={ativo}
            >
              <Icone nome={ativo ? "check" : "mais"} tamanho={13} />
              {canal.nome}
              {principal && <em>principal</em>}
            </button>
          );
        })}
      </div>
      <span className="campo-dica">
        {selecionados.length > 1
          ? "O resultado em destaque é do canal principal. Clique numa linha do comparativo pra trocar."
          : "Selecione mais de um pra comparar quanto sobra em cada marketplace."}
      </span>
      {selecionados.length > 1 && (
        <ComparativoCanais analise={analise} aoEscolher={tornarPrincipal} />
      )}
    </div>
  );
}

function ComparativoCanais({ analise, aoEscolher }) {
  const temPreco = analise.preco > 0 && analise.custo.total > 0;

  return (
    <div className="comparativo">
      <div className="comparativo-cabecalho">
        <span>Canal</span>
        <span>Sugerido</span>
        <span>{temPreco ? "Taxa" : "Mínimo"}</span>
        <span>{temPreco ? "Lucro" : "—"}</span>
        <span>Margem</span>
      </div>
      {analise.porCanal.map((linha, i) => (
        <button
          key={linha.canal.id}
          className={`comparativo-linha${i === 0 ? " principal" : ""}`}
          onClick={() => aoEscolher(linha.canal.id)}
          title="Usar como canal principal"
        >
          <span className="nome">{linha.canal.nome}</span>
          <span className="mono">{linha.sugerido > 0 ? brl(linha.sugerido) : "—"}</span>
          <span className="mono apagado">
            {temPreco ? brl(linha.venda.taxa.valor) : brl(linha.minimo)}
          </span>
          <span className="mono" style={{ color: linha.leitura?.cor }}>
            {temPreco ? brl(linha.venda.lucro) : "—"}
          </span>
          <span className="mono" style={{ color: linha.leitura?.cor, fontWeight: 700 }}>
            {temPreco ? pct(linha.venda.margem) : "—"}
          </span>
        </button>
      ))}
    </div>
  );
}

function textoResumo(produto, analise) {
  const linhas = [
    `${produto.emoji} ${produto.nome || "Produto sem nome"}`,
    `Custo de produção: ${brl(analise.custo.total)}`,
    `Preço sugerido: ${brl(analise.sugerido)}`,
  ];
  if (analise.venda) {
    linhas.push(
      `Preço atual: ${brl(analise.preco)}`,
      `Lucro: ${brl(analise.venda.lucro)} (margem ${pct(analise.venda.margem)})`,
      `Canal: ${analise.canal?.nome || "—"}`
    );
  }
  if (produto.anuncioUrl) linhas.push(`Anúncio: ${produto.anuncioUrl}`);
  if (produto.modeloUrl) linhas.push(`Modelo: ${produto.modeloUrl}`);
  linhas.push(`— calculado no ${MARCA.nome}`);
  return linhas.join("\n");
}

export default function CartaoProduto({ produto, base, aoMudar, aoRemover, aoDuplicar, aberto, aoAlternar }) {
  const [copiado, setCopiado] = useState(false);

  const analise = analisarProduto(produto, base);
  const { custo, canal, venda, sugerido, minimo, leitura } = analise;

  const licenca = LICENCAS.find((l) => l.id === produto.modeloLicenca);
  const status = STATUS_PRODUTO.find((s) => s.id === produto.status);
  const semImpressora = !custo.impressora;
  const semFilamento = !custo.filamento;

  const copiarResumo = async () => {
    const texto = textoResumo(produto, analise);
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
    } catch {
      window.prompt("Copie o resumo:", texto);
    }
  };

  return (
    <div className="cartao" id={`produto-${produto.id}`}>
      {/* ── Cabeçalho ─────────────────────────────────────────────── */}
      <div className="produto-topo" onClick={aoAlternar}>
        <button
          className="produto-emoji"
          title="Trocar ícone"
          onClick={(e) => { e.stopPropagation(); aoMudar("emoji", proximoEmoji(produto.emoji)); }}
        >
          {produto.emoji}
        </button>
        <input
          className="produto-nome"
          placeholder="Nome do produto..."
          value={produto.nome}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => aoMudar("nome", e.target.value)}
        />
        {venda && (
          <span
            className="selo"
            style={{
              color: leitura.cor,
              background: `color-mix(in srgb, ${leitura.cor} 14%, transparent)`,
              borderColor: `color-mix(in srgb, ${leitura.cor} 34%, transparent)`,
            }}
            title="Margem sobre o preço de venda"
          >
            {pct(venda.margem)} · {leitura.label}
          </span>
        )}
        <button
          className="botao-icone"
          title="Remover produto"
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm(`Remover "${produto.nome || "esse produto"}"?`)) aoRemover();
          }}
        >
          <Icone nome="lixeira" tamanho={15} />
        </button>
        <span className={`produto-seta${aberto ? " aberta" : ""}`}>
          <Icone nome="seta" tamanho={15} />
        </span>
      </div>

      {/* ── Faixa de resumo ───────────────────────────────────────── */}
      <div className="produto-resumo">
        {status && <Selo tom={status.tom}>{status.label}</Selo>}
        {custo.total > 0 && <span>custo <b>{brl(custo.total)}</b></span>}
        {num(produto.pesoG) > 0 && <span><b>{gramas(custo.gramas)}</b></span>}
        {custo.horas > 0 && <span><b>{horas(custo.horas)}</b></span>}
        {analise.preco > 0 && <span>preço <b>{brl(analise.preco)}</b></span>}
        <span style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <ChipLink url={produto.modeloUrl} icone="cubo" rotuloVazio="sem link do modelo" />
          <ChipLink url={produto.anuncioUrl} icone="loja" rotuloVazio="sem link do anúncio" />
        </span>
      </div>

      {aberto && (
        <div className="cartao-corpo">
          {/* ── Origem do modelo ────────────────────────────────── */}
          <Bloco titulo="De onde veio o modelo" icone="cubo">
            <div className="grade grade-2" style={{ marginBottom: 13 }}>
              <CampoLink
                label="Link do modelo / STL"
                placeholder="https://cults3d.com/..."
                valor={produto.modeloUrl}
                aoMudar={(v) => aoMudar("modeloUrl", v)}
                dica="Onde você baixou, comprou ou guardou o arquivo."
              />
              <CampoSelecao
                label="Origem"
                valor={produto.modeloOrigem}
                aoMudar={(v) => aoMudar("modeloOrigem", v)}
                opcoes={ORIGENS_MODELO}
              />
            </div>
            <div className="grade grade-4" style={{ marginBottom: 13 }}>
              <CampoTexto
                label="Autor / designer"
                placeholder="Nome do criador"
                valor={produto.modeloAutor}
                aoMudar={(v) => aoMudar("modeloAutor", v)}
              />
              <CampoSelecao
                label="Licença"
                valor={produto.modeloLicenca}
                aoMudar={(v) => aoMudar("modeloLicenca", v)}
                opcoes={LICENCAS}
              />
              <CampoDinheiro
                label="Quanto custou o STL"
                valor={produto.modeloCusto}
                aoMudar={(v) => aoMudar("modeloCusto", v)}
              />
              <CampoNumero
                label="Diluir em quantas peças"
                sufixo="un"
                valor={produto.modeloRateio}
                aoMudar={(v) => aoMudar("modeloRateio", v)}
                dica="O valor do arquivo entra no custo dividido por essas unidades."
              />
            </div>
            {licenca?.tom === "risco" && (
              <div style={{ marginBottom: 13 }}>
                <Aviso tom="risco">
                  Esse modelo está marcado como <b>uso pessoal</b>. Vender pode violar a licença do autor —
                  confira antes de publicar ou troque por um modelo autoral.
                </Aviso>
              </div>
            )}
            {licenca?.tom === "atencao" && (
              <div style={{ marginBottom: 13 }}>
                <Aviso tom="atencao">
                  Lembre de {produto.modeloLicenca === "creditar"
                    ? "creditar o autor no anúncio."
                    : "verificar a licença antes de colocar à venda."}
                </Aviso>
              </div>
            )}
          </Bloco>

          {/* ── Publicação ──────────────────────────────────────── */}
          <Bloco titulo="Onde ele está publicado" icone="loja">
            <div className="grade grade-2" style={{ marginBottom: 13 }}>
              <CampoLink
                label="Link do meu anúncio"
                placeholder="https://shopee.com.br/..."
                valor={produto.anuncioUrl}
                aoMudar={(v) => aoMudar("anuncioUrl", v)}
                dica="O produto já publicado por você — pra abrir e conferir rapidinho."
              />
              <CampoLink
                label="Fotos / arte do anúncio"
                placeholder="Link do Drive, Canva, pasta..."
                valor={produto.fotosUrl}
                aoMudar={(v) => aoMudar("fotosUrl", v)}
                dica="Onde ficam as fotos e artes desse produto."
              />
            </div>
            <div className="grade grade-3" style={{ marginBottom: 18 }}>
              <CampoTexto
                label="SKU / código interno"
                placeholder="SKU-001"
                valor={produto.anuncioSku}
                aoMudar={(v) => aoMudar("anuncioSku", v)}
              />
              <CampoSelecao
                label="Status"
                valor={produto.status}
                aoMudar={(v) => aoMudar("status", v)}
                opcoes={STATUS_PRODUTO}
              />
              <CampoTexto
                label="Tags"
                placeholder="presente, dia das mães"
                valor={produto.tags}
                aoMudar={(v) => aoMudar("tags", v)}
                dica="Separe por vírgula."
              />
            </div>
          </Bloco>

          {/* ── Produção ────────────────────────────────────────── */}
          <Bloco titulo="Produção" icone="impressora">
            <div className="grade grade-2" style={{ marginBottom: 13 }}>
              <CampoSelecao
                label="Impressora"
                valor={produto.impressoraId}
                aoMudar={(v) => aoMudar("impressoraId", v)}
                opcoes={base.impressoras.map((i) => ({ id: i.id, label: i.nome || "Sem nome" }))}
                vazio="— escolha uma impressora —"
                dica={semImpressora ? "Sem impressora, energia e depreciação ficam de fora." : undefined}
              />
              {!produto.multiFilamento && (
                <CampoSelecao
                  label="Filamento"
                  valor={produto.filamentoId}
                  aoMudar={(v) => aoMudar("filamentoId", v)}
                  opcoes={base.filamentos.map((f) => ({
                    id: f.id,
                    label: `${f.nome || "Sem nome"}${f.precoKg ? ` · ${brl(f.precoKg)}/kg` : ""}`,
                  }))}
                  vazio="— escolha um filamento —"
                  dica={semFilamento ? "Sem filamento, o material não entra na conta." : undefined}
                />
              )}
            </div>

            <FilamentosDoProduto produto={produto} base={base} aoMudar={aoMudar} />

            <div className="grade grade-4" style={{ marginBottom: 13 }}>
              {!produto.multiFilamento && (
                <CampoNumero
                  label="Peso da impressão"
                  sufixo="g"
                  valor={produto.pesoG}
                  aoMudar={(v) => aoMudar("pesoG", v)}
                  dica="O número que o fatiador mostra."
                />
              )}
              <CampoNumero
                label="Tempo — horas"
                sufixo="h"
                valor={produto.tempoH}
                aoMudar={(v) => aoMudar("tempoH", v)}
              />
              <CampoNumero
                label="Tempo — minutos"
                sufixo="min"
                valor={produto.tempoMin}
                aoMudar={(v) => aoMudar("tempoMin", v)}
              />
              <CampoNumero
                label="Peças nessa impressão"
                sufixo="un"
                valor={produto.pecasPorLote}
                aoMudar={(v) => aoMudar("pecasPorLote", v)}
                min="1"
                dica="Imprimiu 4 de uma vez? Coloque 4 — peso e tempo são divididos."
              />
            </div>

            <div className="grade grade-4" style={{ marginBottom: 13 }}>
              <CampoNumero
                label="Pós-processo"
                sufixo="min"
                valor={produto.posProcessoMin}
                aoMudar={(v) => aoMudar("posProcessoMin", v)}
                dica={`Sua hora vale ${brl(base.settings.maoDeObraHora)}.`}
              />
              <CampoDinheiro
                label="Embalagem"
                valor={produto.embalagem}
                aoMudar={(v) => aoMudar("embalagem", v)}
                dica="Caixa, papel de seda, cartão."
              />
              <CampoDinheiro
                label="Extras"
                valor={produto.extraCusto}
                aoMudar={(v) => aoMudar("extraCusto", v)}
              />
              <CampoTexto
                label="O que são os extras"
                placeholder="Ímã, tinta, LED..."
                valor={produto.extraDesc}
                aoMudar={(v) => aoMudar("extraDesc", v)}
              />
            </div>

            {custo.total > 0 && (
              <details className="cartao custo-dobra" style={{ boxShadow: "none", marginBottom: 18 }}>
                <summary>
                  <span>Custo de produção por peça</span>
                  <b>{brl(custo.total)}</b>
                </summary>
                <div style={{ padding: "10px 16px 15px" }}>
                  {custo.linhas.map((l) => (
                    <div key={l.chave} className="custo-linha">
                      <span>{l.label}</span>
                      <span>{brl(l.valor)}</span>
                    </div>
                  ))}
                  <p className="campo-dica" style={{ marginTop: 11 }}>
                    {custo.pecas > 1 && `Lote de ${custo.pecas} peças · `}
                    {custo.horas > 0 && `${horas(custo.horas)} de máquina por peça · `}
                    energia e depreciação vêm da impressora cadastrada.
                  </p>
                </div>
              </details>
            )}
          </Bloco>

          {/* ── Venda ───────────────────────────────────────────── */}
          <Bloco titulo="Venda" icone="moeda">
            <CanaisDoProduto produto={produto} base={base} analise={analise} aoMudar={aoMudar} />

            <div className="grade grade-2" style={{ marginBottom: 13 }}>
              <CampoDinheiro
                label="Frete por sua conta"
                valor={produto.freteProprio}
                aoMudar={(v) => aoMudar("freteProprio", v)}
                dica="Só o que sai do seu bolso."
              />
              <CampoDinheiro
                label="Preço da concorrência"
                valor={produto.precoConcorrencia}
                aoMudar={(v) => aoMudar("precoConcorrencia", v)}
                dica="Referência, não entra na conta."
              />
            </div>

            {sugerido > 0 && (
              <button
                className="sugestao"
                style={{ marginBottom: 13 }}
                onClick={() => aoMudar("preco", sugerido.toFixed(2))}
              >
                <div>
                  <div className="rotulo">
                    PREÇO SUGERIDO · MARGEM DE {pct(base.settings.margemAlvo, 0)}
                    {analise.canais.length > 1 && ` · ${canal.nome}`}
                  </div>
                  <div className="dica">Clique pra aplicar · mínimo sem prejuízo {brl(minimo)}</div>
                </div>
                <span className="valor">{brl(sugerido)}</span>
              </button>
            )}

            <div className="grade grade-2" style={{ marginBottom: 15 }}>
              <div className="campo preco-principal">
                <label>Preço de venda</label>
                <div className="entrada-prefixo">
                  <span>R$</span>
                  <input
                    className="entrada"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={produto.preco}
                    onChange={(e) => aoMudar("preco", e.target.value)}
                  />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <p className="campo-dica" style={{ paddingBottom: 12 }}>
                  {canal?.nota || "Taxa aplicada conforme o canal escolhido."}
                </p>
              </div>
            </div>

            {venda && custo.total > 0 && (
              <div className="resultado">
                <div className="resultado-linha">
                  <span>Taxa do canal ({pct(venda.taxa.pct, 2)}{venda.taxa.fixo ? ` + ${brl(venda.taxa.fixo)}` : ""})</span>
                  <b>− {brl(venda.taxa.valor)}</b>
                </div>
                {venda.imposto > 0 && (
                  <div className="resultado-linha">
                    <span>Imposto ({pct(base.settings.impostoPct)})</span>
                    <b>− {brl(venda.imposto)}</b>
                  </div>
                )}
                {venda.frete > 0 && (
                  <div className="resultado-linha">
                    <span>Frete por sua conta</span>
                    <b>− {brl(venda.frete)}</b>
                  </div>
                )}
                <div className="resultado-linha">
                  <span>Você recebe</span>
                  <b>{brl(venda.liquido)}</b>
                </div>
                <div className="resultado-linha">
                  <span>Custo de produção</span>
                  <b>− {brl(custo.total)}</b>
                </div>

                <div
                  className="resultado-destaque"
                  style={{ background: `color-mix(in srgb, ${leitura.cor} 13%, transparent)` }}
                >
                  <div>
                    <div className="rotulo" style={{ color: leitura.cor }}>
                      Lucro por peça · margem {leitura.label}
                      {analise.canais.length > 1 && ` · ${canal.nome}`}
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--apagado)", marginTop: 3 }}>
                      Markup {venda.markup.toFixed(2).replace(".", ",")}× sobre o custo
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="valor" style={{ color: leitura.cor }}>{brl(venda.lucro)}</div>
                    <div className="sub" style={{ color: leitura.cor }}>{pct(venda.margem)}</div>
                  </div>
                </div>

                <div className="resultado-linha" style={{ borderBottom: "none" }}>
                  <span>Preço mínimo pra não ter prejuízo</span>
                  <b style={{ color: "var(--risco)" }}>{brl(minimo)}</b>
                </div>
              </div>
            )}

            {num(produto.precoConcorrencia) > 0 && analise.preco > 0 && (
              <div style={{ marginTop: 13 }}>
                <Aviso tom={analise.preco <= num(produto.precoConcorrencia) ? "info" : "atencao"} icone="busca">
                  {analise.preco <= num(produto.precoConcorrencia)
                    ? `Você está ${brl(num(produto.precoConcorrencia) - analise.preco)} abaixo da concorrência.`
                    : `Você está ${brl(analise.preco - num(produto.precoConcorrencia))} acima da concorrência — vale reforçar acabamento e fotos no anúncio.`}
                </Aviso>
              </div>
            )}
          </Bloco>

          {/* ── Observações e ações ─────────────────────────────── */}
          <div style={{ marginTop: 18 }}>
            <Campo label="Observações">
              <textarea
                value={produto.observacoes}
                placeholder="Ajustes do fatiador, cor que mais sai, o que o cliente comentou..."
                onChange={(e) => aoMudar("observacoes", e.target.value)}
              />
            </Campo>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 15, flexWrap: "wrap" }}>
            <button className="botao botao-claro botao-pequeno" onClick={aoDuplicar}>
              <Icone nome="duplicar" tamanho={14} /> Duplicar
            </button>
            <button className="botao botao-claro botao-pequeno" onClick={copiarResumo}>
              <Icone nome={copiado ? "check" : "copiar"} tamanho={14} />
              {copiado ? "Copiado" : "Copiar resumo"}
            </button>
            <button
              className="botao botao-perigo botao-pequeno"
              style={{ marginLeft: "auto" }}
              onClick={() => {
                if (window.confirm(`Remover "${produto.nome || "esse produto"}"?`)) aoRemover();
              }}
            >
              <Icone nome="lixeira" tamanho={14} /> Remover
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
