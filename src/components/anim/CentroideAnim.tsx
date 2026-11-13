import { motion } from 'motion/react';
import { Controles, Nota, usePlayer, COL } from './Player';
import { NODOS, xy, vecinos } from './arbolClase';

type Paso = { nivel: Record<number, number>; c: number; comp: number[]; nota: string };

/** Componente conexa de v sin pasar por nodos ya quitados. */
function componente(v: number, fuera: Set<number>) {
	const vis = new Set([v]);
	const pila = [v];
	while (pila.length) {
		const x = pila.pop()!;
		for (const y of vecinos(x)) if (!fuera.has(y) && !vis.has(y)) vis.add(y), pila.push(y);
	}
	return [...vis].sort((a, b) => a - b);
}

/** Centroide: desde el menor nodo, bajar al hijo con más de s/2 nodos mientras exista. */
function centroide(comp: number[], fuera: Set<number>) {
	const s = comp.length;
	const tam = (v: number, p: number): number => 1 + vecinos(v).filter((y) => y !== p && !fuera.has(y)).reduce((t, y) => t + tam(y, v), 0);
	let v = comp[0],
		p = 0;
	for (;;) {
		const g = vecinos(v).find((y) => y !== p && !fuera.has(y) && tam(y, v) > s / 2);
		if (!g) return v;
		p = v;
		v = g;
	}
}

function calcular(): Paso[] {
	const out: Paso[] = [{ nivel: {}, c: 0, comp: [], nota: 'Árbol de 11 nodos de las diapositivas. Cada paso quita el centroide de una componente; el color indica el nivel en el árbol de centroides.' }];
	const fuera = new Set<number>();
	const nivel: Record<number, number> = {};
	let cola: { comp: number[]; l: number }[] = [{ comp: componente(1, fuera), l: 0 }];
	while (cola.length) {
		const { comp, l } = cola.shift()!;
		const c = centroide(comp, fuera);
		fuera.add(c);
		nivel[c] = l;
		const resto = vecinos(c)
			.filter((y) => !fuera.has(y))
			.map((y) => componente(y, fuera));
		cola = [...cola, ...resto.map((r) => ({ comp: r, l: l + 1 }))];
		out.push({
			nivel: { ...nivel },
			c,
			comp,
			nota:
				`Nivel ${l}: componente {${comp.join(', ')}} de ${comp.length} nodos → centroide ${c}. ` +
				(resto.length ? `Quedan componentes de tamaños ${resto.map((r) => r.length).join(', ')}, todas ≤ ${Math.floor(comp.length / 2)} = ⌊${comp.length}/2⌋.` : 'No quedan vecinos: es una hoja del árbol de centroides.'),
		});
	}
	const prof = Math.max(...Object.values(nivel));
	out.push({ nivel, c: 0, comp: [], nota: `Listo. Profundidad máxima ${prof} ≤ ⌊lg 11⌋ = 3: cada nivel al menos parte a la mitad. Todo camino u–v pasa por el primer centroide que los separa.` });
	return out;
}

const PASOS = calcular();

export default function CentroideAnim() {
	const p = usePlayer(PASOS.length, 1700);
	const s = PASOS[p.i];
	return (
		<div className="pg not-content">
			<h4>🎬 Animación: descomposición por centroides, nivel por nivel</h4>
			<p className="pg-sub">Mira cómo cada componente se parte en piezas de a lo más la mitad. Nivel 0 en un color, nivel 1 en otro, etc.</p>
			<svg viewBox="0 0 720 290" className="an-svg" role="img" aria-label="Árbol donde se van quitando centroides">
				{NODOS.filter((n) => n.p).map((n) => {
					const q = xy(n.p);
					const cortada = s.nivel[n.v] !== undefined || s.nivel[n.p] !== undefined;
					return <motion.line key={n.v} x1={q.x} y1={q.y} x2={n.x} y2={n.y} stroke="var(--pg-muted)" animate={{ opacity: cortada ? 0.12 : 0.9 }} strokeWidth={2} />;
				})}
				{NODOS.map((n) => {
					const l = s.nivel[n.v];
					const enComp = s.comp.includes(n.v);
					return (
						<g key={n.v}>
							<motion.circle cx={n.x} cy={n.y} animate={{ r: n.v === s.c ? 27 : 21 }} fill={l !== undefined ? COL[l] : 'var(--pg-surface-2)'} fillOpacity={l !== undefined ? 0.85 : 1} stroke={enComp ? 'var(--sl-color-white)' : 'var(--pg-border)'} strokeWidth={enComp ? 3 : 1.5} strokeDasharray={enComp && n.v !== s.c ? '4 3' : undefined} />
							<text x={n.x} y={n.y + 5} textAnchor="middle" className="an-t">
								{n.v}
							</text>
							{l !== undefined && (
								<text x={n.x + 26} y={n.y - 18} className="an-s">
									n{l}
								</text>
							)}
						</g>
					);
				})}
			</svg>
			<div className="pg-row" style={{ gap: '.5rem' }}>
				{[0, 1, 2, 3].map((l) => (
					<span key={l} className="an-chip" style={{ borderColor: COL[l] }}>
						nivel {l}:{' '}
						{Object.entries(s.nivel)
							.filter(([, x]) => x === l)
							.map(([v]) => v)
							.join(', ') || '—'}
					</span>
				))}
			</div>
			<Nota k={p.i}>{s.nota}</Nota>
			<Controles p={p} />
		</div>
	);
}
