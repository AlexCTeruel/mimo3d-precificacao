import { useState } from "react";
import { useBanco } from "./lib/storage";
import { MARCA, APOIO } from "./lib/marca";
import Icone from "./components/Icone";
import Apoiar from "./components/Apoiar";
import Painel from "./components/Painel";
import Produtos from "./components/Produtos";
import Impressoras from "./components/Impressoras";
import Filamentos from "./components/Filamentos";
import Ajustes from "./components/Ajustes";
import Guia from "./components/Guia";

const SECOES = [
  { id: "painel", icone: "painel", label: "Painel" },
  { id: "produtos", icone: "produtos", label: "Produtos" },
  { id: "impressoras", icone: "impressora", label: "Impressoras" },
  { id: "filamentos", icone: "filamento", label: "Filamentos" },
  { id: "ajustes", icone: "ajustes", label: "Ajustes" },
  { id: "guia", icone: "guia", label: "Dicas" },
];

export default function App() {
  const { dados, setDados, atualizar } = useBanco();
  const [secao, setSecao] = useState("produtos");
  const [apoioAberto, setApoioAberto] = useState(false);

  return (
    <div className="app">
      <aside className="trilho">
        <div className="trilho-marca" aria-hidden="true">
          <Icone nome="cubo" tamanho={22} />
        </div>

        <nav aria-label="Seções">
          {SECOES.map((s) => (
            <button
              key={s.id}
              className="trilho-botao"
              aria-current={secao === s.id ? "page" : undefined}
              aria-label={s.label}
              onClick={() => setSecao(s.id)}
            >
              <Icone nome={s.icone} tamanho={20} />
              <span>{s.label}</span>
            </button>
          ))}
        </nav>

        {APOIO.ativo && (
          <button
            className="trilho-botao trilho-apoiar"
            aria-label="Apoiar o projeto"
            onClick={() => setApoioAberto(true)}
          >
            <Icone nome="coracao" tamanho={20} />
            <span>Apoiar</span>
          </button>
        )}
      </aside>

      <div className="conteudo">
        <header className="cabecalho">
          <div className="cabecalho-interno">
            <div>
              <h1 className="marca-nome">{MARCA.nome}</h1>
              <p className="marca-tagline">
                <i aria-hidden="true" /> {MARCA.tagline}
              </p>
            </div>
            <div className="cabecalho-acoes">
              {APOIO.ativo && (
                <button className="botao botao-claro botao-pequeno" onClick={() => setApoioAberto(true)}>
                  <Icone nome="coracao" tamanho={15} /> Apoiar
                </button>
              )}
              <button className="botao botao-claro botao-pequeno" onClick={() => setSecao("guia")}>
                <Icone nome="guia" tamanho={15} /> Como funciona
              </button>
            </div>
          </div>
        </header>

        <main className="pagina">
          {secao === "painel" && <Painel base={dados} irPara={setSecao} />}
          {secao === "produtos" && <Produtos base={dados} atualizar={atualizar} />}
          {secao === "impressoras" && <Impressoras base={dados} atualizar={atualizar} />}
          {secao === "filamentos" && <Filamentos base={dados} atualizar={atualizar} />}
          {secao === "ajustes" && <Ajustes base={dados} atualizar={atualizar} setDados={setDados} />}
          {secao === "guia" && <Guia base={dados} />}

          <p className="rodape">
            <b>{MARCA.nome}</b> · {MARCA.tagline.toLowerCase()}
            <br />
            Seus dados ficam salvos só neste navegador — exporte o backup em Ajustes.
          </p>
        </main>
      </div>

      {apoioAberto && <Apoiar aoFechar={() => setApoioAberto(false)} />}
    </div>
  );
}
