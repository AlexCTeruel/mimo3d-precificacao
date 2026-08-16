import Icone from "./Icone";
import { dominio, href } from "../lib/format";

// ─── Campos ────────────────────────────────────────────────────────────────────
export function Campo({ label, dica, children, aviso }) {
  return (
    <div className="campo">
      {label && <label>{label}</label>}
      {children}
      {aviso && <span className="campo-dica" style={{ color: "var(--risco)" }}>{aviso}</span>}
      {dica && !aviso && <span className="campo-dica">{dica}</span>}
    </div>
  );
}

export function CampoTexto({ label, dica, valor, aoMudar, placeholder, tipo = "text" }) {
  return (
    <Campo label={label} dica={dica}>
      <input
        className="entrada"
        type={tipo}
        value={valor ?? ""}
        placeholder={placeholder}
        onChange={(e) => aoMudar(e.target.value)}
      />
    </Campo>
  );
}

export function CampoDinheiro({ label, dica, valor, aoMudar, placeholder = "0,00", passo = "0.01" }) {
  return (
    <Campo label={label} dica={dica}>
      <div className="entrada-prefixo">
        <span>R$</span>
        <input
          className="entrada"
          type="number"
          step={passo}
          min="0"
          value={valor ?? ""}
          placeholder={placeholder}
          onChange={(e) => aoMudar(e.target.value)}
        />
      </div>
    </Campo>
  );
}

export function CampoNumero({ label, dica, valor, aoMudar, sufixo, passo = "1", min = "0", placeholder = "0" }) {
  const entrada = (
    <input
      className="entrada"
      type="number"
      step={passo}
      min={min}
      value={valor ?? ""}
      placeholder={placeholder}
      onChange={(e) => aoMudar(e.target.value)}
    />
  );
  return (
    <Campo label={label} dica={dica}>
      {sufixo ? (
        <div className="entrada-sufixo">
          <span>{sufixo}</span>
          {entrada}
        </div>
      ) : entrada}
    </Campo>
  );
}

export function CampoSelecao({ label, dica, valor, aoMudar, opcoes, vazio }) {
  return (
    <Campo label={label} dica={dica}>
      <select value={valor ?? ""} onChange={(e) => aoMudar(e.target.value)}>
        {vazio && <option value="">{vazio}</option>}
        {opcoes.map((o) => {
          const id = typeof o === "string" ? o : o.id;
          const texto = typeof o === "string" ? o : o.label;
          return <option key={id} value={id}>{texto}</option>;
        })}
      </select>
    </Campo>
  );
}

export function CampoLink({ label, dica, valor, aoMudar, placeholder }) {
  const destino = href(valor);
  return (
    <div className="campo">
      <label>
        {label}
        {destino && (
          <a
            href={destino}
            target="_blank"
            rel="noopener noreferrer nofollow"
            style={{ marginLeft: "auto", fontSize: 10.5, color: "var(--rosa)", textDecoration: "none", fontWeight: 700 }}
          >
            abrir ↗
          </a>
        )}
      </label>
      <input
        className="entrada"
        type="url"
        inputMode="url"
        value={valor ?? ""}
        placeholder={placeholder}
        onChange={(e) => aoMudar(e.target.value)}
      />
      {dica && <span className="campo-dica">{dica}</span>}
    </div>
  );
}

// ─── Blocos ────────────────────────────────────────────────────────────────────
export function Bloco({ titulo, icone, children }) {
  return (
    <>
      <p className="rotulo-bloco">
        {icone && <Icone nome={icone} tamanho={14} />}
        {titulo}
      </p>
      {children}
    </>
  );
}

export function Selo({ tom = "neutro", children }) {
  return <span className={`selo selo-${tom}`}>{children}</span>;
}

const ICONE_POR_TOM = { info: "info", atencao: "alerta", risco: "alerta", marca: "info" };

export function Aviso({ tom = "info", icone, children }) {
  return (
    <div className={`aviso aviso-${tom}`}>
      <Icone nome={icone || ICONE_POR_TOM[tom] || "info"} tamanho={16} />
      <div>{children}</div>
    </div>
  );
}

export function ChipLink({ url, icone, rotuloVazio }) {
  const destino = href(url);
  if (!destino) {
    return (
      <span className="chip-link chip-vazio">
        <Icone nome={icone} tamanho={13} />
        <span>{rotuloVazio}</span>
      </span>
    );
  }
  return (
    <a className="chip-link" href={destino} target="_blank" rel="noopener noreferrer nofollow" title={destino}>
      <Icone nome={icone} tamanho={13} />
      <span>{dominio(destino)}</span>
      <Icone nome="externo" tamanho={12} />
    </a>
  );
}

export function Vazio({ icone = "info", titulo, children }) {
  return (
    <div className="vazio">
      <div className="selo-icone"><Icone nome={icone} tamanho={24} /></div>
      <strong>{titulo}</strong>
      <div>{children}</div>
    </div>
  );
}
