import { describe, expect, it } from "vitest";

import { createNode, insert, search, inOrder, preOrder, postOrder, toD3Format, getHeight } from "./bst";

// ─── Helper: construye un árbol a partir de un array de valores ───────────────
const buildTree = (values) => values.reduce((root, v) => insert(root, v), null);

// ─── insert ───────────────────────────────────────────────────────────────────

describe("insert", () => {
  it("coloca valores menores a la izquierda", () => {
    const root = buildTree([10, 5]);
    expect(root.left?.value).toBe(5);
  });

  it("coloca valores mayores a la derecha", () => {
    const root = buildTree([10, 5, 15]);
    expect(root.left?.value).toBe(5);
    expect(root.right?.value).toBe(15);
  });

  it("ignora duplicados (no inserta el mismo valor dos veces)", () => {
    const root = buildTree([10, 10, 10]);
    // El árbol solo debe tener el nodo raíz, sin hijos
    expect(root.left).toBeNull();
    expect(root.right).toBeNull();
  });

  it("construye correctamente un árbol en un solo lado (degenerado derecho)", () => {
    const root = buildTree([10, 15, 20]);
    expect(root.right?.value).toBe(15);
    expect(root.right?.right?.value).toBe(20);
    expect(root.left).toBeNull();
  });
});

// ─── search ───────────────────────────────────────────────────────────────────

describe("search", () => {
  it("retorna null en un árbol vacío", () => {
    expect(search(null, 5)).toBeNull();
  });

  it("retorna null para valores no existentes (igualdad estricta — string vs number)", () => {
    const root = buildTree([10, 5, 15]);
    // "5" (string) NO debe encontrar el nodo con valor 5 (number)
    expect(search(root, "5")).toBeNull();
  });

  it("encuentra un valor existente en la raíz", () => {
    const root = buildTree([10, 5, 15]);
    expect(search(root, 10)?.value).toBe(10);
  });

  it("encuentra un valor en una hoja derecha", () => {
    const root = buildTree([10, 5, 15]);
    expect(search(root, 15)?.value).toBe(15);
  });

  it("encuentra un valor en una hoja izquierda", () => {
    const root = buildTree([10, 5, 15]);
    expect(search(root, 5)?.value).toBe(5);
  });
});

// ─── traversals ───────────────────────────────────────────────────────────────

describe("inOrder", () => {
  it("retorna array vacío para árbol vacío", () => {
    expect(inOrder(null)).toEqual([]);
  });

  it("produce valores en orden ascendente", () => {
    const root = buildTree([10, 5, 15, 3, 7, 12, 20]);
    expect(inOrder(root)).toEqual([3, 5, 7, 10, 12, 15, 20]);
  });

  it("funciona con árbol de un solo nodo", () => {
    const root = buildTree([42]);
    expect(inOrder(root)).toEqual([42]);
  });
});

describe("preOrder", () => {
  it("retorna array vacío para árbol vacío", () => {
    expect(preOrder(null)).toEqual([]);
  });

  it("visita la raíz antes que los subárboles", () => {
    const root = buildTree([10, 5, 15]);
    expect(preOrder(root)).toEqual([10, 5, 15]);
  });
});

describe("postOrder", () => {
  it("retorna array vacío para árbol vacío", () => {
    expect(postOrder(null)).toEqual([]);
  });

  it("visita la raíz al final", () => {
    const root = buildTree([10, 5, 15]);
    expect(postOrder(root)).toEqual([5, 15, 10]);
  });
});

// ─── getHeight ────────────────────────────────────────────────────────────────

describe("getHeight", () => {
  it("retorna 0 para árbol vacío", () => {
    expect(getHeight(null)).toBe(0);
  });

  it("retorna 1 para árbol de un solo nodo", () => {
    expect(getHeight(buildTree([10]))).toBe(1);
  });

  it("calcula la altura correcta en árbol balanceado", () => {
    // árbol de altura 3: raíz(10) → 5/15 → 3/7/12/20
    expect(getHeight(buildTree([10, 5, 15, 3, 7, 12, 20]))).toBe(3);
  });

  it("calcula la altura en árbol degenerado (todos a la derecha)", () => {
    // 10 → 15 → 20 → altura 3
    expect(getHeight(buildTree([10, 15, 20]))).toBe(3);
  });
});

// ─── toD3Format ───────────────────────────────────────────────────────────────

describe("toD3Format", () => {
  it("retorna null para árbol vacío", () => {
    expect(toD3Format(null)).toBeNull();
  });

  it("nodo hoja no tiene hijos en el array children", () => {
    const root = buildTree([10]);
    const d3 = toD3Format(root);
    expect(d3.name).toBe("10");
    expect(d3.children).toHaveLength(0);
  });

  it("nodo con solo hijo derecho NO genera placeholders", () => {
    // BUG #4 REGRESIÓN: antes se insertaba un placeholder a la izquierda
    const root = buildTree([10, 15, 20]);
    const d3 = toD3Format(root);
    // La raíz (10) solo debe tener 1 hijo (el 15), no 2
    expect(d3.children).toHaveLength(1);
    expect(d3.children[0].name).toBe("15");
    // Ningún nodo debe tener la propiedad __placeholder
    expect(d3.children[0].__placeholder).toBeUndefined();
  });

  it("nodo con dos hijos genera exactamente 2 entradas en children", () => {
    const root = buildTree([10, 5, 15]);
    const d3 = toD3Format(root);
    expect(d3.children).toHaveLength(2);
    expect(d3.children[0].name).toBe("5");
    expect(d3.children[1].name).toBe("15");
  });
});