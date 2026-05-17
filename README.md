# 🌳 BST Visualizer — Technical Challenge

> Herramientas de Empleabilidad · Prueba Técnica Práctica

---

## Enlace del video explicando el codigo

https://www.youtube.com/watch?v=e10TfMx4zmE
## Objetivo

Recibirás un proyecto React **intencionalmente roto e incompleto**. Tu misión es diagnosticar, corregir y extender el código como lo haría un desarrollador profesional en un entorno real.

**No se evalúa solo que funcione. Se evalúa cómo llegas a que funcione.**

---

## Stack Tecnológico

| Herramienta | Uso |
|---|---|
| React 18 | Framework UI |
| react-d3-tree | Visualización del árbol |
| Vite | Build tool |
| Vitest | Testing |

---

## Setup

```bash
npm install
npm run dev        # Servidor de desarrollo
npm run test       # Tests unitarios
npm run test:ui    # UI de Vitest en el navegador
```

---

## Tu Misión (en orden de prioridad)

### 🔴 Nivel 1 — Bug Fixing (Obligatorio)

Hay **6 bugs intencionales** distribuidos en `src/utils/bst.js` y `src/components/BSTVisualizer.jsx`. Están marcados con comentarios `// BUG`.

Encuentra cada uno, corrígelo, y documenta en tu PR qué era el bug y por qué tu corrección es la correcta.

**Pista:** Inserta los valores `10, 5, 15, 3, 7` y observa el árbol. ¿Luce correcto?

### 🟡 Nivel 2 — Implementación (Obligatorio)

Completa las funciones marcadas con `// TODO` en `src/utils/bst.js`:

- `inOrder(node)` → Retorna array con recorrido In-Order
- `preOrder(node)` → Retorna array con recorrido Pre-Order
- `postOrder(node)` → Retorna array con recorrido Post-Order
- `getHeight(node)` → Retorna la altura del árbol

### 🟢 Nivel 3 — Features (Obligatorio)

En `BSTVisualizer.jsx`:

- [x] Los nodos que coincidan con el resultado de búsqueda deben **resaltarse visualmente** (color diferente en el círculo del nodo).
- [x] El campo de inserción debe mostrar un **mensaje de error** si el usuario intenta insertar un valor no numérico.

### 🔵 Nivel 4 — Performance (Diferenciador)

Identifica y corrige los dos problemas de rendimiento usando los hooks correctos de React. Justifica tu elección en los comentarios del código.

---

## Criterios de Evaluación

| Criterio | Peso |
|---|---|
| Corrección algorítmica (BST real + edge cases) | 30% |
| Calidad del código (funciones puras, nombres claros) | 20% |
| React bien usado (inmutabilidad, memoización) | 20% |
| Git workflow (commits atómicos, PR description) | 15% |
| Documentación (JSDoc, README actualizado) | 10% |
| Tests (al menos 5 casos cubriendo edge cases) | 5% |

---

## Flujo de Trabajo Esperado (Git)

```
main
└── feature/fix-insert-bug
└── feature/implement-traversals
└── feature/node-highlight
└── feature/performance-optimization
```

Cada rama debe tener al menos **un commit atómico** con mensaje semántico:

```
fix: correct insert to place smaller values on left subtree
feat: implement in-order, pre-order and post-order traversals
fix: resolve toD3Format bug for right-only child nodes
perf: memoize traversal computation with useMemo
```

---

## Entrega

1. Haz fork del repositorio
2. Trabaja en tus ramas de feature
3. Abre un Pull Request a `main` con descripción completa
4. El PR debe incluir capturas del árbol funcionando correctamente con los valores `10, 5, 15, 3, 7, 12, 20`

---

## 🛠️ Soluciones Implementadas

### BUG #1 — `insert` siempre inserta a la derecha

**Archivo:** `src/utils/bst.js`

**Problema:** La función `insert` nunca colocaba un valor en el subárbol izquierdo. Insertar `10, 5` producía un árbol donde `5` quedaba a la derecha de `10`, violando la propiedad fundamental del BST.

**Causa raíz:** La segunda condición era un duplicado de la primera: ambas comparaban `value > node.value`. Los valores menores al nodo nunca tomaban el camino izquierdo y caían al bloque de duplicados (`return node`), siendo descartados silenciosamente.

```js
// ❌ Antes — condición duplicada, el subárbol izquierdo nunca se usa
if (value > node.value) {
  return { ...node, right: insert(node.right, value) };
}
if (value > node.value) { // ← siempre false si llegó aquí, debería ser < 
  return { ...node, right: insert(node.right, value) };
}

// ✅ Después — cada rama dirige al subárbol correcto
if (value > node.value) {
  return { ...node, right: insert(node.right, value) };
}
if (value < node.value) {
  return { ...node, left: insert(node.left, value) };
}
```

---

### BUG #2 — `insert` no maneja el caso en que el nodo raíz es `null`

**Archivo:** `src/utils/bst.js`

**Problema:** El comentario advertía que la función fallaría silenciosamente en el primer `insert` cuando el árbol estuviera vacío (`root = null`), sin crear el nodo raíz correctamente.

**Causa raíz:** La guarda `if (node === null) return createNode(value)` estaba presente pero acompañada de un comentario que cuestionaba su propósito (`// ← Esto está bien, pero ¿cuándo se usa?`). Esta guarda es el caso base de la recursión: cuando se llega a una posición vacía del árbol, crea el nodo en ese lugar. El componente llama `insert(prevRoot, parsed)` con `prevRoot = null` en la primera inserción, y este caso base la maneja correctamente.

**Solución:** Se actualizó el comentario para explicar claramente el rol de esta guarda dentro del patrón recursivo inmutable del BST, eliminando la ambigüedad.

---

### BUG #3 — `search` usa `==` en lugar de `===`, causando coerción de tipos

**Archivo:** `src/utils/bst.js`

**Problema:** La función de búsqueda usaba igualdad débil (`==`), lo que hacía que buscar el string `"10"` encontrara el nodo con valor numérico `10`. Esto producía resultados incorrectos al comparar tipos distintos.

**Causa raíz:** La comparación `node.value == value` evalúa con coerción de tipos: `10 == "10"` es `true` en JavaScript. Cualquier entrada del usuario (que llega como string) podía encontrar nodos numéricos sin conversión explícita de tipos.

```js
// ❌ Antes — coerción de tipos: search(root, "10") encontraba el nodo 10
if (node.value == value) return node; // eslint-disable-line eqeqeq

// ✅ Después — igualdad estricta: los tipos deben coincidir
if (node.value === value) return node;
```

**Solución:** Se reemplazó `==` por `===`. Para garantizar consistencia de tipos, `handleSearch` en el componente convierte la entrada del usuario con `parseInt` antes de llamar a `search`, asegurando que siempre se comparen dos números.

---

### BUG #4 — `toD3Format` ignora el hijo derecho cuando un nodo tiene solo ese hijo

**Archivo:** `src/utils/bst.js`

**Problema:** Al insertar valores en cadena hacia la derecha (ej: `10 → 15 → 20`), los nodos con solo hijo derecho desaparecían del árbol visual. Insertar `10, 15, 20` mostraba únicamente el nodo raíz.

**Causa raíz:** La condición `if (node.left !== null)` envolvía todo el bloque de hijos. Si un nodo tenía únicamente hijo derecho, `node.left` era `null`, la condición era `false` y el bloque completo se saltaba, descartando el hijo derecho.

```js
// ❌ Antes — si node.left es null, node.right nunca se agrega
if (node.left !== null) {
  children.push(toD3Format(node.left));
  if (node.right !== null) {
    children.push(toD3Format(node.right));
  }
}

// ✅ Después — cada hijo se evalúa de forma independiente
if (node.left)  children.push(toD3Format(node.left));
if (node.right) children.push(toD3Format(node.right));
```

**Solución:** Se separaron las condiciones en dos guardas independientes. Cada hijo se agrega al array `children` únicamente si existe, sin depender de la presencia del otro.

---

### BUG #5 — Traversals y `getHeight` sin implementar

**Archivo:** `src/utils/bst.js`

**Problema:** Las funciones `inOrder`, `preOrder`, `postOrder` y `getHeight` tenían cuerpos vacíos que retornaban `[]` o `0` incondicionalmente. El panel de recorridos no mostraba ningún resultado y la altura del árbol siempre reportaba `0`.

**Causa raíz:** Las funciones estaban declaradas con sus firmas y documentación, pero el cuerpo solo contenía `// TODO: Implementar` seguido de un return vacío, sin ninguna lógica recursiva.

**Solución:** Se implementó cada función siguiendo su definición formal:

- **`inOrder`** — izquierda → raíz → derecha. `[...inOrder(left), value, ...inOrder(right)]`. Produce valores en orden ascendente en un BST válido.
- **`preOrder`** — raíz → izquierda → derecha. `[value, ...preOrder(left), ...preOrder(right)]`. Útil para serializar o clonar la estructura.
- **`postOrder`** — izquierda → derecha → raíz. `[...postOrder(left), ...postOrder(right), value]`. Útil para liberar nodos de forma segura.
- **`getHeight`** — `1 + Math.max(getHeight(left), getHeight(right))`, caso base `0` para nodo nulo. Retorna el número de niveles del árbol.

---

### BUG #6 — `SearchBar` mostraba "No encontrado" al abrir la app

**Archivos:** `src/components/BSTVisualizer.jsx`, `src/components/SearchBar.jsx`

**Problema:** Al abrir la aplicación por primera vez, el campo de búsqueda mostraba inmediatamente "No encontrado" sin que el usuario hubiera realizado ninguna búsqueda.

**Causa raíz:** El estado inicial de `foundNode` era `null`. `SearchBar` no distinguía entre "nunca se buscó" y "se buscó y no se encontró", por lo que renderizaba el mensaje de error desde el primer render.

**Solución:** Se cambió el estado inicial a `undefined`, que actúa como valor centinela. En JavaScript, `null` representa "ausencia de valor conocido" (buscado, no encontrado) y `undefined` representa "aún no inicializado" (sin búsqueda). `SearchBar` ahora solo muestra el mensaje cuando `result !== undefined`. Se descartó la alternativa de un booleano `hasSearched` porque requeriría un estado adicional sin beneficio real.

```js
// ❌ Antes — null se interpretaba como "no encontrado" desde el inicio
const [foundNode, setFoundNode] = useState(null);

// ✅ Después — undefined indica "sin búsqueda aún"
const [foundNode, setFoundNode] = useState(undefined);
```

---

### BUG #7 — `handleSearch` no validaba entrada vacía o no numérica

**Archivo:** `src/components/BSTVisualizer.jsx`

**Problema:** Si el usuario hacía clic en "Buscar" sin escribir nada, la app mostraba "No encontrado" silenciosamente, sin ningún aviso de error de entrada.

**Causa raíz:** `parseInt("")` retorna `NaN`. Las comparaciones `NaN < x` y `NaN > x` son siempre `false`, por lo que `search` recorría el árbol entero sin poder decidir dirección y terminaba retornando `null`, que el componente mostraba como "No encontrado".

**Solución:** Se agrega una guardia con `isNaN()` antes de llamar a `search`. Si la entrada no es un número válido, se llama `setFoundNode(undefined)` para restablecer la UI al estado neutro y se sale con early return. Esto cubre tanto entrada vacía (`""`) como texto no numérico (`"abc"`).

```js
// ❌ Antes
const handleSearch = () => {
  const parsed = parseInt(searchTerm, 10);
  const result = search(root, parsed); // parsed puede ser NaN
  setFoundNode(result ? result.value : null);
};

// ✅ Después
const handleSearch = () => {
  const parsed = parseInt(searchTerm, 10);
  if (isNaN(parsed)) {
    setFoundNode(undefined);
    return;
  }
  const result = search(root, parsed);
  setFoundNode(result ? result.value : null);
};
```

---

### Tests — Ampliación de la suite de pruebas

**Archivo:** `src/utils/bst.test.js`

La suite original contaba con 3 casos. Se expandió a **24 tests** cubriendo todos los módulos y sus casos borde:

| Módulo | Casos cubiertos |
|---|---|
| `insert` | Inserción izquierda/derecha, duplicados, árbol degenerado |
| `search` | Árbol vacío, strict equality (`string` vs `number`), raíz, hoja izquierda, hoja derecha |
| `inOrder` | Árbol vacío, un nodo, orden ascendente completo |
| `preOrder` | Árbol vacío, raíz visitada primero |
| `postOrder` | Árbol vacío, raíz visitada al final |
| `getHeight` | Árbol vacío, un nodo, árbol balanceado, árbol degenerado |
| `toD3Format` | Árbol vacío, hoja sin hijos, solo hijo derecho (regresión BUG #4), dos hijos |

---

## AI Usage

El análisis inicial fue asistido por Antigravity (Claude). El agente identificó los bugs, propuso las correcciones y generó la suite de tests expandida. Cada propuesta fue auditada manualmente antes de aceptarla:

- **BUG #1:** Se validó la corrección comparando `insert(null, 10)` + `insert(root, 5)` antes y después del fix. Con la condición duplicada, `root.left` era `null`; tras el fix, `root.left.value === 5`.
- **BUG #3:** Se confirmó que `===` elimina la coerción y se verificó contra el test `search(root, "5") === null`.
- **BUG #4:** Se trazó el flujo de `toD3Format` con árbol `10 → 15 → 20` para confirmar que las guardas independientes agregan el hijo derecho correctamente.
- **BUG #5:** Se ejecutaron los recorridos sobre `[10, 5, 15, 3, 7, 12, 20]` y se verificó que `inOrder` produce `[3, 5, 7, 10, 12, 15, 20]`.
- **BUG #6:** Se analizó la semántica de `null` vs `undefined` en JavaScript y se descartó el uso de un booleano `hasSearched` por ser redundante.
- **BUG #7:** Se confirmó que `isNaN(parsed)` cubre todos los casos de entrada inválida y que el early return con `setFoundNode(undefined)` restablece la UI correctamente.
