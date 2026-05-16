/**
 * BSTVisualizer.jsx
 *
 * Componente principal del visualizador de Árbol Binario de Búsqueda.
 *
 * ⚠️  NOTA PARA EL ESTUDIANTE:
 * Este componente tiene problemas de rendimiento y un bug de UX.
 * Usa React DevTools Profiler para encontrarlos.
 */

import { useState, useCallback, useMemo } from "react";
import Tree from "react-d3-tree";

import { insert, search, inOrder, preOrder, postOrder, toD3Format, randomInt, getHeight } from "../utils/bst";
import TraversalPanel from "./TraversalPanel";
import SearchBar from "./SearchBar";

import styles from "./BSTVisualizer.module.css";


// ─── Component ───────────────────────────────────────────────────────────────

export default function BSTVisualizer() {
  const [root, setRoot] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [activeTraversal, setTraversal] = useState(null); // "inOrder" | "preOrder" | "postOrder"
  const [searchTerm, setSearchTerm] = useState("");
  /**
   * 🔴 BUG #6 CORREGIDO: El estado inicial era `null`, que SearchBar interpretó
   * como "búsqueda realizada sin resultado" y mostraba "No encontrado" al cargar.
   * SOLUCIÓN: Usar `undefined` como valor centinela que significa "sin búsqueda aún".
   * SearchBar distingue `undefined` (sin búsqueda) de `null` (buscado, no encontrado).
   */
  const [foundNode, setFoundNode] = useState(undefined);
  const [errorMessage, setErrorMessage] = useState("");
  const [treeHeight, setTreeHeight] = useState(null);

  // ── Insert ──────────────────────────────────────────────────────────────────
  const handleInsert = () => {
    const parsed = parseInt(inputValue, 10);

    if (isNaN(parsed)) {
      setErrorMessage("Por favor ingresa un número válido.");
      return;
    }

    setRoot((prevRoot) => insert(prevRoot, parsed));
    setInputValue("");
    setErrorMessage("");
  };

  // ── Random Insert ───────────────────────────────────────────────────────────
  const handleRandomInsert = () => {
    const value = randomInt(1, 99);
    setRoot((prevRoot) => insert(prevRoot, value));
  };

  // ── Height ──────────────────────────────────────────────────────────────────
  const handleGetHeight = () => {
    setTreeHeight(getHeight(root));
  };

  // ── Search ─────────────────────────────────────────────────────────────────────────
  /**
   * 🔴 BUG #7 CORREGIDO: La versión anterior no validaba si la entrada estaba vacía.
   * `parseInt("")` retorna `NaN`, y `search(root, NaN)` recorría el árbol entero
   * silenciosamente (NaN < x y NaN > x son siempre false) antes de retornar null,
   * mostrando "No encontrado" sin nunca advertir al usuario del error de entrada.
   * SOLUCIÓN: Guardar con early return si la entrada no es un número válido.
   */
  const handleSearch = () => {
    const parsed = parseInt(searchTerm, 10);

    if (isNaN(parsed)) {
      setFoundNode(undefined); // Restablece a "sin búsqueda"
      return;
    }

    const result = search(root, parsed);
    setFoundNode(result ? result.value : null);
  };

  /**
   * Función auxiliar para obtener el resultado de un recorrido dado su nombre.
   *
   * 🟡 PERF NOTA: `useCallback` con dependencias vacías es correcto aquí porque
   * la función no cierra sobre ningún estado (solo usa sus argumentos).
   * Esto garantiza una referencia estable entre renders, necesaria para que
   * `useMemo` no recalcule `traversalResult` innecesariamente.
   */
  const getTraversalResult = useCallback((node, type) => {
    switch (type) {
      case "inOrder": return inOrder(node);
      case "preOrder": return preOrder(node);
      case "postOrder": return postOrder(node);
      default: return [];
    }
  }, []);

  // ── Derived data ────────────────────────────────────────────────────────────
  const d3Data = useMemo(() => root ? toD3Format(root) : null, [root]);

  const traversalResult = useMemo(
    () => activeTraversal ? getTraversalResult(root, activeTraversal) : [],
    [root, activeTraversal, getTraversalResult]
  );

  /**
   * Función de render personalizada para cada nodo del árbol.
   *
   * Resalta visualmente el nodo cuyo valor coincida con `foundNode`
   * (circulo naranja en lugar del azul por defecto).
   *
   * 🟡 PERF: `useCallback` depende de `foundNode` para recalcular solo cuando
   * cambia el nodo encontrado, evitando re-renders innecesarios del árbol completo.
   *
   * 🔴 BUG #4 CORREGIDO (efecto secundario): Se eliminó el guard `__placeholder`
   * porque `toD3Format` ya no genera nodos placeholder.
   */
  const renderCustomNode = useCallback(({ nodeDatum }) => {
    const isFound = foundNode !== null && foundNode !== undefined && nodeDatum.name === String(foundNode);
    return (
      <g>
        <circle
          r={20}
          fill={isFound ? "#f5a623" : "#4A90D9"}
          stroke="#fff"
          strokeWidth={isFound ? 3 : 2}
        />
        <text
          fill="white"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={12}
          fontWeight="bold"
        >
          {nodeDatum.name}
        </text>
      </g>
    );
  }, [foundNode]);
  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>BST Visualizer</h1>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.inputGroup}>
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleInsert()}
            placeholder="Ingresa un número..."
            className={styles.input}
          />
          <button onClick={handleInsert} className={styles.button}>
            Insertar
          </button>
          <button onClick={handleRandomInsert} className={`${styles.button} ${styles.secondary}`}>
            🎲 Aleatorio
          </button>
          <button onClick={handleGetHeight} className={`${styles.button} ${styles.secondary}`}>
            📏 Altura
          </button>
          {treeHeight !== null && (
            <span style={{ color: "#a8d8a8", fontWeight: "bold", alignSelf: "center" }}>
              Altura: {treeHeight}
            </span>
          )}
        </div>

        {errorMessage && (
          <p style={{ color: "#ff6b6b", margin: "4px 0 0" }}>{errorMessage}</p>
        )}

        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          onSearch={handleSearch}
          result={foundNode}
        />
      </div>

      {/* Traversal Selector */}
      <TraversalPanel
        active={activeTraversal}
        onChange={setTraversal}
        result={traversalResult}
      />

      {/* Tree Visualization */}
      <div className={styles.treeContainer}>
        {d3Data ? (
          <Tree
            data={d3Data}
            orientation="vertical"
            renderCustomNodeElement={renderCustomNode}
            separation={{ siblings: 1.5, nonSiblings: 2 }}
            translate={{ x: 400, y: 60 }}
          />
        ) : (
          <div className={styles.emptyState}>
            <p>El árbol está vacío.</p>
            <p>Inserta un número para comenzar.</p>
          </div>
        )}
      </div>
    </div>
  );
}
