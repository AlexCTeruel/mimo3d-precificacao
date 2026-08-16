import { CampoDinheiro, CampoNumero, CampoSelecao, CampoTexto, Vazio } from "./ui";
import { novoFilamento } from "../lib/defaults";
import { precoPorGrama } from "../lib/pricing";
import { brl } from "../lib/format";

const TIPOS = ["PLA", "PLA+", "PLA Silk", "PETG", "ABS", "ASA", "TPU", "Resina", "Outro"];

export default function Filamentos({ base, atualizar }) {
  const mudar = (id, campo, valor) =>
    atualizar("filamentos", (lista) =>
      lista.map((f) => (f.id === id ? { ...f, [campo]: valor } : f))
    );

  const remover = (id) => {
    const usado = base.produtos.some((p) => p.filamentoId === id);
    const aviso = usado
      ? "Esse filamento está ligado a produtos — o custo de material deles vai zerar. Remover mesmo?"
      : "Remover esse filamento?";
    if (window.confirm(aviso)) {
      atualizar("filamentos", (lista) => lista.filter((f) => f.id !== id));
    }
  };

  return (
    <>
      <h2 className="secao-titulo">Meus filamentos</h2>
      <p className="secao-desc">
        Cadastre com o preço exato que você pagou no rolo. É daqui que sai o custo por grama de
        cada peça.
      </p>

      {base.filamentos.map((fil) => {
        const porGrama = precoPorGrama(fil);
        return (
          <div className="cartao" key={fil.id}>
            <div className="cartao-corpo">
              <div style={{ display: "flex", gap: 10, alignItems: "flex-end", marginBottom: 14 }}>
                <div style={{ flex: 1 }}>
                  <CampoTexto
                    label="Nome / apelido"
                    placeholder="PLA Rosa Bebê"
                    valor={fil.nome}
                    aoMudar={(v) => mudar(fil.id, "nome", v)}
                  />
                </div>
                <button className="botao botao-perigo botao-pequeno" onClick={() => remover(fil.id)}>
                  Remover
                </button>
              </div>

              <div className="grade grade-3" style={{ marginBottom: 12 }}>
                <CampoSelecao
                  label="Tipo"
                  valor={fil.tipo}
                  aoMudar={(v) => mudar(fil.id, "tipo", v)}
                  opcoes={TIPOS}
                />
                <CampoTexto
                  label="Cor"
                  placeholder="Rosa, branco, preto..."
                  valor={fil.cor}
                  aoMudar={(v) => mudar(fil.id, "cor", v)}
                />
                <CampoTexto
                  label="Fornecedor"
                  placeholder="Onde você compra"
                  valor={fil.fornecedor}
                  aoMudar={(v) => mudar(fil.id, "fornecedor", v)}
                />
              </div>

              <div className="grade grade-3" style={{ alignItems: "end" }}>
                <CampoDinheiro
                  label="Preço do rolo"
                  valor={fil.precoKg}
                  aoMudar={(v) => mudar(fil.id, "precoKg", v)}
                  dica="Com frete, se você pagou."
                />
                <CampoNumero
                  label="Peso do rolo"
                  sufixo="g"
                  passo="50"
                  valor={fil.pesoRoloG}
                  aoMudar={(v) => mudar(fil.id, "pesoRoloG", v)}
                />
                <div
                  style={{
                    background: "var(--creme-2)", border: "1px solid var(--linha)",
                    borderRadius: "var(--raio-p)", padding: "10px 14px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.07em",
                      color: "var(--apagado-2)", fontWeight: 700,
                    }}
                  >
                    Custo por grama
                  </div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 17, fontWeight: 700, color: "var(--navy)" }}>
                    R$ {porGrama.toFixed(3).replace(".", ",")}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--apagado)" }}>
                    uma peça de 100 g = {brl(porGrama * 100)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {!base.filamentos.length && (
        <div className="cartao">
          <Vazio emoji="🧵" titulo="Nenhum filamento cadastrado">
            Cadastre pelo menos um pra calcular o custo de material das peças.
          </Vazio>
        </div>
      )}

      <button
        className="botao-adicionar"
        onClick={() => atualizar("filamentos", (l) => [...l, novoFilamento()])}
      >
        + Adicionar filamento
      </button>
    </>
  );
}
