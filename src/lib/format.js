// ─── Formatação pt-BR ──────────────────────────────────────────────────────────

export const brl = (v) =>
  `R$ ${(Number(v) || 0).toFixed(2).replace(".", ",")}`;

export const brlCompact = (v) => {
  const n = Number(v) || 0;
  if (Math.abs(n) >= 1000) return `R$ ${(n / 1000).toFixed(1).replace(".", ",")}k`;
  return brl(n);
};

export const pct = (v, casas = 1) =>
  `${(Number(v) || 0).toFixed(casas).replace(".", ",")}%`;

export const gramas = (v) => `${(Number(v) || 0).toFixed(0)} g`;

/** 2.75 -> "2h45" */
export const horas = (h) => {
  const total = Math.round((Number(h) || 0) * 60);
  const hh = Math.floor(total / 60);
  const mm = total % 60;
  if (!hh) return `${mm}min`;
  return mm ? `${hh}h${String(mm).padStart(2, "0")}` : `${hh}h`;
};

/** Aceita "12,50" ou "12.50" ou "" */
export const num = (v) => {
  if (v === "" || v === null || v === undefined) return 0;
  const n = parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

/** Domínio limpo de uma URL, pra mostrar como chip: "cults3d.com" */
export const dominio = (url) => {
  if (!url) return "";
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return url.slice(0, 30);
  }
};

/** Normaliza pra href seguro — só http(s), nunca javascript: */
export const href = (url) => {
  if (!url) return null;
  const limpo = url.trim();
  if (/^https?:\/\//i.test(limpo)) return limpo;
  if (/^[a-z][a-z0-9+.-]*:/i.test(limpo)) return null; // outro protocolo: bloqueia
  return `https://${limpo}`;
};

export const hoje = () => new Date().toISOString().slice(0, 10);

export const uid = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
