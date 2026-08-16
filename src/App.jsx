import { useState } from "react";
import { useBanco } from "./lib/storage";
import Painel from "./components/Painel";
import Produtos from "./components/Produtos";
import Impressoras from "./components/Impressoras";
import Filamentos from "./components/Filamentos";
import Ajustes from "./components/Ajustes";
import Guia from "./components/Guia";

const ABAS = [
  { id: "painel", icone: "📊", label: "Painel" },
  { id: "produtos", icone: "🎁", label: "Produtos", contar: (d) => d.produtos.length },
  { id: "impressoras", icone: "🖨️", label: "Impressoras", contar: (d) => d.impressoras.length },
  { id: "filamentos", icone: "🧵", label: "Filamentos", contar: (d) => d.filamentos.length },
  { id: "ajustes", icone: "⚙️", label: "Ajustes" },
  { id: "guia", icone: "💡", label: "Dicas" },
];

export default function App() {
  const { dados, setDados, atualizar } = useBanco();
  const [aba, setAba] = useState("produtos");

  return (
    <>
      <header className="topo">
        <div className="topo-interno">
          <div className="marca">
            <span className="marca-laco" aria-hidden="true">🎀</span>
            <div>
              <div className="marca-nome">
                mimo<em>3D</em>
              </div>
              <div className="marca-sub">Precificação</div>
            </div>
            <div className="topo-acoes">
              <button className="botao botao-fantasma botao-pequeno" onClick={() => setAba("guia")}>
                Como funciona
              </button>
            </div>
          </div>
          <p className="marca-slogan">
            Do arquivo ao anúncio publicado: guarde de onde veio o modelo, onde ele está à venda e
            descubra o preço que realmente deixa lucro depois das taxas.
          </p>

          <nav className="abas" role="tablist" aria-label="Seções">
            {ABAS.map((a) => {
              const contagem = a.contar?.(dados);
              return (
                <button
                  key={a.id}
                  className="aba"
                  role="tab"
                  aria-selected={aba === a.id}
                  onClick={() => setAba(a.id)}
                >
                  <span aria-hidden="true">{a.icone}</span>
                  {a.label}
                  {contagem > 0 && <span className="aba-contador">{contagem}</span>}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="pagina">
        {aba === "painel" && <Painel base={dados} irPara={setAba} />}
        {aba === "produtos" && <Produtos base={dados} atualizar={atualizar} />}
        {aba === "impressoras" && <Impressoras base={dados} atualizar={atualizar} />}
        {aba === "filamentos" && <Filamentos base={dados} atualizar={atualizar} />}
        {aba === "ajustes" && <Ajustes base={dados} atualizar={atualizar} setDados={setDados} />}
        {aba === "guia" && <Guia base={dados} />}

        <p className="rodape">
          mimo<b style={{ color: "var(--rosa)" }}>3D</b> · cada peça, um mimo 🩷
          <br />
          Seus dados ficam salvos só neste navegador — exporte o backup em Ajustes.
        </p>
      </main>
    </>
  );
}
