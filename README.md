# Calibra

**O preço certo da sua peça.** Calculadora de precificação para impressão 3D: descobre o custo
real de cada peça, aplica as taxas do marketplace e mostra quanto sobra de verdade — além de
guardar de onde veio o modelo e onde ele está publicado.

Roda inteiro no navegador. Sem cadastro, sem servidor, sem enviar dado nenhum pra lugar nenhum.

## O que ela faz

**Cadastros que alimentam a conta**

- **Impressoras** — com valor da máquina, vida útil, manutenção e potência, ela calcula sozinha
  quanto custa cada hora ligada (depreciação + manutenção + energia).
- **Filamentos** — preço do rolo e peso viram custo por grama.
- **Ajustes** — preço do kWh, valor da sua hora, custo fixo rateado, reserva de falha, margem
  alvo, imposto e arredondamento do preço sugerido.

**Cada produto guarda**

- **De onde veio o modelo** — link do STL, origem (Cults3D, Printables, autoral…), autor, licença
  e quanto custou o arquivo, rateado pelo número de peças que você pretende vender.
- **Onde ele está publicado** — link do seu anúncio, link das fotos/artes, SKU, status e tags.
- **Produção** — impressora, filamento, peso e tempo do fatiador, peças por placa, pós-processo,
  embalagem e extras. Peça de várias cores entra no **modo multifilamento**: uma linha de peso por
  cor, cada uma com o próprio preço por quilo.
- **Venda** — **um ou vários canais ao mesmo tempo**, frete por sua conta, preço da concorrência e
  o preço final. Com mais de um canal marcado, sai um comparativo com preço sugerido, taxa, lucro
  e margem em cada marketplace.

**O que ela devolve**

- Custo de produção por peça, item por item.
- Preço sugerido pra bater sua margem alvo, respeitando a faixa de comissão em que o preço cai.
- Preço mínimo pra não ter prejuízo.
- Lucro, margem e markup reais do preço praticado.
- Painel com margem por produto, alertas (prejuízo, abaixo do alvo, licença pendente, anúncio sem
  link) e exportação em planilha.

O catálogo tem três visualizações — **cartões** (editar), **lista** (comparar margem de tudo de uma
vez) e **ícones** (a vitrine visual). Clicar num item da lista ou da grade abre o cartão dele.

## Canais de venda

Vêm configurados Shopee (CPF, por faixa de preço), Mercado Livre, Elo7, site próprio com cartão e
venda direta no PIX. Todas as taxas são editáveis em **Ajustes** — marketplace muda comissão sem
avisar, então confira na sua conta de vendedor e ajuste ali que o catálogo inteiro recalcula.

## Personalizar

Tudo que é marca e dinheiro mora em **`src/lib/marca.js`**:

```js
export const MARCA = {
  nome: "Calibra",
  tagline: "O preço certo da sua peça",
  // ...
};
```

### Botão de apoio

O botão do coração (no trilho lateral e no cabeçalho) abre um painel com valores de apoio via
Mercado Pago. Pra ativar:

1. No Mercado Pago, vá em **Seu negócio → Link de pagamento** e crie um link para cada valor.
2. Cole cada URL curta (`mpago.la/...`) no campo `url` correspondente em `APOIO.valores`.
3. Opcionalmente preencha `urlValorLivre` (o apoiador escolhe quanto) e `contato`.

Enquanto nenhum link estiver preenchido, os valores aparecem apagados e o painel avisa que falta
configurar. Pra remover o botão do site inteiro, é só deixar `APOIO.ativo: false`.

## Seus dados

Ficam salvos apenas no `localStorage` do navegador. Use **Exportar backup** em Ajustes pra levar o
catálogo pra outro aparelho. A calculadora importa automaticamente dados de versões anteriores na
primeira abertura.

## Rodar localmente

```bash
npm install
npm start     # http://localhost:3000
npm run build # build de produção
```

O deploy pro GitHub Pages roda sozinho pelo workflow em `.github/workflows/main.yml` a cada push
na `main`. Se você mudar o repositório de lugar, ajuste o campo `homepage` do `package.json` —
é ele que define o caminho dos arquivos no build.
