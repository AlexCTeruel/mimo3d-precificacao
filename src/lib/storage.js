import { useEffect, useState } from "react";
import {
  SETTINGS_PADRAO, CANAIS_PADRAO, dadosIniciais, novoProduto,
} from "./defaults";

const CHAVE = "calibra.v1";
const CHAVES_ANTIGAS = ["mimo3d.v2", "mimo3d_products"];

// ─── Migração de versões anteriores ────────────────────────────────────────────
function migrarAntigo() {
  try {
    const bruto = CHAVES_ANTIGAS.map((c) => localStorage.getItem(c)).find(Boolean);
    if (!bruto) return null;
    const salvo = JSON.parse(bruto);

    // formato v2: o objeto inteiro, só muda a chave onde ele mora
    if (salvo && !Array.isArray(salvo) && salvo.produtos) {
      return {
        settings: { ...SETTINGS_PADRAO, ...(salvo.settings || {}) },
        canais: salvo.canais?.length ? salvo.canais : CANAIS_PADRAO,
        impressoras: salvo.impressoras || [],
        filamentos: salvo.filamentos || [],
        produtos: salvo.produtos || [],
      };
    }

    // formato v1: só uma lista de produtos com campos de custo soltos
    const antigos = salvo;
    if (!Array.isArray(antigos) || !antigos.length) return null;

    const base = dadosIniciais();
    return {
      ...base,
      produtos: antigos.map((p) => ({
        ...novoProduto(),
        nome: p.name || "Produto importado",
        embalagem: p.packagingCost || "",
        extraCusto:
          (parseFloat(p.filamentCost) || 0) +
          (parseFloat(p.energyCost) || 0) +
          (parseFloat(p.extraCost) || 0) || "",
        extraDesc: "Custos da versão anterior",
        tempoH: p.printHours || "",
        preco: p.price || "",
        canalId: "shopee-cpf",
        observacoes:
          "Importado da calculadora antiga — vale reconferir peso, tempo e filamento.",
      })),
    };
  } catch {
    return null;
  }
}

function carregar() {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (bruto) {
      const dados = JSON.parse(bruto);
      return {
        settings: { ...SETTINGS_PADRAO, ...(dados.settings || {}) },
        canais: dados.canais?.length ? dados.canais : CANAIS_PADRAO,
        impressoras: dados.impressoras || [],
        filamentos: dados.filamentos || [],
        produtos: dados.produtos || [],
      };
    }
    const migrado = migrarAntigo();
    if (migrado) return migrado;
  } catch {
    /* storage indisponível ou corrompido: começa do zero */
  }
  return dadosIniciais();
}

export function useBanco() {
  const [dados, setDados] = useState(carregar);

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(dados));
    } catch {
      /* modo anônimo / storage cheio: segue sem persistir */
    }
  }, [dados]);

  const atualizar = (chave, valor) =>
    setDados((d) => ({ ...d, [chave]: typeof valor === "function" ? valor(d[chave]) : valor }));

  return { dados, setDados, atualizar };
}

// ─── Backup ────────────────────────────────────────────────────────────────────
export function exportarJson(dados) {
  const conteudo = JSON.stringify({ ...dados, _versao: 2, _exportadoEm: new Date().toISOString() }, null, 2);
  const blob = new Blob([conteudo], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `calibra-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importarJson(arquivo) {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => {
      try {
        const dados = JSON.parse(leitor.result);
        if (!dados || typeof dados !== "object") throw new Error("formato");
        resolve({
          settings: { ...SETTINGS_PADRAO, ...(dados.settings || {}) },
          canais: dados.canais?.length ? dados.canais : CANAIS_PADRAO,
          impressoras: dados.impressoras || [],
          filamentos: dados.filamentos || [],
          produtos: dados.produtos || [],
        });
      } catch {
        reject(new Error("Arquivo inválido — use um backup exportado por essa calculadora."));
      }
    };
    leitor.onerror = () => reject(new Error("Não consegui ler o arquivo."));
    leitor.readAsText(arquivo);
  });
}

// ─── Planilha ──────────────────────────────────────────────────────────────────
export function exportarCsv(linhas) {
  const cabecalho = [
    "Produto", "Status", "Origem do modelo", "Licença", "Link do modelo",
    "Link do anúncio", "SKU", "Canal", "Custo", "Preço", "Sugerido",
    "Lucro", "Margem %",
  ];
  const escapar = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const corpo = linhas.map((l) => l.map(escapar).join(";"));
  const csv = "﻿" + [cabecalho.map(escapar).join(";"), ...corpo].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `calibra-produtos-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
