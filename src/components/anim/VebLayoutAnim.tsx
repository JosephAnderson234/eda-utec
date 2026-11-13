import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Controles, Nota, usePlayer, COL } from './Player';

/** Árbol perfecto de 15 nodos (4 niveles), numerados por niveles: hijos de v son 2v y 2v+1. */
const NIV = 4;
const B = 3;
const nivel = (v: number) => Math.floor(Math.log2(v));
const pos = (v: number) => {
	const l = nivel(v);
	const k = v - 2 ** l;
	return { x: 30 + ((k + 0.5) * 660) / 2 ** l, y: 30 + l * 52 };
};

/** Layout vEB: arriba la mitad superior, después cada subárbol de abajo, recursivamente. */
function layout(v: number, h: number): number[] {
	if (h === 1) return [v];
	const arriba = Math.floor(h / 2),
		abajo = h - arriba;
	const out = layout(v, arriba);
	const raices: number[] = [];
	for (let k = 0; k < 2 ** arriba; k++) raices.push(v * 2 ** arriba + k);
	for (const r of raices) out.push(...layout(r, abajo));
	return out;
}
const VEB = layout(1, NIV);
const BFS = Array.from({ length: 15 }, (_, k) => k + 1);
/** Grupo del primer nivel de recursión: 0 = triángulo de arriba, 1..4 = triángulos de abajo. */
const grupo = (v: number) => (nivel(v) < 2 ? 0 : 1 + ((v >> (nivel(v) - 2)) - 4));

export default function VebLayoutAnim() {
	const [hoja, setHoja] = useState(13);
	const camino = useMemo(() => {
		const c: number[] = [];
		for (let v = hoja; v >= 1; v >>= 1) c.unshift(v);
		return c;
	}, [hoja]);
	const total = 1 + 15 + camino.length + 1;
	const p = usePlayer(total, 700);
	const puestos = Math.min(Math.max(p.i, 0), 15);
	const busc = Math.max(0, p.i - 16 - 0);
	const vistos = p.i > 15 ? camino.slice(0, Math.min(busc + 1, camino.length)) : [];
	const bloques = (arr: number[]) => new Set(vistos.map((v) => Math.floor(arr.indexOf(v) / B))).size;
	let nota = 'Árbol perfecto de 15 nodos. Pulsa reproducir: el layout vEB corta el árbol por la mitad de su altura y guarda el triángulo de arriba, luego cada triángulo de abajo, contiguos.';
	if (p.i >= 1 && p.i <= 15) {
		const v = VEB[p.i - 1];
		nota = `Celda ${p.i - 1} ← nodo ${v} (${grupo(v) === 0 ? 'triángulo de arriba' : `triángulo de abajo #${grupo(v)}`}). Cada triángulo de 3 nodos queda contiguo en memoria.`;
	}
	if (p.i > 15 && p.i < total - 1) nota = `Búsqueda hacia la hoja ${hoja}: visitados ${vistos.join(' → ')}. Bloques de B = ${B} celdas tocados: vEB ${bloques(VEB)}, por niveles ${bloques(BFS)}.`;
	if (p.i === total - 1) nota = `Camino completo: vEB toca ${bloques(VEB)} bloques y el layout por niveles ${bloques(BFS)}. En general vEB cuesta ≤ 4 log_B N transferencias sin conocer B; por niveles, Θ(lg(N/B)).`;
	const Arr = ({ arr, titulo, mostrar }: { arr: number[]; titulo: string; mostrar: number }) => (
		<div>
			<span className="an-s">{titulo}</span>
			<div className="an-arr">
				{arr.map((v, k) => {
					const on = k < mostrar;
					const visto = vistos.includes(v);
					return (
						<motion.div key={k} className="an-cell" animate={{ opacity: on ? 1 : 0.15, y: visto ? -4 : 0 }} style={{ borderColor: on ? COL[grupo(v)] : undefined, background: visto ? `color-mix(in srgb, ${COL[grupo(v)]} 40%, transparent)` : undefined, marginRight: k % B === B - 1 ? 8 : undefined }}>
							<b>{on ? v : ''}</b>
							<small>{k}</small>
						</motion.div>
					);
				})}
			</div>
		</div>
	);
	return (
		<div className="pg not-content">
			<h4>🎬 Animación: layout de van Emde Boas en memoria</h4>
			<p className="pg-sub">Arriba el árbol, coloreado por triángulo; abajo la memoria (los huecos separan bloques de B = 3). Al final compara los bloques que toca una búsqueda.</p>
			<div className="pg-row">
				<label className="pg-field">
					<span>Buscar hacia la hoja</span>
					<select value={hoja} onChange={(e) => (setHoja(+e.target.value), p.go(16))}>
						{[8, 9, 10, 11, 12, 13, 14, 15].map((v) => (
							<option key={v}>{v}</option>
						))}
					</select>
				</label>
			</div>
			<svg viewBox="0 0 720 210" className="an-svg" role="img" aria-label="Árbol perfecto de 15 nodos">
				{BFS.filter((v) => v > 1).map((v) => {
					const a = pos(v >> 1),
						b = pos(v);
					return <line key={v} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--pg-muted)" strokeWidth={vistos.includes(v) && vistos.includes(v >> 1) ? 4 : 1.5} />;
				})}
				{BFS.map((v) => {
					const { x, y } = pos(v);
					const on = VEB.indexOf(v) < puestos;
					return (
						<g key={v}>
							<motion.circle cx={x} cy={y} animate={{ r: vistos.includes(v) ? 20 : 16 }} fill={COL[grupo(v)]} fillOpacity={on ? 0.85 : 0.15} stroke={COL[grupo(v)]} />
							<text x={x} y={y + 5} textAnchor="middle" className="an-t">
								{v}
							</text>
						</g>
					);
				})}
			</svg>
			<Arr arr={VEB} titulo="Memoria con layout vEB" mostrar={puestos} />
			<Arr arr={BFS} titulo="Memoria por niveles (BFS), para comparar" mostrar={p.i > 15 ? 15 : 0} />
			<Nota k={`${hoja}-${p.i}`}>{nota}</Nota>
			<Controles p={p} />
		</div>
	);
}
