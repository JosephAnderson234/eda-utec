import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Controles, Nota, usePlayer } from './Player';

const A = [5, 3, 8, 1, 9, 4, 7, 2];
const n = A.length;
const K = Math.floor(Math.log2(n));

/** M[k][i] = índice del mínimo de A[i .. i + 2^k − 1] (argmin, como en la página). */
const M: number[][] = [A.map((_, i) => i)];
const mejor = (a: number, b: number) => (A[b] < A[a] ? b : a);
for (let k = 1; k <= K; k++) {
	M.push([]);
	for (let i = 0; i + (1 << k) <= n; i++) M[k].push(mejor(M[k - 1][i], M[k - 1][i + (1 << (k - 1))]));
}
type Celda = { k: number; i: number };
const CONSTR: Celda[] = [];
for (let k = 1; k <= K; k++) for (let i = 0; i + (1 << k) <= n; i++) CONSTR.push({ k, i });

export default function SparseTableAnim() {
	const [qi, setQi] = useState(1);
	const [qj, setQj] = useState(6);
	const [l, r] = [Math.min(qi, qj), Math.max(qi, qj)];
	const kq = Math.floor(Math.log2(r - l + 1));
	const total = 1 + CONSTR.length + 3;
	const p = usePlayer(total, 650);
	const enConstr = p.i >= 1 && p.i <= CONSTR.length;
	const hechas = Math.min(p.i, CONSTR.length);
	const cur = enConstr ? CONSTR[p.i - 1] : null;
	const fase = p.i - CONSTR.length; // 1, 2, 3: consulta
	const visible = (k: number, i: number) => k === 0 || CONSTR.findIndex((c) => c.k === k && c.i === i) < hechas;
	const resaltA = useMemo(() => {
		const s = new Map<number, string>();
		if (cur) for (let x = cur.i; x < cur.i + (1 << cur.k); x++) s.set(x, x < cur.i + (1 << (cur.k - 1)) ? 'var(--pg-c1)' : 'var(--pg-c3)');
		if (fase >= 1) {
			for (let x = l; x < l + (1 << kq); x++) s.set(x, 'var(--pg-c1)');
			if (fase >= 2) for (let x = r - (1 << kq) + 1; x <= r; x++) s.set(x, s.has(x) && x < l + (1 << kq) ? 'var(--pg-c4)' : 'var(--pg-c3)');
		}
		return s;
	}, [p.i, l, r]);
	let nota = 'Arreglo del ejemplo de clase. La fila k guarda el ÍNDICE del mínimo (argmin) de cada ventana de largo 2^k; debajo, en gris, su valor A[·]. Pulsa reproducir para construir la tabla.';
	if (cur) { const a = M[cur.k - 1][cur.i], b = M[cur.k - 1][cur.i + (1 << (cur.k - 1))]; nota = `M[${cur.k}][${cur.i}] = el mejor entre M[${cur.k - 1}][${cur.i}] = ${a} (A=${A[a]}) y M[${cur.k - 1}][${cur.i + (1 << (cur.k - 1))}] = ${b} (A=${A[b]}) ⇒ ${M[cur.k][cur.i]}. Dos mitades de largo 2^${cur.k - 1}.`; }
	if (fase === 1) nota = `Consulta RMQ(${l}, ${r}): largo ${r - l + 1}, k = ⌊lg ${r - l + 1}⌋ = ${kq}. Primera ventana: [${l}, ${l + (1 << kq) - 1}] → M[${kq}][${l}] = ${M[kq][l]} (A=${A[M[kq][l]]}).`;
	if (fase === 2) nota = `Segunda ventana, pegada al final: [${r - (1 << kq) + 1}, ${r}] → M[${kq}][${r - (1 << kq) + 1}] = ${M[kq][r - (1 << kq) + 1]} (A=${A[M[kq][r - (1 << kq) + 1]]}). Se solapan (verde) y no importa: el mínimo es idempotente.`;
	if (fase === 3) nota = `Respuesta: el mejor de los índices ${M[kq][l]} y ${M[kq][r - (1 << kq) + 1]} ⇒ RMQ(${l}, ${r}) = ${mejor(M[kq][l], M[kq][r - (1 << kq) + 1])} (valor ${A[mejor(M[kq][l], M[kq][r - (1 << kq) + 1])]}) en O(1). Preprocesamiento: ${CONSTR.length + n} celdas, es decir O(n lg n).`;
	const usada = (k: number, i: number) => (fase >= 1 && k === kq && i === l) || (fase >= 2 && k === kq && i === r - (1 << kq) + 1);
	return (
		<div className="pg not-content">
			<h4>🎬 Animación: Sparse Table, construir y consultar</h4>
			<p className="pg-sub">Construcción por filas (cada celda une dos mitades) y luego una consulta con dos ventanas solapadas.</p>
			<div className="pg-row">
				{[
					['i', qi, setQi],
					['j', qj, setQj],
				].map(([lb, v, set]) => (
					<label key={lb as string} className="pg-field">
						<span>{lb as string}</span>
						<select value={v as number} onChange={(e) => ((set as (x: number) => void)(+e.target.value), p.go(CONSTR.length + 1))}>
							{A.map((_, k) => (
								<option key={k}>{k}</option>
							))}
						</select>
					</label>
				))}
			</div>
			<div className="an-scroll">
				<table className="an-tab">
					<tbody>
						<tr>
							<th>i</th>
							{A.map((_, k) => (
								<th key={k}>{k}</th>
							))}
						</tr>
						{M.map((fila, k) => (
							<tr key={k}>
								<th>{k === 0 ? 'A' : `M[${k}]`}</th>
								{A.map((_, i) => {
									const v = fila[i];
									const bg = k === 0 ? resaltA.get(i) : cur && cur.k === k && cur.i === i ? 'var(--pg-c2)' : usada(k, i) ? 'var(--pg-c4)' : undefined;
									return (
										<td key={i}>
											{v !== undefined && visible(k, i) ? (
												<motion.span initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="an-pill" style={{ background: bg ? `color-mix(in srgb, ${bg} 45%, transparent)` : undefined }}>
													{k === 0 ? A[i] : v}
													{k > 0 && <small className="an-s" style={{ marginLeft: 3 }}>{A[v]}</small>}
												</motion.span>
											) : (
												<span className="an-s">{v === undefined ? '' : '·'}</span>
											)}
										</td>
									);
								})}
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<Nota k={`${p.i}-${l}-${r}`}>{nota}</Nota>
			<Controles p={p} />
		</div>
	);
}
