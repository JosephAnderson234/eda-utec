import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Controles, Nota, usePlayer } from './Player';

/** Árbol de referencia perfecto con llaves 0–6 (el de la página). */
const NODOS = [
	{ k: 3, x: 360, y: 40 },
	{ k: 1, x: 190, y: 115 },
	{ k: 5, x: 530, y: 115 },
	{ k: 0, x: 100, y: 190 },
	{ k: 2, x: 280, y: 190 },
	{ k: 4, x: 440, y: 190 },
	{ k: 6, x: 620, y: 190 },
];
const PADRE: Record<number, number> = { 1: 3, 5: 3, 0: 1, 2: 1, 4: 5, 6: 5 };
const INTERNOS = [3, 1, 5];
const xy = (k: number) => NODOS.find((n) => n.k === k)!;
const ancestros = (x: number) => {
	const a: number[] = [];
	for (let v = PADRE[x]; v !== undefined; v = PADRE[v]) a.unshift(v);
	return a;
};

type Paso = { t: number; lado: Record<number, 'izq' | 'der' | null>; alt: Record<number, number>; cambio: number[]; camino: number[] };

function calcular(seq: number[]): Paso[] {
	const lado: Record<number, 'izq' | 'der' | null> = { 3: null, 1: null, 5: null };
	const alt: Record<number, number> = { 3: 0, 1: 0, 5: 0 };
	const out: Paso[] = [{ t: -1, lado: { ...lado }, alt: { ...alt }, cambio: [], camino: [] }];
	seq.forEach((x, t) => {
		const cambio: number[] = [];
		const anc = ancestros(x);
		for (const y of anc) {
			const s = x < y ? 'izq' : 'der';
			if (lado[y] && lado[y] !== s) (alt[y]++, cambio.push(y));
			lado[y] = s;
		}
		out.push({ t, lado: { ...lado }, alt: { ...alt }, cambio, camino: [...anc, x] });
	});
	return out;
}

const PRESETS = ['0 4 2 6 1 5', '6 0 5 1 4 2', '3 3 3 0 6'];

export default function WilberAnim() {
	const [txt, setTxt] = useState(PRESETS[0]);
	const seq = useMemo(
		() =>
			txt
				.split(/[\s,]+/)
				.map(Number)
				.filter((v) => Number.isInteger(v) && v >= 0 && v <= 6),
		[txt],
	);
	const ps = useMemo(() => calcular(seq), [seq]);
	const p = usePlayer(ps.length, 1500);
	const s = ps[p.i];
	const total = INTERNOS.reduce((a, y) => a + s.alt[y], 0);
	const x = s.t >= 0 ? seq[s.t] : null;
	let nota = 'Cada nodo interno recuerda de qué lado vino el último acceso de su subárbol. Una alternancia es un cambio de lado. Pulsa reproducir.';
	if (x !== null)
		nota =
			`Acceso a ${x}: baja por ${s.camino.join(' → ')}. ` +
			(s.cambio.length ? `Cambian de lado: ${s.cambio.join(', ')} (+${s.cambio.length}). En Tango, son exactamente los hijos preferidos que cambian.` : 'Ningún nodo cambia de lado: 0 alternancias nuevas.') +
			(p.i === ps.length - 1 ? ` Fin: Wilber-1 = ${total}. Cualquier BST paga al menos del orden de ${total} + n: es una cota inferior de OPT (salvo constantes).` : '');
	return (
		<div className="pg not-content">
			<h4>🎬 Animación: contar alternancias de Wilber-1</h4>
			<p className="pg-sub">Árbol de referencia con llaves 0–6. Escribe una secuencia (números del 0 al 6) o usa un ejemplo.</p>
			<div className="pg-row">
				<label className="pg-field">
					<span>Secuencia de accesos</span>
					<input type="text" value={txt} onChange={(e) => (setTxt(e.target.value), p.go(0))} />
				</label>
				<span className="pg-seg">
					{PRESETS.map((q) => (
						<button key={q} className={q === txt ? 'active' : ''} onClick={() => (setTxt(q), p.go(0))}>
							{q}
						</button>
					))}
				</span>
			</div>
			<div className="an-arr">
				{seq.map((v, k) => (
					<motion.div key={k} className="an-cell" animate={{ opacity: k <= s.t ? 1 : 0.35, y: k === s.t ? -4 : 0 }} style={{ borderColor: k === s.t ? 'var(--pg-c2)' : undefined }}>
						<b>{v}</b>
						<small>t{k}</small>
					</motion.div>
				))}
			</div>
			<svg viewBox="0 0 720 235" className="an-svg" role="img" aria-label="Árbol de referencia con contadores de alternancias">
				{NODOS.filter((n) => PADRE[n.k] !== undefined).map((n) => {
					const q = xy(PADRE[n.k]);
					const pref = s.lado[PADRE[n.k]] === (n.k < PADRE[n.k] ? 'izq' : 'der');
					return <line key={n.k} x1={q.x} y1={q.y} x2={n.x} y2={n.y} stroke={pref ? 'var(--pg-c4)' : 'var(--pg-muted)'} strokeWidth={pref ? 5 : 1.5} strokeDasharray={pref ? undefined : '5 5'} />;
				})}
				{NODOS.map((n) => {
					const en = s.camino.includes(n.k);
					const flip = s.cambio.includes(n.k);
					return (
						<g key={n.k}>
							<motion.circle cx={n.x} cy={n.y} animate={{ r: flip ? 27 : en ? 23 : 20 }} fill={flip ? 'var(--pg-c5)' : n.k === x ? 'var(--pg-c2)' : 'var(--pg-surface-2)'} fillOpacity={0.85} stroke={en ? 'var(--sl-color-white)' : 'var(--pg-border)'} strokeWidth={en ? 2.5 : 1.5} />
							<text x={n.x} y={n.y + 5} textAnchor="middle" className="an-t">
								{n.k}
							</text>
							{INTERNOS.includes(n.k) && (
								<text x={n.x + 30} y={n.y - 16} className="an-s">
									alt {s.alt[n.k]}
								</text>
							)}
						</g>
					);
				})}
			</svg>
			<p className="an-s" style={{ margin: 0 }}>
				Verde grueso: el lado del último acceso (el «hijo preferido» de Tango). Rojo: nodo que acaba de alternar. Total Wilber-1: <b>{total}</b>
			</p>
			<Nota k={`${txt}-${p.i}`}>{nota}</Nota>
			<Controles p={p} />
		</div>
	);
}
