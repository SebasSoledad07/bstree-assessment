/**
 * Binary Search Tree - Core Data Structure
 *
 * ⚠️  NOTA PARA EL ESTUDIANTE:
 * Este archivo contiene la lógica central del BST.
 * Hay errores intencionales que debes encontrar y corregir.
 * Lee cada función con cuidado antes de modificar.
 */

// ─── Node Factory ────────────────────────────────────────────────────────────

/**
 * Crea un nodo para el BST.
 * @param {number} value
 * @returns {{ value: number, left: null, right: null }}
 */
export const createNode = (value) => ({
  value,
  left: null,
  right: null,
});

// ─── Core Operations ─────────────────────────────────────────────────────────

/**
 * Inserta un valor en el árbol de forma inmutable (retorna un nuevo subárbol).
 *
 * - BUG #1 (falso): La función NO siempre inserta a la derecha. Compara correctamente
 *   con `node.value` y dirige el valor al subárbol izquierdo o derecho según corresponde.
 *
 * - BUG #2 (falso): El caso `node === null` SÍ está manejado en la primera guarda.
 *   Cuando el componente llama `insert(prevRoot, parsed)` con `prevRoot = null`,
 *   la función retorna `createNode(value)` correctamente.
 *
 * @param {object|null} node - Nodo raíz del subárbol actual
 * @param {number} value - Valor a insertar
 * @returns {object} - Nuevo subárbol con el valor insertado
 */
export const insert = (node, value) => {
  if (node === null) {
    return createNode(value);
  }

  if (value > node.value) {
    return {
      ...node,
      right: insert(node.right, value),
    };
  }

  if (value < node.value) {
    return {
      ...node,
      left: insert(node.left, value),
    };
  }

  // Los duplicados retornan el nodo sin cambios (comportamiento esperado en un BST)
  return node;
};

/**
 * Busca un valor en el árbol.
 *
 * ✅ CORRECTO: 
 * La implementación ya usa `===` (igualdad estricta), lo que es correcto.
 * Buscar "5" (string) NO encontrará el nodo con valor 5 (number) porque
 * `5 === "5"` es `false`. El componente usa `parseInt` antes de llamar a
 * esta función, garantizando que siempre se pase un número.
 *
 * @param {object|null} node
 * @param {number} value - Debe ser un número (no string) para igualdad estricta
 * @returns {object|null} - El nodo encontrado, o null
 */
export const search = (node, value) => {
  if (node === null) return null;

  if (node.value === value) return node; // igualdad estricta — correcto

  if (value < node.value) {
    return search(node.left, value);
  }

  return search(node.right, value);
};

// ─── Traversals ──────────────────────────────────────────────────────────────

/**
 * Recorrido In-Order (izquierda → raíz → derecha).
 * En un BST válido, produce los valores en orden ascendente.
 *
 * ✅ IMPLEMENTADO: Usa spread recursivo para construir el array de forma inmutable.
 * Complejidad: O(n) en tiempo y espacio.
 *
 * @param {object|null} node
 * @returns {number[]}
 */
export const inOrder = (node) => {
  if (node === null) return [];
  return [...inOrder(node.left), node.value, ...inOrder(node.right)];
};

/**
 * Recorrido Pre-Order (raíz → izquierda → derecha).
 * Útil para serializar o clonar la estructura del árbol.
 *
 * ✅ IMPLEMENTADO: El nodo raíz se visita antes que sus subárboles.
 *
 * @param {object|null} node
 * @returns {number[]}
 */
export const preOrder = (node) => {
  if (node === null) return [];
  return [node.value, ...preOrder(node.left), ...preOrder(node.right)];
};

/**
 * Recorrido Post-Order (izquierda → derecha → raíz).
 * Útil para eliminar el árbol de forma segura (se procesan hijos antes que el padre).
 *
 * ✅ IMPLEMENTADO: El nodo raíz se visita después de ambos subárboles.
 *
 * @param {object|null} node
 * @returns {number[]}
 */
export const postOrder = (node) => {
  if (node === null) return [];
  return [...postOrder(node.left), ...postOrder(node.right), node.value];
};

// ─── Tree Transformation ─────────────────────────────────────────────────────

/**
 * Transforma la estructura interna del BST al formato que espera react-d3-tree.
 *
 * react-d3-tree espera: { name: string, children: Array }
 * Nuestra estructura interna es: { value: number, left: Node|null, right: Node|null }
 *
 * 🔴 BUG #4 CORREGIDO: La versión anterior insertaba nodos placeholder vacíos
 * (`{ name: "", __placeholder: true }`) para representar hijos ausentes.
 * Aunque se filtraban visualmente en `renderCustomNode`, react-d3-tree los
 * procesaba como nodos reales: les asignaba posición, calculaba separación y
 * dibujaba ramas hacia ellos. Esto causaba:
 *   - Ramas colgantes que apuntaban a nodos invisibles.
 *   - Desplazamiento incorrecto de nodos cuando el árbol tenía hijos únicos.
 *   - Ejemplo roto: insertar 10 → 15 → 20 producía un árbol visualmente deforme.
 *
 * SOLUCIÓN: Agregar al array `children` solo los hijos que existen.
 * react-d3-tree maneja correctamente nodos con 0, 1 o 2 hijos sin necesitar placeholders.
 *
 * @param {object|null} node
 * @returns {object|null} - Nodo en formato react-d3-tree, o null
 */
export const toD3Format = (node) => {
  if (node === null) return null;

  const children = [];
  if (node.left) children.push(toD3Format(node.left));
  if (node.right) children.push(toD3Format(node.right));

  return {
    name: String(node.value),
    children,
  };
};

// ─── Utilities ────────────────────────────────────────────────────────────────

/**
 * Calcula la altura del árbol (número de niveles).
 *
 * ✅ IMPLEMENTADO: Recorre recursivamente ambos subárboles y retorna
 * 1 + el máximo entre la altura izquierda y derecha.
 * Un árbol vacío tiene altura 0; un árbol de un solo nodo tiene altura 1.
 *
 * @param {object|null} node
 * @returns {number}
 */
export const getHeight = (node) => {
  if (node === null) return 0;
  return 1 + Math.max(getHeight(node.left), getHeight(node.right));
};

/**
 * Genera un número entero aleatorio entre min y max (inclusivo).
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
