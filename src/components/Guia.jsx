import { Aviso } from "./ui";
import { brl } from "../lib/format";

const PERGUNTAS = [
  {
    p: "Por onde eu começo?",
    r: "Cadastre a impressora e o filamento, confirme o preço do kWh e o valor da sua hora em Ajustes. Depois é só criar o produto e jogar o peso e o tempo que o fatiador mostrou.",
  },
  {
    p: "De onde sai o custo da peça?",
    r: "Filamento (peso × preço por grama) + energia (tempo × watts × kWh) + depreciação e manutenção da máquina + sua mão de obra no pós-processo + embalagem e extras + o modelo 3D rateado. No fim entra a reserva de falha, porque impressão que dá errado também custou material e tempo.",
  },
  {
    p: "Por que guardar o link do modelo e o do meu anúncio?",
    r: "Porque três meses depois ninguém lembra de onde veio aquele STL nem qual era o anúncio certo. Com os dois links salvos você reabre o arquivo pra reimprimir, confere o preço publicado e checa a licença sem caçar em pasta nenhuma.",
  },
  {
    p: "O que é a licença do modelo?",
    r: "É a permissão que o autor deu. Muito modelo gratuito é só pra uso pessoal — vender uma cópia dele pode dar problema. Marque a licença de cada produto e o painel avisa se algo publicado ainda está pendente de conferência.",
  },
  {
    p: "Imprimi 6 peças na mesma placa. Como lanço?",
    r: "Coloque o peso e o tempo da placa inteira e escreva 6 em “peças nessa impressão”. A calculadora divide tudo e mostra o custo de uma unidade.",
  },
  {
    p: "Qual margem é boa?",
    r: "Acima de 40% é confortável, entre 25% e 40% dá pra viver, abaixo de 25% qualquer imprevisto come o lucro. Lembre que margem é sobre o preço de venda, não sobre o custo.",
  },
  {
    p: "Margem e markup são a mesma coisa?",
    r: "Não. Markup é quantas vezes o custo você cobra (custo 20 e preço 60 = markup 3×). Margem é quanto sobra do preço depois de tudo (nesse caso, perto de 40% já com as taxas). Os dois aparecem no resultado.",
  },
  {
    p: "As taxas do marketplace estão certas?",
    r: "Elas vêm da tabela que está em Ajustes e podem mudar a qualquer momento. Confira na sua conta de vendedor e edite lá — o catálogo inteiro recalcula na hora.",
  },
  {
    p: "Meus dados estão salvos onde?",
    r: "Só no navegador deste aparelho. Nada sai daqui, nada vai pra servidor nenhum. Por isso vale exportar o backup em Ajustes de vez em quando.",
  },
];

export default function Guia({ base }) {
  return (
    <>
      <h2 className="secao-titulo">Dicas e dúvidas</h2>
      <p className="secao-desc">
        O básico pra sua precificação parar de ser chute e virar conta.
      </p>

      <div className="cartao">
        <div className="cartao-corpo">
          <p className="rotulo-bloco">A conta, em uma linha</p>
          <div
            style={{
              background: "var(--navy)", color: "#dbe6f7", borderRadius: "var(--raio-p)",
              padding: "14px 16px", fontFamily: "var(--mono)", fontSize: 12.5, lineHeight: 1.9,
            }}
          >
            custo = filamento + energia + depreciação + manutenção + mão de obra + embalagem + extras + modelo
            <br />
            custo final = custo × (1 + reserva de falha)
            <br />
            <span style={{ color: "var(--rosa-claro)" }}>
              lucro = preço − taxa do canal − imposto − frete − custo final
            </span>
          </div>
          <p className="campo-dica" style={{ marginTop: 12 }}>
            Hoje seus ajustes estão em {brl(base.settings.energiaKwh)}/kWh,{" "}
            {brl(base.settings.maoDeObraHora)} a sua hora, {base.settings.taxaFalha}% de reserva de
            falha e margem alvo de {base.settings.margemAlvo}%.
          </p>
        </div>
      </div>

      <div className="cartao">
        <div className="cartao-corpo" style={{ paddingBottom: 8 }}>
          <p className="rotulo-bloco">Perguntas frequentes</p>
        </div>
        {PERGUNTAS.map((item) => (
          <details className="dobra" key={item.p}>
            <summary>{item.p}</summary>
            <div className="dobra-corpo">
              <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.65, color: "var(--tinta-2)" }}>
                {item.r}
              </p>
            </div>
          </details>
        ))}
      </div>

      <div className="cartao">
        <div className="cartao-corpo">
          <p className="rotulo-bloco">Três hábitos que salvam a margem</p>
          <div style={{ display: "grid", gap: 10 }}>
            <Aviso tom="marca" icone="🩷">
              <b>Preço não é custo × 3 no chute.</b> Marketplace cobra percentual <i>e</i> taxa fixa —
              em produto barato a taxa fixa come tudo. Use o preço sugerido como piso de conversa.
            </Aviso>
            <Aviso tom="marca" icone="🩷">
              <b>Sua hora entra na conta.</b> Lixar, pintar, montar e embalar é trabalho. Se você
              não cobrar por isso, está pagando pra vender.
            </Aviso>
            <Aviso tom="marca" icone="🩷">
              <b>Revise quando o filamento subir.</b> Mudou o preço do rolo em Filamentos, todos os
              produtos daquele material recalculam — dá pra ver na hora quem ficou abaixo do alvo.
            </Aviso>
          </div>
        </div>
      </div>
    </>
  );
}
