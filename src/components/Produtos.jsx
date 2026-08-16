import { useMemo, useState } from "react";
import CartaoProduto from "./CartaoProduto";
import Icone from "./Icone";
import { Vazio, Aviso, Selo, ChipLink } from "./ui";
import { novoProduto, STATUS_PRODUTO } from "../lib/defaults";
import { analisarProduto } from "../lib/pricing";
import { uid, hoje, brl, pct, gramas, horas } from "../lib/format";

const ORDENACOES = [
  { id: "recentes", label: "Mais recentes" },
  { id: "margem", label: "Menor margem primeiro" },
  { id: "lucro", label: "Maior lucro primeiro" },
  { id: "nome", label: "Nome (A–Z)" },
];

const VISOES = [
  { id: "cartoes", icone: "cartoes", label: "Cartões" },
  { id: "lista", icone: "lista", label: "Lista" },
  { id: "icones", icone: "grade", label: "Ícones" },
];

// ─── Linha da visão em lista ──────────────────────────────────────────────────
function LinhaProduto({ produto, analise, aoAbrir }) {
  const status = STATUS_PRODUTO.find((s) => s.id === produto.status);
  const leitura = analise.leitura;

  return (
    <button className="linha-produto" onClick={aoAbrir}>
      <span className="emoji" aria-hidden="true">{produto.emoji}</span>

      <span className="identidade">
        <b>{produto.nome || "Sem nome"}</b>
        <small>
          {produto.anuncioSku && <>{produto.anuncioSku} · </>}
          {analise.custo.gramas > 0 && <>{gramas(analise.custo.gramas)} · </>}
          {analise.custo.horas > 0 && <>{horas(analise.custo.horas)} · </>}
          {analise.canal?.nome}
          {analise.canais.length > 1 && ` +${analise.canais.length - 1}`}
        </small>
      </span>

      {status && <Selo tom={status.tom}>{status.label}</Selo>}

      <span className="numero">
        <small>custo</small>
        {analise.custo.total > 0 ? brl(analise.custo.total) : "—"}
      </span>
      <span className="numero">
        <small>preço</small>
        {analise.preco > 0 ? brl(analise.preco) : "—"}
      </span>
      <span className="numero" style={{ color: leitura?.cor }}>
        <small>lucro</small>
        {analise.venda ? brl(analise.venda.lucro) : "—"}
      </span>

      <span className="margem">
        <span className="barra-trilho">
          <span
            className="barra-preenchida"
            style={{
              width: analise.venda ? `${Math.min(100, Math.max(2, analise.venda.margem))}%` : 0,
              background: leitura?.cor,
            }}
          />
        </span>
        <b style={{ color: leitura?.cor }}>{analise.venda ? pct(analise.venda.margem) : "—"}</b>
      </span>

      <Icone nome="seta" tamanho={15} />
    </button>
  );
}

// ─── Bloco da visão em ícones ─────────────────────────────────────────────────
function BlocoProduto({ produto, analise, aoAbrir }) {
  const status = STATUS_PRODUTO.find((s) => s.id === produto.status);
  const leitura = analise.leitura;

  return (
    <button className="bloco-produto" onClick={aoAbrir}>
      <span className="capa" aria-hidden="true">
        {produto.emoji}
        {analise.venda && (
          <i className="anel" style={{ background: leitura.cor }} />
        )}
      </span>

      <b className="nome">{produto.nome || "Sem nome"}</b>

      <span className="preco">{analise.preco > 0 ? brl(analise.preco) : "sem preço"}</span>

      <span className="faixa">
        {status && <Selo tom={status.tom}>{status.label}</Selo>}
        {analise.venda && (
          <span className="selo" style={{ color: leitura.cor, borderColor: leitura.cor }}>
            {pct(analise.venda.margem)}
          </span>
        )}
      </span>

      <span className="rodape-bloco">
        <ChipLink url={produto.modeloUrl} icone="cubo" rotuloVazio="sem modelo" />
        <ChipLink url={produto.anuncioUrl} icone="loja" rotuloVazio="sem anúncio" />
      </span>
    </button>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────
export default function Produtos({ base, atualizar }) {
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [ordem, setOrdem] = useState("recentes");
  const [visao, setVisao] = useState("cartoes");
  const [abertos, setAbertos] = useState(
    () => new Set(base.produtos.length === 1 ? [base.produtos[0].id] : [])
  );

  const { produtos } = base;

  const alternarAberto = (id) =>
    setAbertos((atuais) => {
      const proximo = new Set(atuais);
      if (proximo.has(id)) proximo.delete(id);
      else proximo.add(id);
      return proximo;
    });

  /** Lista e ícones são pra navegar: clicou, abre o cartão completo do produto. */
  const abrirNoCartao = (id) => {
    setAbertos((atuais) => new Set(atuais).add(id));
    setVisao("cartoes");
    requestAnimationFrame(() =>
      document.getElementById(`produto-${id}`)?.scrollIntoView({ block: "start" })
    );
  };

  const adicionar = () => {
    const p = {
      ...novoProduto(),
      impressoraId: base.impressoras[0]?.id || "",
      filamentoId: base.filamentos[0]?.id || "",
      canaisIds: [base.canais[0]?.id].filter(Boolean),
    };
    setAbertos((atuais) => new Set(atuais).add(p.id));
    setVisao("cartoes");
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
      filamentosUsados: (produto.filamentosUsados || []).map((u) => ({ ...u, id: uid() })),
    };
    setAbertos((atuais) => new Set(atuais).add(copia.id));
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

    const analises = new Map(produtos.map((p) => [p.id, analisarProduto(p, base)]));

    if (ordem !== "recentes") {
      lista = [...lista].sort((a, b) => {
        const A = analises.get(a.id);
        const B = analises.get(b.id);
        if (ordem === "nome") return (a.nome || "").localeCompare(b.nome || "", "pt-BR");
        if (ordem === "margem") return (A.venda?.margem ?? 999) - (B.venda?.margem ?? 999);
        return (B.venda?.lucro ?? -999) - (A.venda?.lucro ?? -999);
      });
    }
    return lista.map((produto) => ({ produto, analise: analises.get(produto.id) }));
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
      <div className="cartao barra-controles">
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
          aria-label="Filtrar por status"
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
          aria-label="Ordenar"
        >
          {ORDENACOES.map((o) => (
            <option key={o.id} value={o.id}>{o.label}</option>
          ))}
        </select>

        <div className="seletor-visao" role="group" aria-label="Modo de visualização">
          {VISOES.map((v) => (
            <button
              key={v.id}
              className={visao === v.id ? "ativo" : undefined}
              aria-pressed={visao === v.id}
              title={v.label}
              onClick={() => setVisao(v.id)}
            >
              <Icone nome={v.icone} tamanho={16} />
            </button>
          ))}
        </div>
      </div>

      <button className="botao-adicionar" style={{ marginBottom: 16 }} onClick={adicionar}>
        <Icone nome="mais" tamanho={17} /> Novo produto
      </button>

      {/* ── Cartões ───────────────────────────────────────────────── */}
      {visao === "cartoes" &&
        visiveis.map(({ produto }) => (
          <CartaoProduto
            key={produto.id}
            produto={produto}
            base={base}
            aberto={abertos.has(produto.id)}
            aoAlternar={() => alternarAberto(produto.id)}
            aoMudar={(campo, valor) => mudarCampo(produto.id, campo, valor)}
            aoRemover={() => remover(produto.id)}
            aoDuplicar={() => duplicar(produto)}
          />
        ))}

      {/* ── Lista ─────────────────────────────────────────────────── */}
      {visao === "lista" && visiveis.length > 0 && (
        <div className="cartao lista-produtos">
          {visiveis.map(({ produto, analise }) => (
            <LinhaProduto
              key={produto.id}
              produto={produto}
              analise={analise}
              aoAbrir={() => abrirNoCartao(produto.id)}
            />
          ))}
        </div>
      )}

      {/* ── Ícones ────────────────────────────────────────────────── */}
      {visao === "icones" && visiveis.length > 0 && (
        <div className="grade-produtos">
          {visiveis.map(({ produto, analise }) => (
            <BlocoProduto
              key={produto.id}
              produto={produto}
              analise={analise}
              aoAbrir={() => abrirNoCartao(produto.id)}
            />
          ))}
        </div>
      )}

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
