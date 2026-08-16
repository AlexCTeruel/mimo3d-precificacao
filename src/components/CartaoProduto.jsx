import { useState } from "react";
import {
  Bloco, Campo, CampoDinheiro, CampoLink, CampoNumero, CampoSelecao, CampoTexto,
  Aviso, ChipLink, Selo,
} from "./ui";
import { ORIGENS_MODELO, LICENCAS, STATUS_PRODUTO } from "../lib/defaults";
import { analisarProduto } from "../lib/pricing";
import { brl, pct, horas, gramas, num } from "../lib/format";

const EMOJIS = ["🎁", "🚀", "🌸", "🧸", "🐱", "🦖", "💐", "🕯️", "🪴", "🔑", "🧩", "☕", "🎀", "⭐", "🐝", "🏠"];

function proximoEmoji(atual) {
  const i = EMOJIS.indexOf(atual);
  return EMOJIS[(i + 1) % EMOJIS.length];
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
  linhas.push("— mimo3D · cada peça, um mimo 🩷");
  return linhas.join("\n");
}

export default function CartaoProduto({ produto, base, aoMudar, aoRemover, aoDuplicar, abertoInicial }) {
  const [aberto, setAberto] = useState(abertoInicial);
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
    <div className="cartao">
      {/* ── Cabeçalho ─────────────────────────────────────────────── */}
      <div className="produto-topo" onClick={() => setAberto((a) => !a)}>
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
            style={{ background: leitura.cor, color: "#fff" }}
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
          ×
        </button>
        <span className="produto-seta">{aberto ? "▲" : "▼"}</span>
      </div>

      {/* ── Faixa de resumo ───────────────────────────────────────── */}
      <div className="produto-resumo">
        {status && <Selo tom={status.tom}>{status.label}</Selo>}
        {custo.total > 0 && <span>custo <b>{brl(custo.total)}</b></span>}
        {num(produto.pesoG) > 0 && <span><b>{gramas(custo.gramas)}</b></span>}
        {custo.horas > 0 && <span><b>{horas(custo.horas)}</b></span>}
        {analise.preco > 0 && <span>preço <b>{brl(analise.preco)}</b></span>}
        <span style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <ChipLink url={produto.modeloUrl} icone="📐" rotuloVazio="sem link do modelo" />
          <ChipLink url={produto.anuncioUrl} icone="🛒" rotuloVazio="sem link do anúncio" />
        </span>
      </div>

      {aberto && (
        <div className="cartao-corpo">
          {/* ── Origem do modelo ────────────────────────────────── */}
          <Bloco titulo="📐 De onde veio o modelo">
            <div className="grade grade-2" style={{ marginBottom: 12 }}>
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
            <div className="grade grade-4" style={{ marginBottom: 12 }}>
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
              <div style={{ marginBottom: 12 }}>
                <Aviso tom="risco" icone="⚠️">
                  Esse modelo está marcado como <b>uso pessoal</b>. Vender pode violar a licença do autor —
                  confira antes de publicar ou troque por um modelo autoral.
                </Aviso>
              </div>
            )}
            {licenca?.tom === "atencao" && (
              <div style={{ marginBottom: 12 }}>
                <Aviso tom="atencao" icone="📋">
                  Lembre de {produto.modeloLicenca === "creditar"
                    ? "creditar o autor no anúncio."
                    : "verificar a licença antes de colocar à venda."}
                </Aviso>
              </div>
            )}
          </Bloco>

          {/* ── Publicação ──────────────────────────────────────── */}
          <Bloco titulo="🛒 Onde ele está publicado">
            <div className="grade grade-2" style={{ marginBottom: 12 }}>
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
            <div className="grade grade-3" style={{ marginBottom: 16 }}>
              <CampoTexto
                label="SKU / código interno"
                placeholder="MIMO-001"
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
          <Bloco titulo="🖨️ Produção">
            <div className="grade grade-2" style={{ marginBottom: 12 }}>
              <CampoSelecao
                label="Impressora"
                valor={produto.impressoraId}
                aoMudar={(v) => aoMudar("impressoraId", v)}
                opcoes={base.impressoras.map((i) => ({ id: i.id, label: i.nome || "Sem nome" }))}
                vazio="— escolha uma impressora —"
                dica={semImpressora ? "Sem impressora, energia e depreciação ficam de fora." : undefined}
              />
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
            </div>

            <div className="grade grade-4" style={{ marginBottom: 12 }}>
              <CampoNumero
                label="Peso da impressão"
                sufixo="g"
                valor={produto.pesoG}
                aoMudar={(v) => aoMudar("pesoG", v)}
                dica="O número que o fatiador mostra."
              />
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

            <div className="grade grade-4" style={{ marginBottom: 12 }}>
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
              <details className="cartao" style={{ boxShadow: "none", marginBottom: 16 }}>
                <summary
                  style={{
                    cursor: "pointer", listStyle: "none", padding: "11px 15px",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    background: "var(--creme-2)", fontSize: 13, color: "var(--tinta-2)",
                  }}
                >
                  <span>Custo de produção por peça</span>
                  <b style={{ fontFamily: "var(--mono)", fontSize: 15, color: "var(--navy)" }}>
                    {brl(custo.total)}
                  </b>
                </summary>
                <div style={{ padding: "10px 15px 14px" }}>
                  {custo.linhas.map((l) => (
                    <div
                      key={l.chave}
                      style={{
                        display: "flex", justifyContent: "space-between",
                        fontSize: 12.5, padding: "5px 0", color: "var(--apagado)",
                        borderBottom: "1px dashed var(--linha)",
                      }}
                    >
                      <span>{l.label}</span>
                      <span style={{ fontFamily: "var(--mono)", color: "var(--tinta-2)" }}>{brl(l.valor)}</span>
                    </div>
                  ))}
                  <p className="campo-dica" style={{ marginTop: 10 }}>
                    {custo.pecas > 1 && `Lote de ${custo.pecas} peças · `}
                    {custo.horas > 0 && `${horas(custo.horas)} de máquina por peça · `}
                    energia e depreciação vêm da impressora cadastrada.
                  </p>
                </div>
              </details>
            )}
          </Bloco>

          {/* ── Venda ───────────────────────────────────────────── */}
          <Bloco titulo="💰 Venda">
            <div className="grade grade-3" style={{ marginBottom: 12 }}>
              <CampoSelecao
                label="Canal de venda"
                valor={produto.canalId}
                aoMudar={(v) => aoMudar("canalId", v)}
                opcoes={base.canais.map((c) => ({ id: c.id, label: c.nome }))}
              />
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
                style={{ marginBottom: 12 }}
                onClick={() => aoMudar("preco", sugerido.toFixed(2))}
              >
                <div>
                  <div className="rotulo">PREÇO SUGERIDO · MARGEM DE {pct(base.settings.margemAlvo, 0)}</div>
                  <div className="dica">
                    Clique pra aplicar · mínimo sem prejuízo {brl(minimo)}
                  </div>
                </div>
                <span className="valor">{brl(sugerido)}</span>
              </button>
            )}

            <div className="grade grade-2" style={{ marginBottom: 14 }}>
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

                <div className="resultado-destaque" style={{ background: leitura.cor }}>
                  <div>
                    <div className="rotulo">LUCRO POR PEÇA · MARGEM {leitura.label.toUpperCase()}</div>
                    <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>
                      Markup {venda.markup.toFixed(2).replace(".", ",")}× sobre o custo
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="valor">{brl(venda.lucro)}</div>
                    <div className="sub">{pct(venda.margem)}</div>
                  </div>
                </div>

                <div className="resultado-linha" style={{ borderBottom: "none" }}>
                  <span>Preço mínimo pra não ter prejuízo</span>
                  <b style={{ color: "var(--rosa-claro)" }}>{brl(minimo)}</b>
                </div>
              </div>
            )}

            {num(produto.precoConcorrencia) > 0 && analise.preco > 0 && (
              <div style={{ marginTop: 12 }}>
                <Aviso tom={analise.preco <= num(produto.precoConcorrencia) ? "info" : "atencao"} icone="🔍">
                  {analise.preco <= num(produto.precoConcorrencia)
                    ? `Você está ${brl(num(produto.precoConcorrencia) - analise.preco)} abaixo da concorrência.`
                    : `Você está ${brl(analise.preco - num(produto.precoConcorrencia))} acima da concorrência — vale reforçar acabamento e fotos no anúncio.`}
                </Aviso>
              </div>
            )}
          </Bloco>

          {/* ── Observações e ações ─────────────────────────────── */}
          <div style={{ marginTop: 16 }}>
            <Campo label="Observações">
              <textarea
                value={produto.observacoes}
                placeholder="Ajustes do fatiador, cor que mais sai, o que o cliente comentou..."
                onChange={(e) => aoMudar("observacoes", e.target.value)}
              />
            </Campo>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            <button className="botao botao-claro botao-pequeno" onClick={aoDuplicar}>
              ⧉ Duplicar
            </button>
            <button className="botao botao-claro botao-pequeno" onClick={copiarResumo}>
              {copiado ? "✓ Copiado" : "📋 Copiar resumo"}
            </button>
            <button
              className="botao botao-perigo botao-pequeno"
              style={{ marginLeft: "auto" }}
              onClick={() => {
                if (window.confirm(`Remover "${produto.nome || "esse produto"}"?`)) aoRemover();
              }}
            >
              Remover
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
