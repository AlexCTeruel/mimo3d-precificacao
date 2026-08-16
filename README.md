# 🎀 Mimo3D — Precificação

Calculadora de precificação para impressão 3D. Do arquivo ao anúncio publicado: guarda de onde
veio o modelo, onde ele está à venda e mostra o preço que realmente deixa lucro depois das taxas
do marketplace.

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
  embalagem e extras.
- **Venda** — canal com a tabela de taxas, frete por sua conta, preço da concorrência e o preço
  final.

**O que ela devolve**

- Custo de produção por peça, item por item.
- Preço sugerido pra bater sua margem alvo, já considerando a faixa de comissão do canal.
- Preço mínimo pra não ter prejuízo.
- Lucro, margem e markup reais do preço que você praticou.
- Painel com margem por produto, alertas (prejuízo, abaixo do alvo, licença pendente, anúncio sem
  link) e exportação em planilha.

## Canais de venda

Vêm configurados Shopee (CPF, por faixa de preço), Mercado Livre, Elo7, site próprio com cartão e
venda direta no PIX. Todas as taxas são editáveis em **Ajustes** — marketplace muda comissão sem
avisar, então confira na sua conta de vendedor e ajuste ali que o catálogo inteiro recalcula.

## Seus dados

Ficam salvos apenas no `localStorage` do navegador. Nada é enviado pra servidor nenhum. Use
**Exportar backup** em Ajustes pra levar o catálogo pra outro aparelho.

## Rodar localmente

```bash
npm install
npm start     # http://localhost:3000
npm run build # build de produção
```

O deploy pro GitHub Pages roda sozinho pelo workflow em `.github/workflows/main.yml` a cada push
na `main`.

---

mimo**3D** · cada peça, um mimo 🩷
