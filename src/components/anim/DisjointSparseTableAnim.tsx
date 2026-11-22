import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Controles, Nota, usePlayer, COL } from './Player';

export type OperacionDST = 'suma' | 'minimo' | 'maximo';
export const operarDST = (a: number, b: number, op: OperacionDST) => op === 'suma' ? a + b : op === 'minimo' ? Math.min(a, b) : Math.max(a, b);
export function construirDST(a: number[], op: OperacionDST) {
 const niveles = Math.ceil(Math.log2(Math.max(2, a.length)));
 const tabla: (number | null)[][] = Array.from({ length: niveles }, () => Array(a.length).fill(null));
 const pasos: { h: number; inicio: number; medio: number; fin: number; i: number; valor: number }[] = [];
 for (let h = 0; h < niveles; h++) {
  const tam = 2 ** (h + 1);
  for (let inicio = 0; inicio < a.length; inicio += tam) {
   const medio = Math.min(inicio + tam / 2, a.length), fin = Math.min(inicio + tam, a.length);
   let v: number | null = null;
   for (let i = medio - 1; i >= inicio; i--) { v = v === null ? a[i] : operarDST(a[i], v, op); tabla[h][i] = v; pasos.push({ h, inicio, medio, fin, i, valor: v }); }
   v = null;
   for (let i = medio; i < fin; i++) { v = v === null ? a[i] : operarDST(v, a[i], op); tabla[h][i] = v; pasos.push({ h, inicio, medio, fin, i, valor: v }); }
  }
 }
 return { tabla, pasos };
}
export function consultarDST(a: number[], op: OperacionDST, l: number, r: number) {
 if (!a.length || !Number.isInteger(l) || !Number.isInteger(r) || l < 0 || r >= a.length || l > r) throw new Error('Rango inválido');
 const h = l === r ? -1 : Math.floor(Math.log2(l ^ r));
 const tabla = construirDST(a, op).tabla;
 const izquierda = h < 0 ? a[l] : tabla[h][l]!;
 const derecha = h < 0 ? null : tabla[h][r]!;
 const valor = derecha === null ? izquierda : operarDST(izquierda, derecha, op);
 return { h, izquierda, derecha, valor, bruto: a.slice(l, r + 1).reduce((v, x) => operarDST(v, x, op)) };
}
const BASE = [5, 3, 8, 1, 9, 4, 7, 2];
export default function DisjointSparseTableAnim() {
 const [texto, setTexto] = useState(BASE.join(',')); const [a, setA] = useState(BASE); const [error, setError] = useState('');
 const [op, setOp] = useState<OperacionDST>('suma'); const [l, setL] = useState(1); const [r, setR] = useState(6);
 const { tabla, pasos } = useMemo(() => construirDST(a, op), [a, op]); const q = consultarDST(a, op, Math.min(l, r), Math.max(l, r));
 const p = usePlayer(pasos.length + 4, 420); const actual = p.i > 0 && p.i <= pasos.length ? pasos[p.i - 1] : null;
 const fase = p.i - pasos.length; const izq = Math.min(l, r), der = Math.max(l, r);
 const bits = (x: number) => x.toString(2).padStart(Math.ceil(Math.log2(Math.max(2, a.length))), '0');
 let nota = 'Cada nivel h divide en bloques de tamaño 2^(h+1), con mitad m: a la izquierda guardamos sufijos hacia m y a la derecha prefijos desde m. Si falta una mitad al final, solo se llenan las posiciones existentes.';
 if (actual) nota = `Nivel ${actual.h}, bloque [${actual.inicio}, ${actual.fin - 1}], mitad m=${actual.medio}: T[${actual.h}][${actual.i}]=${actual.valor}. Acumulamos ${actual.i < actual.medio ? 'hacia la izquierda desde la mitad' : 'hacia la derecha desde la mitad'} para dejar preparada la consulta.`;
 if (fase === 1) nota = izq === der ? `Consulta [${izq}, ${der}]: una sola celda, respuesta A[${izq}]=${q.valor}.` : `Consulta [${izq}, ${der}]: ${bits(izq)} XOR ${bits(der)} = ${bits(izq ^ der)}; su bit más alto es ${q.h}. Ese nivel separa las dos posiciones en mitades distintas.`;
 if (fase === 2) nota = izq === der ? `No hace falta combinar: A[${izq}]=${q.valor}.` : `Tomamos el sufijo T[${q.h}][${izq}]=${q.izquierda} y el prefijo T[${q.h}][${der}]=${q.derecha}; cubren [${izq}, ${der}] sin solaparse.`;
 if (fase >= 3) nota = `${izq === der ? `A[${izq}]` : `T[${q.h}][${izq}] ${op} T[${q.h}][${der}]`} = ${q.valor}. ${q.valor === q.bruto ? '✓ coincide con la fuerza bruta.' : 'Error de verificación.'} Preprocesamiento O(n lg n), consulta O(1) con una combinación; la sparse table clásica solapa ventanas y exige idempotencia.`;
 const cambiar = (s: string) => { setTexto(s); p.go(0); const partes = s.split(/[\s,;]+/).filter(Boolean); const nums = partes.map(Number); if (partes.length < 2 || partes.length > 16 || nums.some(x => !Number.isFinite(x) || !Number.isInteger(x))) { setError('Escribe de 2 a 16 enteros separados por comas.'); return; } setError(''); setA(nums); setL(x => Math.min(x, nums.length - 1)); setR(x => Math.min(x, nums.length - 1)); };
 return <div className="pg not-content"><h4>🎬 Animación: Disjoint Sparse Table</h4><p className="pg-sub">Nivel h: bloques de 2^(h+1), mitad m; sufijos a la izquierda y prefijos a la derecha. Una sola combinación por consulta.</p>
  <div className="pg-row"><label className="pg-field"><span>Arreglo A</span><input value={texto} onChange={e => cambiar(e.target.value)} /></label><label className="pg-field"><span>Operación</span><select value={op} onChange={e => { setOp(e.target.value as OperacionDST); p.go(0); }}><option value="suma">suma</option><option value="minimo">mínimo</option><option value="maximo">máximo</option></select></label>{([['l',l,setL],['r',r,setR]] as const).map(([nombre,v,set]) => <label className="pg-field" key={nombre}><span>{nombre}</span><select value={v} onChange={e => { set(+e.target.value); p.go(0); }}>{a.map((_,i)=><option key={i} value={i}>{i}</option>)}</select></label>)}</div>
  {error && <p className="an-s" role="alert">{error} Se muestra el último arreglo válido.</p>}
  <div className="an-scroll"><table className="an-tab"><tbody><tr><th>i</th>{a.map((_,i)=><th key={i}>{i}</th>)}</tr><tr><th>A</th>{a.map((v,i)=><td key={i}><span className="an-pill" style={{borderColor:i>=izq&&i<=der&&fase>0?COL[3]:undefined}}>{v}</span></td>)}</tr>{tabla.map((fila,h)=><tr key={h}><th>T[{h}]</th>{fila.map((v,i)=>{const idx=pasos.findIndex(x=>x.h===h&&x.i===i);const visible=idx<p.i; const marca=actual?.h===h&&actual.i===i || fase>=2&&h===q.h&&(i===izq||i===der);return <td key={i}>{visible?<motion.span initial={{opacity:0,scale:.5}} animate={{opacity:1,scale:1}} className="an-pill" style={{background:marca?`color-mix(in srgb, ${COL[2]} 40%, transparent)`:undefined}}>{v}</motion.span>:<span className="an-s">·</span>}</td>})}</tr>)}</tbody></table></div>
  <Nota k={`${p.i}-${op}-${a.join(',')}-${izq}-${der}`}>{nota}</Nota><Controles p={p}/></div>;
}
