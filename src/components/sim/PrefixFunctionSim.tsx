import { useMemo, useState } from 'react';

type Paso = { i: number; pi: number[]; k: number; detalle: string };

function calcular(p: string): Paso[] {
  const chars = [...p];
  const pi = Array(chars.length).fill(0) as number[];
  const pasos: Paso[] = [{ i: -1, pi: [...pi], k: 0, detalle: 'Pulsa Siguiente para calcular π[0].' }];
  if (!chars.length) return pasos;
  pasos.push({ i: 0, pi: [...pi], k: 0, detalle: 'Un prefijo de un carácter no tiene borde propio: π[0] = 0.' });
  let k = 0;
  for (let i = 1; i < chars.length; i++) {
    const caidas: string[] = [];
    while (k > 0 && chars[i] !== chars[k]) {
      const viejo = k;
      k = pi[k - 1];
      caidas.push(`k ← π[${viejo - 1}] = ${k}`);
    }
    if (chars[i] === chars[k]) k++;
    pi[i] = k;
    pasos.push({ i, pi: [...pi], k, detalle: `${caidas.length ? `Falla: ${caidas.join('; ')}. ` : ''}${k ? `Coincide y k sube a ${k}.` : 'No coincide; k queda en 0.'} Por tanto, π[${i}] = ${k}.` });
  }
  return pasos;
}

export default function PrefixFunctionSim() {
  const [patron, setPatron] = useState('ababaca');
  const [paso, setPaso] = useState(0);
  const pasos = useMemo(() => calcular(patron), [patron]);
  const actual = pasos[Math.min(paso, pasos.length - 1)];
  return <div className="pg not-content">
    <h4>Simulador de la función prefijo</h4>
    <div className="pg-row"><label>Patrón <input value={patron} maxLength={24} onChange={e => { setPatron(e.target.value); setPaso(0); }} /></label>
      <button onClick={() => setPaso(Math.max(0, paso - 1))} disabled={paso === 0}>Anterior</button>
      <button onClick={() => setPaso(Math.min(pasos.length - 1, paso + 1))} disabled={paso === pasos.length - 1}>Siguiente</button>
      <button onClick={() => setPaso(0)}>Reiniciar</button></div>
    <p className="pg-note">Paso {paso}/{pasos.length - 1} · k = {actual.k}. {actual.detalle}</p>
    <div style={{ overflowX: 'auto' }}><table><tbody>
      <tr><th>i</th>{[...patron].map((_, i) => <th key={i}>{i}</th>)}</tr>
      <tr><th>P[i]</th>{[...patron].map((c, i) => <td key={i}>{c}</td>)}</tr>
      <tr><th>π[i]</th>{[...patron].map((_, i) => <td key={i} style={{ fontWeight: i === actual.i ? 700 : undefined }}>{i <= actual.i ? actual.pi[i] : '·'}</td>)}</tr>
    </tbody></table></div>
  </div>;
}
