import styles from "./BSTVisualizer.module.css";

/**
 * SearchBar — Campo de búsqueda de valores en el BST.
 *
 * Recibe `result` con tres posibles estados:
 *   - `undefined` → El usuario aún no ha buscado nada (no muestra mensaje).
 *   - `null`      → Búsqueda realizada, valor no encontrado.
 *   - `number`    → Búsqueda realizada, valor encontrado.
 *
 * 🔴 BUG #6 CORREGIDO: Antes se usaba `null` como estado inicial en el padre,
 * lo que hacía que este componente mostrara "No encontrado" desde que cargaba
 * la app (antes de que el usuario hiciera cualquier búsqueda).
 * SOLUCIÓN: El padre ahora pasa `undefined` como valor inicial, y este
 * componente interpreta `undefined` como "sin búsqueda aún" mostrando vacío.
 */
export default function SearchBar({ value, onChange, onSearch, result }) {
  const resultMessage =
    result === undefined
      ? null
      : result !== null
        ? `✅ Encontrado: ${result}`
        : "❌ No encontrado";

  return (
    <section className={styles.controls}>
      <div className={styles.inputGroup}>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          placeholder="Buscar valor..."
          className={styles.input}
        />
        <button type="button" onClick={onSearch} className={styles.button}>
          Buscar
        </button>
      </div>
      {resultMessage && <p>{resultMessage}</p>}
    </section>
  );
}