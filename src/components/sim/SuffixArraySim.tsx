import { useMemo, useState } from 'react';

type Ronda = { len: number; rank: number[]; sa: number[] };

function rondas(raw: string): Ronda[] {
  const chars = [...raw.replaceAll('$', ''), '$'];
  const n = chars.length;
  let rank = chars.map(c => c === '$' ? 0 : c.codePointAt(0)! + 1);
  const out: Ronda[] = [];
  for (let len = 1; ; len *= 2) {
    const sa = Array.from({ length: n }, (_, i) => i).sort((a, b) => rank[a] - rank[b] || (len === 1 ? 0 : (rank[a + len / 2] ?? -1) - (rank[b + len / 2] ?? -1)));
    const nuevo = Array(n).fill(0) as number[];
    for (let k = 1; k < n; k++) {
      const a = sa[k - 1], b = sa[k];
      nuevo[b] = nuevo[a] + Number(rank[a] !== rank[b] || (len > 1 && (rank[a + len / 2] ?? -1) !== (rank[b + len / 2] ?? -1)));
    }
    out.push({ len, rank: nuevo, sa });
    rank = nuevo;
    if (nuevo[sa[n - 1]] === n - 1 || len >= n) break;
  }
  return out;
}

export default function SuffixArraySim() {
  const [entrada, setEntrada] = useState('banana');
  const [paso, setPaso] = useState(0);
  const limpio = [...entrada.replaceAll('$', '')].slice(0, 20).join('');
  const chars = [...limpio, '$'];
  const estados = useMemo(() => rondas(limpio), [limpio]);
  const e = estados[Math.min(paso, estados.length - 1)];
  return <div className="pg not-content">
    <h4>Simulador de duplicación</h4>
    <div className="pg-row"><label>Texto <input value={entrada} maxLength={20} onChange={ev => { setEntrada(ev.target.value); setPaso(0); }} /></label>
      <button onClick={() => setPaso(Math.max(0, paso - 1))} disabled={paso === 0}>Anterior</button>
      <button onClick={() => setPaso(Math.min(estados.length - 1, paso + 1))} disabled={paso === estados.length - 1}>Siguiente</button>
      <button onClick={() => setPaso(0)}>Reiniciar</button></div>
    <p className="pg-note">Ronda k = {paso}: rangos para los primeros {e.len} caracteres. SA actual: [{e.sa.join(', ')}]. El $ se añade automáticamente.</p>
    <div style={{ overflowX: 'auto' }}><table><thead><tr><th>i</th><th>sufijo</th><th>rank<sub>{paso}</sub>(i)</th></tr></thead><tbody>
      {e.sa.map(i => <tr key={i}><td>{i}</td><td>{chars.slice(i).join('')}</td><td>{e.rank[i]}</td></tr>)}
    </tbody></table></div>
  </div>;
}
