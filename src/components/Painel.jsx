import { useMemo } from "react";
import Icone from "./Icone";
import { Aviso, ChipLink, Vazio } from "./ui";
import { analisarProduto, lerMargem, FAIXAS_MARGEM } from "../lib/pricing";
import { brl, pct, horas, num } from "../lib/format";
import { exportarCsv } from "../lib/storage";
import { LICENCAS } from "../lib/defaults";
import { MARCA } from "../lib/marca";

export default function Painel({ base, irPara }) {
  const linhas = useMemo(
    () => base.produtos.map((p) => ({ produto: p, analise: analisarProduto(p, base) })),
    [base]
  );

  const precificados = linhas.filter((l) => l.analise.venda && l.analise.custo.total > 0);

  const lucroTotal = precificados.reduce((s, l) => s + l.analise.venda.lucro, 0);
  const receitaTotal = precificados.reduce((s, l) => s + l.analise.preco, 0);
  const custoTotal = precificados.reduce((s, l) => s + l.analise.custo.total, 0);
  const margemMedia = receitaTotal > 0 ? (lucroTotal / receitaTotal) * 100 : 0;
  const horasTotais = linhas.reduce((s, l) => s + l.analise.custo.horas, 0);

  const abaixoDoAlvo = precificados.filter(
    (l) => l.analise.venda.margem < num(base.settings.margemAlvo)
  );
  const noPrejuizo = precificados.filter((l) => l.analise.venda.lucro < 0);
  const semAnuncio = base.produtos.filter((p) => p.status === "publicado" && !p.anuncioUrl.trim());
  const licencaPendente = base.produtos.filter((p) => {
    const l = LICENCAS.find((x) => x.id === p.modeloLicenca);
    return l && l.tom !== "ok" && p.status === "publicado";
  });
  const semPreco = base.produtos.filter((p) => !num(p.preco) && num(p.pesoG));

  const publicados = base.produtos.filter((p) => p.anuncioUrl.trim());

  const baixarCsv = () =>
    exportarCsv(
      linhas.map(({ produto: p, analise: a }) => [
        p.nome,
        p.status,
        p.modeloOrigem,
        LICENCAS.find((l) => l.id === p.modeloLicenca)?.label || "",
        p.modeloUrl,
        p.anuncioUrl,
        p.anuncioSku,
        a.canais.map((c) => c.nome).join(" · "),
        a.custo.total.toFixed(2).replace(".", ","),
        a.preco.toFixed(2).replace(".", ","),
        a.sugerido.toFixed(2).replace(".", ","),
        a.venda ? a.venda.lucro.toFixed(2).replace(".", ",") : "",
        a.venda ? a.venda.margem.toFixed(1).replace(".", ",") : "",
      ])
    );

  if (!base.produtos.length) {
    return (
      <div className="cartao">
        <Vazio icone="cubo" titulo={`Bem-vindo ao ${MARCA.nome}`}>
          Cadastre sua impressora e seu filamento, depois crie o primeiro produto.
          <div style={{ marginTop: 14 }}>
            <button className="botao botao-primario" onClick={() => irPara("produtos")}>
              Começar pelo primeiro produto
            </button>
          </div>
        </Vazio>
      </div>
    );
  }

  return (
    <>
      <h2 className="secao-titulo">Painel</h2>
      <p className="secao-desc">
        O retrato do seu catálogo: quanto cada peça deixa no bolso depois das taxas e o que ainda
        está pedindo atenção.
      </p>

      <div className="painel-numeros" style={{ marginBottom: 16 }}>
        <div className="numero-caixa">
          <div className="rotulo">Produtos</div>
          <div className="valor">{base.produtos.length}</div>
          <div className="nota">{precificados.length} com preço definido</div>
        </div>
        <div className="numero-caixa">
          <div className="rotulo">Margem média</div>
          <div className="valor" style={{ color: lerMargem(margemMedia).cor }}>
            {precificados.length ? pct(margemMedia) : "—"}
          </div>
          <div className="nota">alvo de {pct(base.settings.margemAlvo, 0)}</div>
        </div>
        <div className="numero-caixa">
          <div className="rotulo">Lucro somado</div>
          <div className="valor">{brl(lucroTotal)}</div>
          <div className="nota">uma unidade de cada produto</div>
        </div>
        <div className="numero-caixa">
          <div className="rotulo">Custo somado</div>
          <div className="valor">{brl(custoTotal)}</div>
          <div className="nota">{horas(horasTotais)} de máquina</div>
        </div>
      </div>

      {/* ── Alertas ───────────────────────────────────────────────── */}
      {(noPrejuizo.length > 0 || abaixoDoAlvo.length > 0 || semAnuncio.length > 0 ||
        licencaPendente.length > 0 || semPreco.length > 0) && (
        <div style={{ display: "grid", gap: 8, marginBottom: 18 }}>
          {noPrejuizo.length > 0 && (
            <Aviso tom="risco">
              <b>{noPrejuizo.length}</b> produto(s) vendendo no prejuízo:{" "}
              {noPrejuizo.map((l) => l.produto.nome || "sem nome").join(", ")}.
            </Aviso>
          )}
          {abaixoDoAlvo.length > 0 && (
            <Aviso tom="atencao">
              <b>{abaixoDoAlvo.length}</b> produto(s) abaixo da margem alvo de{" "}
              {pct(base.settings.margemAlvo, 0)}. Abra e clique no preço sugerido pra corrigir.
            </Aviso>
          )}
          {licencaPendente.length > 0 && (
            <Aviso tom="atencao">
              <b>{licencaPendente.length}</b> produto(s) publicados com licença de modelo pendente
              de verificação ou marcada como uso pessoal.
            </Aviso>
          )}
          {semAnuncio.length > 0 && (
            <Aviso tom="info" icone="link">
              <b>{semAnuncio.length}</b> produto(s) marcados como publicados ainda sem o link do
              anúncio salvo.
            </Aviso>
          )}
          {semPreco.length > 0 && (
            <Aviso tom="info" icone="moeda">
              <b>{semPreco.length}</b> produto(s) com produção calculada mas sem preço definido.
            </Aviso>
          )}
        </div>
      )}

      {/* ── Ranking ───────────────────────────────────────────────── */}
      <div className="cartao">
        <div className="cartao-corpo">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <p className="rotulo-bloco" style={{ margin: 0, flex: 1 }}>Margem por produto</p>
            <button className="botao botao-claro botao-pequeno" onClick={baixarCsv}>
              <Icone nome="baixar" tamanho={14} /> Baixar planilha
            </button>
          </div>

          {precificados.length ? (
            <div className="lista-resumo">
              {[...precificados]
                .sort((a, b) => a.analise.venda.margem - b.analise.venda.margem)
                .map(({ produto, analise }) => {
                  const leitura = lerMargem(analise.venda.margem);
                  return (
                    <div key={produto.id} className="lista-resumo-item">
                      <span aria-hidden="true">{produto.emoji}</span>
                      <span className="nome">{produto.nome || "Sem nome"}</span>
                      <div className="barra-trilho">
                        <div
                          className="barra-preenchida"
                          style={{
                            width: `${Math.min(100, Math.max(2, analise.venda.margem))}%`,
                            background: leitura.cor,
                          }}
                        />
                      </div>
                      <span className="mono" style={{ color: leitura.cor, fontWeight: 700, minWidth: 52 }}>
                        {pct(analise.venda.margem)}
                      </span>
                      <span className="mono" style={{ color: "var(--apagado)", minWidth: 68 }}>
                        {brl(analise.venda.lucro)}
                      </span>
                    </div>
                  );
                })}
            </div>
          ) : (
            <p className="campo-dica">Defina o preço de pelo menos um produto pra ver o comparativo.</p>
          )}

          <div className="legenda" style={{ marginTop: 16 }}>
            {FAIXAS_MARGEM.map((f) => (
              <div key={f.label} className="legenda-item">
                <span className="legenda-cor" style={{ background: f.cor }} />
                {f.label}
                {Number.isFinite(f.min) ? ` (${f.min}%+)` : " (no vermelho)"}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Links rápidos ─────────────────────────────────────────── */}
      <div className="cartao">
        <div className="cartao-corpo">
          <p className="rotulo-bloco">Meus anúncios publicados</p>
          {publicados.length ? (
            <div style={{ display: "grid", gap: 8 }}>
              {publicados.map((p) => (
                <div key={p.id} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <span aria-hidden="true">{p.emoji}</span>
                  <span style={{ fontSize: 13, flex: "1 1 140px", color: "var(--tinta-2)" }}>
                    {p.nome || "Sem nome"}
                    {p.anuncioSku && (
                      <span style={{ color: "var(--apagado-2)", fontFamily: "var(--mono)", fontSize: 11 }}>
                        {" "}· {p.anuncioSku}
                      </span>
                    )}
                  </span>
                  <ChipLink url={p.anuncioUrl} icone="🛒" rotuloVazio="—" />
                  {p.modeloUrl && <ChipLink url={p.modeloUrl} icone="📐" rotuloVazio="—" />}
                </div>
              ))}
            </div>
          ) : (
            <p className="campo-dica">
              Assim que você salvar o link de um anúncio, ele aparece aqui pra abrir com um clique.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
