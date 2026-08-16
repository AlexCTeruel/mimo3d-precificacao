import { useRef, useState } from "react";
import { CampoDinheiro, CampoNumero, CampoSelecao, CampoTexto, Aviso } from "./ui";
import { OPCOES_ARREDONDAMENTO, CANAIS_PADRAO, dadosIniciais } from "../lib/defaults";
import { exportarJson, importarJson } from "../lib/storage";
import { uid, num } from "../lib/format";

function EditorCanal({ canal, aoMudar, aoRemover, emUso }) {
  const mudarFaixa = (i, campo, valor) =>
    aoMudar("faixas", canal.faixas.map((f, j) => (j === i ? { ...f, [campo]: valor } : f)));

  return (
    <div className="cartao" style={{ boxShadow: "none", background: "var(--creme-2)" }}>
      <div className="cartao-corpo">
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end", marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <CampoTexto label="Canal" valor={canal.nome} aoMudar={(v) => aoMudar("nome", v)} />
          </div>
          <CampoSelecao
            label="Tipo de taxa"
            valor={canal.tipo}
            aoMudar={(v) => aoMudar("tipo", v)}
            opcoes={[
              { id: "simples", label: "% + valor fixo" },
              { id: "faixas", label: "Por faixa de preço" },
            ]}
          />
          <button
            className="botao botao-perigo botao-pequeno"
            onClick={() => {
              const texto = emUso
                ? "Esse canal está sendo usado por produtos — eles vão cair pro primeiro canal da lista. Remover?"
                : "Remover esse canal?";
              if (window.confirm(texto)) aoRemover();
            }}
          >
            Remover
          </button>
        </div>

        {canal.tipo === "simples" ? (
          <div className="grade grade-2">
            <CampoNumero
              label="Comissão"
              sufixo="%"
              passo="0.01"
              valor={canal.pct}
              aoMudar={(v) => aoMudar("pct", v)}
            />
            <CampoDinheiro label="Taxa fixa por pedido" valor={canal.fixo} aoMudar={(v) => aoMudar("fixo", v)} />
          </div>
        ) : (
          <table className="tabela-faixas">
            <thead>
              <tr>
                <th>Preço até</th>
                <th>Comissão %</th>
                <th>Taxa fixa</th>
              </tr>
            </thead>
            <tbody>
              {(canal.faixas || []).map((f, i) => (
                <tr key={i}>
                  <td>
                    {f.ate === null || f.ate === undefined ? (
                      <span style={{ color: "var(--apagado)", fontSize: 12 }}>acima disso</span>
                    ) : (
                      <input
                        className="entrada"
                        type="number"
                        step="0.01"
                        value={f.ate}
                        onChange={(e) => mudarFaixa(i, "ate", e.target.value)}
                      />
                    )}
                  </td>
                  <td>
                    <input
                      className="entrada"
                      type="number"
                      step="0.01"
                      value={f.pct}
                      onChange={(e) => mudarFaixa(i, "pct", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className="entrada"
                      type="number"
                      step="0.01"
                      value={f.fixo}
                      onChange={(e) => mudarFaixa(i, "fixo", e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div style={{ marginTop: 12 }}>
          <CampoTexto
            label="Observação"
            placeholder="Anote a data em que conferiu essa taxa"
            valor={canal.nota}
            aoMudar={(v) => aoMudar("nota", v)}
          />
        </div>
      </div>
    </div>
  );
}

export default function Ajustes({ base, atualizar, setDados }) {
  const arquivoRef = useRef(null);
  const [mensagem, setMensagem] = useState(null);

  const mudarSetting = (campo, valor) =>
    atualizar("settings", (s) => ({ ...s, [campo]: valor }));

  const mudarCanal = (id, campo, valor) =>
    atualizar("canais", (lista) => lista.map((c) => (c.id === id ? { ...c, [campo]: valor } : c)));

  const importar = async (arquivo) => {
    if (!arquivo) return;
    try {
      const dados = await importarJson(arquivo);
      setDados(dados);
      setMensagem({ tom: "info", texto: "Backup restaurado com sucesso." });
    } catch (erro) {
      setMensagem({ tom: "risco", texto: erro.message });
    }
  };

  return (
    <>
      <h2 className="secao-titulo">Ajustes</h2>
      <p className="secao-desc">
        Os números que valem pra todos os produtos. Mexeu aqui, o catálogo inteiro recalcula.
      </p>

      {mensagem && (
        <div style={{ marginBottom: 16 }}>
          <Aviso tom={mensagem.tom} icone={mensagem.tom === "risco" ? "⚠️" : "✅"}>
            {mensagem.texto}
          </Aviso>
        </div>
      )}

      {/* ── Custos gerais ─────────────────────────────────────────── */}
      <div className="cartao">
        <div className="cartao-corpo">
          <p className="rotulo-bloco">Custos do ateliê</p>
          <div className="grade grade-3" style={{ marginBottom: 12 }}>
            <CampoDinheiro
              label="Preço do kWh"
              passo="0.01"
              valor={base.settings.energiaKwh}
              aoMudar={(v) => mudarSetting("energiaKwh", v)}
              dica="Da sua conta de luz, com impostos."
            />
            <CampoDinheiro
              label="Sua hora de trabalho"
              valor={base.settings.maoDeObraHora}
              aoMudar={(v) => mudarSetting("maoDeObraHora", v)}
              dica="Usada no pós-processo de cada peça."
            />
            <CampoDinheiro
              label="Custo fixo por hora de máquina"
              valor={base.settings.custoFixoHora}
              aoMudar={(v) => mudarSetting("custoFixoHora", v)}
              dica="Internet, espaço, assinaturas. Deixe 0 se não quiser ratear."
            />
          </div>
          <div className="grade grade-4">
            <CampoNumero
              label="Reserva de falha"
              sufixo="%"
              passo="0.5"
              valor={base.settings.taxaFalha}
              aoMudar={(v) => mudarSetting("taxaFalha", v)}
              dica="Impressão que dá errado também custa."
            />
            <CampoNumero
              label="Margem alvo"
              sufixo="%"
              valor={base.settings.margemAlvo}
              aoMudar={(v) => mudarSetting("margemAlvo", v)}
              dica="Base do preço sugerido."
            />
            <CampoNumero
              label="Imposto"
              sufixo="%"
              passo="0.5"
              valor={base.settings.impostoPct}
              aoMudar={(v) => mudarSetting("impostoPct", v)}
              dica="0 se ainda vende como CPF."
            />
            <CampoSelecao
              label="Arredondamento"
              valor={base.settings.arredondamento}
              aoMudar={(v) => mudarSetting("arredondamento", v)}
              opcoes={OPCOES_ARREDONDAMENTO}
              dica="Final do preço sugerido."
            />
          </div>

          {num(base.settings.margemAlvo) >= 70 && (
            <div style={{ marginTop: 12 }}>
              <Aviso tom="atencao" icone="🎯">
                Margem alvo bem alta. Com as taxas do marketplace, o preço sugerido pode sair fora
                da realidade do mercado.
              </Aviso>
            </div>
          )}
        </div>
      </div>

      {/* ── Canais ────────────────────────────────────────────────── */}
      <div className="cartao">
        <div className="cartao-corpo">
          <p className="rotulo-bloco">Canais de venda e taxas</p>
          <div style={{ marginBottom: 14 }}>
            <Aviso icone="📌">
              Marketplaces mudam comissão sem avisar. Confira na sua conta de vendedor e ajuste
              aqui — todo o catálogo recalcula na hora.
            </Aviso>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {base.canais.map((canal) => (
              <EditorCanal
                key={canal.id}
                canal={canal}
                emUso={base.produtos.some((p) => p.canalId === canal.id)}
                aoMudar={(campo, valor) => mudarCanal(canal.id, campo, valor)}
                aoRemover={() => atualizar("canais", (l) => l.filter((c) => c.id !== canal.id))}
              />
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            <button
              className="botao botao-claro botao-pequeno"
              onClick={() =>
                atualizar("canais", (l) => [
                  ...l,
                  { id: uid(), nome: "Novo canal", tipo: "simples", pct: 0, fixo: 0, nota: "" },
                ])
              }
            >
              + Adicionar canal
            </button>
            <button
              className="botao botao-claro botao-pequeno"
              onClick={() => {
                if (window.confirm("Voltar os canais para a tabela padrão? Suas edições de taxa serão perdidas.")) {
                  atualizar("canais", CANAIS_PADRAO);
                }
              }}
            >
              Restaurar tabela padrão
            </button>
          </div>
        </div>
      </div>

      {/* ── Backup ────────────────────────────────────────────────── */}
      <div className="cartao">
        <div className="cartao-corpo">
          <p className="rotulo-bloco">Backup dos seus dados</p>
          <p className="campo-dica" style={{ marginBottom: 14 }}>
            Tudo fica salvo só no navegador deste aparelho. Exporte de vez em quando — é assim que
            você leva o catálogo pro celular ou pra outro computador.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="botao botao-escuro botao-pequeno" onClick={() => exportarJson(base)}>
              ⬇ Exportar backup
            </button>
            <button className="botao botao-claro botao-pequeno" onClick={() => arquivoRef.current?.click()}>
              ⬆ Importar backup
            </button>
            <input
              ref={arquivoRef}
              type="file"
              accept="application/json,.json"
              style={{ display: "none" }}
              onChange={(e) => {
                importar(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <button
              className="botao botao-perigo botao-pequeno"
              style={{ marginLeft: "auto" }}
              onClick={() => {
                if (window.confirm("Isso apaga produtos, impressoras e filamentos deste navegador. Tem certeza?")) {
                  setDados(dadosIniciais());
                  setMensagem({ tom: "info", texto: "Tudo zerado. Bora começar de novo." });
                }
              }}
            >
              Apagar tudo
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
