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
export function Bloco({ titulo, children }) {
  return (
    <>
      <p className="rotulo-bloco">{titulo}</p>
      {children}
    </>
  );
}

export function Selo({ tom = "neutro", children }) {
  return <span className={`selo selo-${tom}`}>{children}</span>;
}

export function Aviso({ tom = "info", icone = "💡", children }) {
  return (
    <div className={`aviso aviso-${tom}`}>
      <span aria-hidden="true">{icone}</span>
      <div>{children}</div>
    </div>
  );
}

export function ChipLink({ url, icone, rotuloVazio }) {
  const destino = href(url);
  if (!destino) {
    return (
      <span className="chip-link chip-vazio">
        {icone} <span>{rotuloVazio}</span>
      </span>
    );
  }
  return (
    <a className="chip-link" href={destino} target="_blank" rel="noopener noreferrer nofollow" title={destino}>
      {icone} <span>{dominio(destino)}</span> ↗
    </a>
  );
}

export function Vazio({ emoji, titulo, children }) {
  return (
    <div className="vazio">
      <span className="emoji" aria-hidden="true">{emoji}</span>
      <strong style={{ color: "var(--tinta-2)" }}>{titulo}</strong>
      <div style={{ marginTop: 6 }}>{children}</div>
    </div>
  );
}
