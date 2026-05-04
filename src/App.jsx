import { useState } from "react";

// ─── Shopee fee tables (CPF seller) ───────────────────────────────────────────
function getShopeeFees(price) {
  if (price <= 79.99)  return { pct: 0.20, fixed: 4 };
  if (price <= 99.99)  return { pct: 0.14, fixed: 16 };
  if (price <= 199.99) return { pct: 0.14, fixed: 20 };
  if (price <= 499.99) return { pct: 0.14, fixed: 26 };
  return { pct: 0.14, fixed: 26 };
}

function calcMetrics(cost, price, usePix) {
  const pixDiscount = usePix ? price * 0.05 : 0;
  const netPrice = price - pixDiscount;
  const { pct, fixed } = getShopeeFees(price);
  const commission = netPrice * pct;
  const shopeeTotal = commission + fixed;
  const profit = netPrice - shopeeTotal - cost;
  const margin = price > 0 ? (profit / price) * 100 : 0;
  return { pixDiscount, netPrice, commission, shopeeTotal, profit, margin, pct, fixed };
}

function suggestPrice(cost) {
  // Try multiples of cost, find best margin landing above 25%
  for (const mult of [3.5, 3, 2.8, 2.5]) {
    const candidate = Math.ceil(cost * mult / 0.1) * 0.1;
    const m = calcMetrics(cost, candidate, true);
    if (m.margin >= 25) return candidate;
  }
  return Math.ceil(cost * 3 / 0.1) * 0.1;
}

const fmt = (v) => `R$ ${v.toFixed(2).replace(".", ",")}`;
const fmtPct = (v) => `${v.toFixed(1).replace(".", ",")}%`;




// ─── Empty product template ────────────────────────────────────────────────────
const emptyProduct = () => ({
  id: Date.now(),
  name: "",
  filamentCost: "",
  energyCost: "",
  packagingCost: "",
  printHours: "",
  hourlyRate: "",
  extraCost: "",
  price: "",
  usePix: true,
});

// ─── Margin color ──────────────────────────────────────────────────────────────
function marginColor(m) {
  if (m >= 40) return "#22c55e";
  if (m >= 25) return "#f59e0b";
  if (m >= 10) return "#ef4444";
  return "#dc2626";
}

function marginLabel(m) {
  if (m >= 40) return "Ótima";
  if (m >= 25) return "Boa";
  if (m >= 10) return "Baixa";
  return "Inviável";
}

// ─── Product Card ──────────────────────────────────────────────────────────────
function ProductCard({ product, onChange, onRemove }) {
  const cost =
    (parseFloat(product.filamentCost) || 0) +
    (parseFloat(product.energyCost) || 0) +
    (parseFloat(product.packagingCost) || 0) +
    (parseFloat(product.printHours) || 0) * (parseFloat(product.hourlyRate) || 0) +
    (parseFloat(product.extraCost) || 0);

  const price = parseFloat(product.price) || 0;
  const metrics = cost > 0 && price > 0 ? calcMetrics(cost, price, product.usePix) : null;
  const suggested = cost > 0 ? suggestPrice(cost) : null;

  const [expanded, setExpanded] = useState(true);

  const numInput = (field, label, placeholder = "0,00") => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 11, color: "#8b7f72", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <span style={{
          position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
          fontSize: 12, color: "#b0aa9f", pointerEvents: "none"
        }}>R$</span>
        <input
          type="number"
          step="0.01"
          min="0"
          placeholder={placeholder}
          value={product[field]}
          onChange={e => onChange(field, e.target.value)}
          style={{
            width: "100%", boxSizing: "border-box",
            background: "#f9f6f0", border: "1px solid #e8e0d4",
            borderRadius: 8, padding: "8px 10px 8px 28px",
            fontSize: 13, color: "#1a1410", outline: "none",
            fontFamily: "'DM Mono', monospace",
          }}
        />
      </div>
    </div>
  );

  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e8e0d4",
      borderRadius: 16,
      overflow: "hidden",
      boxShadow: "0 2px 12px rgba(15,31,61,0.06)",
      marginBottom: 16,
    }}>
      {/* Header */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          background: "#0f1f3d",
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: "#1a3a6e",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16,
        }}>🎁</div>
        <input
          type="text"
          placeholder="Nome do produto..."
          value={product.name}
          onClick={e => e.stopPropagation()}
          onChange={e => onChange("name", e.target.value)}
          style={{
            flex: 1, background: "transparent", border: "none", outline: "none",
            fontSize: 15, fontWeight: 600, color: "#f2eee8",
            fontFamily: "'DM Sans', sans-serif",
          }}
        />
        {metrics && (
          <div style={{
            background: marginColor(metrics.margin),
            color: "#fff",
            fontSize: 11, fontWeight: 700,
            padding: "3px 10px", borderRadius: 99,
          }}>
            {fmtPct(metrics.margin)} · {marginLabel(metrics.margin)}
          </div>
        )}
        <button
          onClick={e => { e.stopPropagation(); onRemove(); }}
          style={{
            background: "rgba(255,255,255,0.1)", border: "none",
            borderRadius: 6, color: "#f2eee8", fontSize: 14,
            width: 28, height: 28, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >×</button>
        <span style={{ color: "#a8c0e8", fontSize: 12 }}>{expanded ? "▲" : "▼"}</span>
      </div>

      {expanded && (
        <div style={{ padding: 18 }}>
          {/* Cost inputs */}
          <p style={{ fontSize: 11, color: "#b0aa9f", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
            Custos de produção
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 14 }}>
            {numInput("filamentCost", "Filamento")}
            {numInput("energyCost", "Energia")}
            {numInput("packagingCost", "Embalagem")}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 11, color: "#8b7f72", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Horas de impressão
              </label>
              <input
                type="number" step="0.5" min="0" placeholder="0"
                value={product.printHours}
                onChange={e => onChange("printHours", e.target.value)}
                style={{
                  background: "#f9f6f0", border: "1px solid #e8e0d4",
                  borderRadius: 8, padding: "8px 10px",
                  fontSize: 13, color: "#1a1410", outline: "none",
                  fontFamily: "'DM Mono', monospace",
                }}
              />
            </div>
            {numInput("hourlyRate", "Custo/hora")}
            {numInput("extraCost", "Extra / Mão de obra")}
          </div>

          {/* Cost summary */}
          {cost > 0 && (
            <div style={{
              background: "#f9f6f0", borderRadius: 10, padding: "10px 14px",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: 18, border: "1px solid #e8e0d4",
            }}>
              <span style={{ fontSize: 13, color: "#6b6560" }}>Custo total de produção</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#0f1f3d", fontFamily: "'DM Mono', monospace" }}>
                {fmt(cost)}
              </span>
            </div>
          )}

          {/* Suggested price */}
          {suggested && (
            <div style={{
              background: "#eef5fb", borderRadius: 10, padding: "10px 14px",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: 14, border: "1px solid #bfdbf7", cursor: "pointer",
            }}
              onClick={() => onChange("price", suggested.toFixed(2))}
            >
              <div>
                <p style={{ fontSize: 11, color: "#1a3a6e", fontWeight: 600, margin: 0 }}>PREÇO SUGERIDO</p>
                <p style={{ fontSize: 11, color: "#4a7ab5", margin: "2px 0 0", fontStyle: "italic" }}>
                  Clique pra aplicar
                </p>
              </div>
              <span style={{ fontSize: 18, fontWeight: 700, color: "#1a3a6e", fontFamily: "'DM Mono', monospace" }}>
                {fmt(suggested)}
              </span>
            </div>
          )}

          {/* Price input */}
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 11, color: "#8b7f72", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
              Preço de venda na Shopee
            </p>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <span style={{
                  position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                  fontSize: 13, color: "#b0aa9f", pointerEvents: "none", fontWeight: 600,
                }}>R$</span>
                <input
                  type="number" step="0.01" min="0" placeholder="0,00"
                  value={product.price}
                  onChange={e => onChange("price", e.target.value)}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    background: "#fff", border: "2px solid #0f1f3d",
                    borderRadius: 10, padding: "10px 12px 10px 32px",
                    fontSize: 16, fontWeight: 700, color: "#0f1f3d",
                    outline: "none", fontFamily: "'DM Mono', monospace",
                  }}
                />
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6b6560", cursor: "pointer", whiteSpace: "nowrap" }}>
                <input
                  type="checkbox"
                  checked={product.usePix}
                  onChange={e => onChange("usePix", e.target.checked)}
                  style={{ width: 14, height: 14 }}
                />
                Desconto PIX (5%)
              </label>
            </div>
          </div>

          {/* Results */}
          {metrics && price > 0 && cost > 0 && (
            <div style={{
              background: "#0f1f3d", borderRadius: 12, padding: 16,
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1,
              overflow: "hidden",
            }}>
              {[
                ["Faixa de comissão", `${fmtPct(metrics.pct * 100)} + ${fmt(metrics.fixed)}`],
                ["Desconto PIX", fmt(metrics.pixDiscount)],
                ["Comissão Shopee", fmt(metrics.commission)],
                ["Total taxas Shopee", fmt(metrics.shopeeTotal)],
                ["Custo de produção", fmt(cost)],
                ["Recebe líquido", fmt(metrics.netPrice)],
              ].map(([label, value], i) => (
                <div key={i} style={{
                  padding: "10px 14px",
                  background: i % 2 === 0 ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.06)",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <span style={{ fontSize: 11, color: "#a8c0e8" }}>{label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#f2eee8", fontFamily: "'DM Mono', monospace" }}>{value}</span>
                </div>
              ))}

              {/* Big profit row */}
              <div style={{
                gridColumn: "1 / -1",
                background: marginColor(metrics.margin),
                padding: "14px 18px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                marginTop: 2,
              }}>
                <div>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", margin: 0, fontWeight: 600 }}>
                    LUCRO ESTIMADO · {marginLabel(metrics.margin).toUpperCase()}
                  </p>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", margin: "2px 0 0" }}>
                    Margem sobre preço de venda
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: 0, fontFamily: "'DM Mono', monospace" }}>
                    {fmt(metrics.profit)}
                  </p>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.9)", margin: "2px 0 0", fontFamily: "'DM Mono', monospace" }}>
                    {fmtPct(metrics.margin)}
                  </p>
                </div>
              </div>

              {/* Preço mínimo */}
              {cost > 0 && (() => {
                const minPrice = (cost + metrics.fixed) / (1 - metrics.pct);
                return (
                  <div style={{
                    gridColumn: "1 / -1",
                    padding: "10px 18px",
                    background: "rgba(255,255,255,0.04)",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <span style={{ fontSize: 11, color: "#a8c0e8" }}>
                      Preço mínimo pra não ter prejuízo
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#ef4444", fontFamily: "'DM Mono', monospace" }}>
                      {fmt(minPrice)}
                    </span>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [products, setProducts] = useState([
    { ...emptyProduct(), name: "Foguete Artemis COM base", filamentCost: "41", price: "119.99", usePix: true },
    { ...emptyProduct(), id: Date.now() + 1, name: "Foguete Artemis SEM base", filamentCost: "13", price: "69.99", usePix: true },
  ]);

  const addProduct = () => setProducts(p => [...p, emptyProduct()]);

  const updateProduct = (id, field, value) => {
    setProducts(p => p.map(prod => prod.id === id ? { ...prod, [field]: value } : prod));
  };

  const removeProduct = (id) => {
    setProducts(p => p.filter(prod => prod.id !== id));
  };

  // Summary stats
  const summaryItems = products.map(product => {
    const cost =
      (parseFloat(product.filamentCost) || 0) +
      (parseFloat(product.energyCost) || 0) +
      (parseFloat(product.packagingCost) || 0) +
      (parseFloat(product.printHours) || 0) * (parseFloat(product.hourlyRate) || 0) +
      (parseFloat(product.extraCost) || 0);
    const price = parseFloat(product.price) || 0;
    if (!cost || !price) return null;
    const m = calcMetrics(cost, price, product.usePix);
    return { name: product.name || "Sem nome", profit: m.profit, margin: m.margin };
  }).filter(Boolean);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f5f2ec",
      fontFamily: "'DM Sans', sans-serif",
      padding: "0 0 40px",
    }}>
      {/* Header */}
      <div style={{
        background: "#0f1f3d",
        padding: "20px 24px 16px",
        borderBottom: "3px solid #d94070",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 2 }}>
          <span style={{ fontSize: 24 }}>🎁</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: "#f2eee8", letterSpacing: "-0.03em" }}>
            mimo<span style={{ color: "#ff8fab" }}>3D</span>
          </span>
          <span style={{ fontSize: 12, color: "#a8c0e8", letterSpacing: "0.12em", textTransform: "uppercase", marginLeft: 4 }}>
            Precificação
          </span>
        </div>
        <p style={{ fontSize: 12, color: "#6080a0", margin: 0 }}>
          Calculadora de preço com taxas Shopee (CPF) · Desconto PIX · Margem e lucro
        </p>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 16px 0" }}>

        {/* Summary panel */}
        {summaryItems.length > 0 && (
          <div style={{
            background: "#fff",
            borderRadius: 14, border: "1px solid #e8e0d4",
            padding: "14px 18px", marginBottom: 20,
            boxShadow: "0 2px 8px rgba(15,31,61,0.05)",
          }}>
            <p style={{ fontSize: 11, color: "#b0aa9f", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" }}>
              Resumo dos produtos
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {summaryItems.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 12, color: "#4a4540", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.name}
                  </span>
                  <div style={{ height: 6, width: 80, background: "#f0ece6", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 99,
                      background: marginColor(item.margin),
                      width: `${Math.min(100, Math.max(0, item.margin))}%`,
                      transition: "width 0.4s ease",
                    }} />
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: marginColor(item.margin),
                    fontFamily: "'DM Mono', monospace", minWidth: 45, textAlign: "right",
                  }}>
                    {fmtPct(item.margin)}
                  </span>
                  <span style={{
                    fontSize: 11, color: "#8b8580",
                    fontFamily: "'DM Mono', monospace", minWidth: 60, textAlign: "right",
                  }}>
                    {fmt(item.profit)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Products */}
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onChange={(field, value) => updateProduct(product.id, field, value)}
            onRemove={() => removeProduct(product.id)}
          />
        ))}

        {/* Add product button */}
        <button
          onClick={addProduct}
          style={{
            width: "100%", padding: "14px",
            background: "transparent",
            border: "2px dashed #d94070",
            borderRadius: 14, cursor: "pointer",
            fontSize: 14, fontWeight: 600, color: "#d94070",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "all 0.15s",
            fontFamily: "'DM Sans', sans-serif",
          }}
          onMouseEnter={e => { e.target.style.background = "#fdeef3"; }}
          onMouseLeave={e => { e.target.style.background = "transparent"; }}
        >
          + Adicionar produto
        </button>

        {/* Legend */}
        <div style={{
          marginTop: 20, padding: "12px 16px",
          background: "#fff", borderRadius: 12, border: "1px solid #e8e0d4",
          display: "flex", gap: 16, flexWrap: "wrap",
        }}>
          {[
            ["#22c55e", "Ótima (≥40%)"],
            ["#f59e0b", "Boa (25–39%)"],
            ["#ef4444", "Baixa (10–24%)"],
            ["#dc2626", "Inviável (<10%)"],
          ].map(([color, label]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
              <span style={{ fontSize: 11, color: "#6b6560" }}>{label}</span>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 11, color: "#c0bab4", textAlign: "center", marginTop: 16 }}>
          mimo3D · cada peça, um mimo 🩷
        </p>
      </div>
    </div>
  );
}
