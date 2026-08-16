import { CampoDinheiro, CampoNumero, CampoTexto, Vazio, Aviso } from "./ui";
import { novaImpressora } from "../lib/defaults";
import { custoHoraImpressora } from "../lib/pricing";
import { brl } from "../lib/format";

export default function Impressoras({ base, atualizar }) {
  const mudar = (id, campo, valor) =>
    atualizar("impressoras", (lista) =>
      lista.map((i) => (i.id === id ? { ...i, [campo]: valor } : i))
    );

  const remover = (id) => {
    const usada = base.produtos.some((p) => p.impressoraId === id);
    const aviso = usada
      ? "Essa impressora está ligada a produtos — eles vão ficar sem energia e depreciação no cálculo. Remover mesmo?"
      : "Remover essa impressora?";
    if (window.confirm(aviso)) {
      atualizar("impressoras", (lista) => lista.filter((i) => i.id !== id));
    }
  };

  return (
    <>
      <h2 className="secao-titulo">Minhas impressoras</h2>
      <p className="secao-desc">
        Com o valor da máquina e a vida útil, a calculadora descobre sozinha quanto cada hora de
        impressão custa em desgaste, manutenção e energia.
      </p>

      <div style={{ marginBottom: 16 }}>
        <Aviso icone="⚡">
          A energia usa o preço do kWh que está em <b>Ajustes</b> ({brl(base.settings.energiaKwh)}/kWh).
          Olhe na sua conta de luz o valor com impostos.
        </Aviso>
      </div>

      {base.impressoras.map((imp) => {
        const custo = custoHoraImpressora(imp, base.settings);
        return (
          <div className="cartao" key={imp.id}>
            <div className="cartao-corpo">
              <div style={{ display: "flex", gap: 10, alignItems: "flex-end", marginBottom: 14 }}>
                <div style={{ flex: 1 }}>
                  <CampoTexto
                    label="Nome da impressora"
                    placeholder="Ender 3, Bambu A1, K1..."
                    valor={imp.nome}
                    aoMudar={(v) => mudar(imp.id, "nome", v)}
                  />
                </div>
                <button className="botao botao-perigo botao-pequeno" onClick={() => remover(imp.id)}>
                  Remover
                </button>
              </div>

              <div className="grade grade-3" style={{ marginBottom: 12 }}>
                <CampoDinheiro
                  label="Valor da máquina"
                  valor={imp.valor}
                  aoMudar={(v) => mudar(imp.id, "valor", v)}
                  dica="Quanto você pagou nela."
                />
                <CampoNumero
                  label="Vida útil"
                  sufixo="h"
                  passo="100"
                  valor={imp.vidaUtilHoras}
                  aoMudar={(v) => mudar(imp.id, "vidaUtilHoras", v)}
                  dica="Estimativa comum: 5.000 h."
                />
                <CampoNumero
                  label="Potência média"
                  sufixo="W"
                  passo="10"
                  valor={imp.potenciaW}
                  aoMudar={(v) => mudar(imp.id, "potenciaW", v)}
                  dica="PLA com mesa a 60 °C fica perto de 120 W."
                />
              </div>

              <div className="grade grade-2" style={{ marginBottom: 14 }}>
                <CampoDinheiro
                  label="Manutenção por ano"
                  valor={imp.manutencaoAno}
                  aoMudar={(v) => mudar(imp.id, "manutencaoAno", v)}
                  dica="Bicos, correias, peças de reposição."
                />
                <CampoNumero
                  label="Horas de uso por ano"
                  sufixo="h"
                  passo="50"
                  valor={imp.horasAno}
                  aoMudar={(v) => mudar(imp.id, "horasAno", v)}
                  dica="Pra diluir a manutenção."
                />
              </div>

              <div className="resultado">
                <div className="resultado-linha">
                  <span>Depreciação</span><b>{brl(custo.depreciacao)}/h</b>
                </div>
                <div className="resultado-linha">
                  <span>Manutenção</span><b>{brl(custo.manutencao)}/h</b>
                </div>
                <div className="resultado-linha">
                  <span>Energia</span><b>{brl(custo.energia)}/h</b>
                </div>
                <div className="resultado-destaque" style={{ background: "var(--navy-3)" }}>
                  <div className="rotulo">CUSTO DE CADA HORA LIGADA</div>
                  <div className="valor" style={{ fontSize: 20 }}>{brl(custo.total)}</div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {!base.impressoras.length && (
        <div className="cartao">
          <Vazio emoji="🖨️" titulo="Nenhuma impressora cadastrada">
            Sem ela, energia e depreciação ficam de fora e o custo sai menor do que é de verdade.
          </Vazio>
        </div>
      )}

      <button
        className="botao-adicionar"
        onClick={() => atualizar("impressoras", (l) => [...l, novaImpressora()])}
      >
        + Adicionar impressora
      </button>
    </>
  );
}
