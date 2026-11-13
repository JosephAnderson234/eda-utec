import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Controles, Nota, usePlayer, COL } from './Player';
import { NODOS, padre, xy, hld } from './arbolClase';

const H = hld();
const cadenas = [...new Set(NODOS.map((n) => H.tope[n.v]))];
const colorDe = (v: number) => COL[cadenas.indexOf(H.tope[v]) % COL.length];
const porPos = [...NODOS].sort((a, b) => H.pos[a.v] - H.pos[b.v]).map((n) => n.v);

type Paso = { u: number; v: number; rangos: [number, number][]; nota: string };

function pasos(a: number, b: number): Paso[] {
	const out: Paso[] = [];
	const rangos: [number, number][] = [];
	let u = a,
		v = b;
	out.push({ u, v, rangos: [], nota: `Consulta del camino ${a} → ${b}. Cada color es una cadena pesada; abajo, el arreglo en orden pos().` });
	while (H.tope[u] !== H.tope[v]) {
		if (H.prof[H.tope[u]] < H.prof[H.tope[v]]) [u, v] = [v, u];
		const t = H.tope[u];
		rangos.push([H.pos[t], H.pos[u]]);
		out.push({
			u,
			v,
			rangos: [...rangos],
			nota: `tope(${u}) = ${t} es el más profundo de los dos topes: se consulta el tramo [pos ${t}, pos ${u}] = [${H.pos[t]}, ${H.pos[u]}] y se salta al padre del tope, ${padre[t]}.`,
		});
		u = padre[t];
		out.push({ u, v, rangos: [...rangos], nota: `Ahora los extremos son ${u} y ${v}. ${H.tope[u] === H.tope[v] ? 'Ya están en la misma cadena.' : 'Siguen en cadenas distintas: repetir.'}` });
	}
	const [l, r] = [Math.min(H.pos[u], H.pos[v]), Math.max(H.pos[u], H.pos[v])];
	rangos.push([l, r]);
	const lca = H.pos[u] < H.pos[v] ? u : v;
	out.push({
		u,
		v,
		rangos: [...rangos],
		nota: `Misma cadena: último tramo [${l}, ${r}]. El menos profundo, ${lca}, es el LCA. Total: ${rangos.length} tramos, cada uno es una consulta O(lg n) al segment tree ⇒ O(lg² n).`,
	});
	return out;
}

export default function HldAnim() {
	const [a, setA] = useState(10);
	const [b, setB] = useState(9);
	const ps = useMemo(() => pasos(a, b), [a, b]);
	const p = usePlayer(ps.length, 1500);
	const s = ps[p.i];
	const dentro = (k: number) => s.rangos.findIndex(([l, r]) => k >= l && k <= r);
	const sel = (val: number, set: (n: number) => void, lbl: string) => (
		<label className="pg-field">
			<span>{lbl}</span>
			<select
				value={val}
				onChange={(e) => {
					set(+e.target.value);
					p.go(0);
				}}
			>
				{NODOS.map((n) => (
					<option key={n.v}>{n.v}</option>
				))}
			</select>
		</label>
	);
	return (
		<div className="pg not-content">
			<h4>🎬 Animación: un camino se vuelve O(lg n) rangos</h4>
			<p className="pg-sub">Árbol de las diapositivas. Elige dos nodos y pulsa reproducir: sube siempre por el extremo cuyo tope es más profundo.</p>
			<div className="pg-row">
				{sel(a, setA, 'desde')}
				{sel(b, setB, 'hasta')}
			</div>
			<svg viewBox="0 0 720 300" className="an-svg" role="img" aria-label="Árbol con cadenas pesadas coloreadas">
				{NODOS.filter((n) => n.p).map((n) => {
					const q = xy(n.p);
					const pes = H.pesado[n.p] === n.v;
					return <line key={n.v} x1={q.x} y1={q.y} x2={n.x} y2={n.y} stroke={pes ? colorDe(n.v) : 'var(--pg-muted)'} strokeWidth={pes ? 5 : 1.5} strokeDasharray={pes ? undefined : '5 5'} />;
				})}
				{NODOS.map((n) => {
					const k = dentro(H.pos[n.v]);
					const marca = n.v === s.u || n.v === s.v;
					return (
						<g key={n.v}>
							<motion.circle cx={n.x} cy={n.y} r={21} animate={{ r: marca ? 25 : 21, fillOpacity: k >= 0 ? 0.9 : 0.15 }} fill={colorDe(n.v)} stroke={marca ? 'var(--sl-color-white)' : colorDe(n.v)} strokeWidth={marca ? 3 : 1.5} />
							<text x={n.x} y={n.y + 5} textAnchor="middle" className="an-t">
								{n.v}
							</text>
							<text x={n.x} y={n.y + 40} textAnchor="middle" className="an-s">
								pos {H.pos[n.v]}
							</text>
						</g>
					);
				})}
			</svg>
			<div className="an-arr" aria-label="Arreglo en orden pos">
				{porPos.map((v, k) => {
					const r = dentro(k);
					return (
						<motion.div key={v} className="an-cell" animate={{ y: r >= 0 ? -4 : 0, opacity: r >= 0 ? 1 : 0.45 }} style={{ borderColor: colorDe(v), background: r >= 0 ? `color-mix(in srgb, ${colorDe(v)} 35%, transparent)` : undefined }}>
							<b>{v}</b>
							<small>{k}</small>
							{r >= 0 && <em>#{r + 1}</em>}
						</motion.div>
					);
				})}
			</div>
			<Nota k={`${a}-${b}-${p.i}`}>{s.nota}</Nota>
			<Controles p={p} />
		</div>
	);
}
