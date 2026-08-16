import { useMemo, useState } from "react";
import CartaoProduto from "./CartaoProduto";
import Icone from "./Icone";
import { Vazio, Aviso } from "./ui";
import { novoProduto, STATUS_PRODUTO } from "../lib/defaults";
import { analisarProduto } from "../lib/pricing";
import { uid, hoje } from "../lib/format";

const ORDENACOES = [
  { id: "recentes", label: "Mais recentes" },
  { id: "margem", label: "Menor margem primeiro" },
  { id: "lucro", label: "Maior lucro primeiro" },
  { id: "nome", label: "Nome (A–Z)" },
];

export default function Produtos({ base, atualizar }) {
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [ordem, setOrdem] = useState("recentes");
  const [recemCriado, setRecemCriado] = useState(null);

  const { produtos } = base;

  const adicionar = () => {
    const p = {
      ...novoProduto(),
      impressoraId: base.impressoras[0]?.id || "",
      filamentoId: base.filamentos[0]?.id || "",
      canalId: base.canais[0]?.id || "",
    };
    setRecemCriado(p.id);
    atualizar("produtos", (lista) => [p, ...lista]);
  };

  const duplicar = (produto) => {
    const copia = {
      ...produto,
      id: uid(),
      criadoEm: hoje(),
      nome: `${produto.nome || "Produto"} (cópia)`,
      anuncioUrl: "",
      anuncioSku: "",
      status: "ideia",
    };
    setRecemCriado(copia.id);
    atualizar("produtos", (lista) => {
      const i = lista.findIndex((p) => p.id === produto.id);
      const nova = [...lista];
      nova.splice(i + 1, 0, copia);
      return nova;
    });
  };

  const mudarCampo = (id, campo, valor) =>
    atualizar("produtos", (lista) =>
      lista.map((p) => (p.id === id ? { ...p, [campo]: valor } : p))
    );

  const remover = (id) =>
    atualizar("produtos", (lista) => lista.filter((p) => p.id !== id));

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    let lista = produtos.filter((p) => {
      if (filtroStatus !== "todos" && p.status !== filtroStatus) return false;
      if (!termo) return true;
      return [p.nome, p.tags, p.anuncioSku, p.modeloOrigem, p.modeloAutor, p.observacoes]
        .filter(Boolean)
        .some((c) => String(c).toLowerCase().includes(termo));
    });

    if (ordem !== "recentes") {
      const analises = new Map(produtos.map((p) => [p.id, analisarProduto(p, base)]));
      lista = [...lista].sort((a, b) => {
        const A = analises.get(a.id);
        const B = analises.get(b.id);
        if (ordem === "nome") return (a.nome || "").localeCompare(b.nome || "", "pt-BR");
        if (ordem === "margem") return (A.venda?.margem ?? 999) - (B.venda?.margem ?? 999);
        return (B.venda?.lucro ?? -999) - (A.venda?.lucro ?? -999);
      });
    }
    return lista;
  }, [produtos, busca, filtroStatus, ordem, base]);

  const semCadastro = !base.impressoras.length || !base.filamentos.length;

  return (
    <>
      <h2 className="secao-titulo">Produtos</h2>
      <p className="secao-desc">
        Cada produto guarda de onde veio o modelo, onde ele está publicado e quanto ele realmente
        te dá de lucro depois das taxas.
      </p>

      {semCadastro && (
        <div style={{ marginBottom: 16 }}>
          <Aviso tom="atencao" icone="impressora">
            Cadastre sua {!base.impressoras.length && "impressora"}
            {!base.impressoras.length && !base.filamentos.length && " e seu "}
            {!base.filamentos.length && "filamento"} nas abas acima — é o que faz a calculadora
            saber o custo de material, energia e depreciação sozinha.
          </Aviso>
        </div>
      )}

      {/* ── Barra de controles ────────────────────────────────────── */}
      <div
        className="cartao"
        style={{ padding: 12, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}
      >
        <div className="entrada-prefixo" style={{ flex: "2 1 220px" }}>
          <span style={{ display: "grid", placeItems: "center" }}>
            <Icone nome="busca" tamanho={15} />
          </span>
          <input
            className="entrada"
            placeholder="Buscar por nome, tag, SKU, autor..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <select
          className="entrada"
          style={{ flex: "1 1 130px", width: "auto" }}
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
        >
          <option value="todos">Todos os status</option>
          {STATUS_PRODUTO.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
        <select
          className="entrada"
          style={{ flex: "1 1 150px", width: "auto" }}
          value={ordem}
          onChange={(e) => setOrdem(e.target.value)}
        >
          {ORDENACOES.map((o) => (
            <option key={o.id} value={o.id}>{o.label}</option>
          ))}
        </select>
      </div>

      <button className="botao-adicionar" style={{ marginBottom: 16 }} onClick={adicionar}>
        <Icone nome="mais" tamanho={17} /> Novo produto
      </button>

      {visiveis.map((produto) => (
        <CartaoProduto
          key={produto.id}
          produto={produto}
          base={base}
          abertoInicial={produto.id === recemCriado || produtos.length === 1}
          aoMudar={(campo, valor) => mudarCampo(produto.id, campo, valor)}
          aoRemover={() => remover(produto.id)}
          aoDuplicar={() => duplicar(produto)}
        />
      ))}

      {!visiveis.length && (
        <div className="cartao">
          <Vazio icone="produtos" titulo={produtos.length ? "Nada com esse filtro" : "Nenhum produto ainda"}>
            {produtos.length
              ? "Tente outro termo ou volte o filtro pra “todos os status”."
              : "Clique em “Novo produto” e comece pelo peso e tempo que o fatiador mostrou."}
          </Vazio>
        </div>
      )}
    </>
  );
}
