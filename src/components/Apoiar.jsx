import { useEffect } from "react";
import Icone from "./Icone";
import { Aviso } from "./ui";
import { APOIO, apoioConfigurado } from "../lib/marca";
import { href } from "../lib/format";

export default function Apoiar({ aoFechar }) {
  // Esc fecha o painel, como qualquer diálogo.
  useEffect(() => {
    const aoTeclar = (e) => e.key === "Escape" && aoFechar();
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [aoFechar]);

  const livre = href(APOIO.urlValorLivre);

  return (
    <div className="cortina" onClick={aoFechar} role="presentation">
      <div
        className="apoio"
        role="dialog"
        aria-modal="true"
        aria-label={APOIO.titulo}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="apoio-fechar" onClick={aoFechar} aria-label="Fechar">
          <Icone nome="fechar" tamanho={16} />
        </button>

        <div className="apoio-selo"><Icone nome="coracao" tamanho={24} /></div>
        <h2>{APOIO.titulo}</h2>
        <p>{APOIO.texto}</p>

        <div className="apoio-valores">
          {APOIO.valores.map((valor) => {
            const destino = href(valor.url);
            return (
              <a
                key={valor.rotulo}
                className={`apoio-valor${valor.destaque ? " destaque" : ""}`}
                href={destino || undefined}
                aria-disabled={destino ? undefined : "true"}
                target="_blank"
                rel="noopener noreferrer"
              >
                <b>{valor.rotulo}</b>
                <span className="nota">{valor.nota}</span>
                <Icone nome="externo" tamanho={15} />
              </a>
            );
          })}

          {livre && (
            <a className="apoio-valor" href={livre} target="_blank" rel="noopener noreferrer">
              <b>Outro</b>
              <span className="nota">você escolhe o valor</span>
              <Icone nome="externo" tamanho={15} />
            </a>
          )}
        </div>

        {apoioConfigurado() ? (
          <p className="apoio-nota">
            Pagamento pelo Mercado Pago, em aba nova. Aceita PIX, cartão e boleto.
            {APOIO.contato && <> Dúvida ou sugestão: {APOIO.contato}.</>}
          </p>
        ) : (
          <div style={{ marginTop: 18 }}>
            <Aviso tom="atencao">
              Nenhum link de pagamento configurado ainda. Crie os links no Mercado Pago e cole
              cada um em <b>src/lib/marca.js</b> — os valores acima acendem sozinhos.
            </Aviso>
          </div>
        )}
      </div>
    </div>
  );
}
