import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Controles, Nota, usePlayer } from './Player';

type V = { u: number; min: number | null; max: number | null; summary?: V; cluster?: V[] };
const raiz = (u: number) => Math.sqrt(u);

function crear(u: number): V {
	if (u === 2) return { u, min: null, max: null };
	const s = raiz(u);
	return { u, min: null, max: null, summary: crear(s), cluster: Array.from({ length: s }, () => crear(s)) };
}
function insertar(V: V, x: number) {
	if (V.min === null) {
		V.min = V.max = x;
		return;
	}
	if (x < V.min) [x, V.min] = [V.min, x];
	if (V.u > 2) {
		const s = raiz(V.u),
			c = Math.floor(x / s),
			i = x % s;
		if (V.cluster![c].min === null) {
			insertar(V.summary!, c);
			V.cluster![c].min = V.cluster![c].max = i;
		} else insertar(V.cluster![c], i);
	}
	if (x > V.max!) V.max = x;
}

const S = [2, 3, 4, 5, 7, 14, 15];
const T = crear(16);
S.forEach((x) => insertar(T, x));

type Ev = { prof: number; donde: string; msg: string; rango?: [number, number]; resumen?: number };

function sucesor(V: V, x: number, base: number, prof: number, donde: string, ev: Ev[]): number | null {
	const r: [number, number] = base < 0 ? [-1, -1] : [base, base + V.u - 1];
	const pre = `${donde} (u = ${V.u}), x = ${x}: `;
	if (V.min !== null && x < V.min) {
		ev.push({ prof, donde, rango: r, msg: pre + `x < min = ${V.min} ⇒ devolver min = ${V.min}.` });
		return V.min;
	}
	if (V.max === null || x >= V.max) {
		ev.push({ prof, donde, rango: r, msg: pre + `x ≥ max (${V.max ?? 'vacío'}) ⇒ no hay sucesor aquí.` });
		return null;
	}
	if (V.u === 2) {
		ev.push({ prof, donde, rango: r, msg: pre + `caso base u = 2 ⇒ devolver max = ${V.max}.` });
		return V.max;
	}
	const s = raiz(V.u),
		c = Math.floor(x / s),
		i = x % s;
	const cl = V.cluster![c];
	if (cl.max !== null && i < cl.max) {
		ev.push({ prof, donde, rango: r, resumen: prof === 0 ? c : undefined, msg: pre + `x = ⟨${c}, ${i}⟩. max del cluster ${c} = ${cl.max} > ${i} ⇒ el sucesor está en el cluster ${c}: UNA llamada, ahí.` });
		const y = sucesor(cl, i, base < 0 ? -1 : base + c * s, prof + 1, `cluster[${c}]`, ev)!;
		ev.push({ prof, donde, rango: r, msg: `Volvemos a ${donde}: ⟨${c}, ${y}⟩ = ${c}·${s} + ${y} = ${c * s + y}.` });
		return c * s + y;
	}
	ev.push({ prof, donde, rango: r, resumen: prof === 0 ? c : undefined, msg: pre + `x = ⟨${c}, ${i}⟩. El cluster ${c} ${cl.max === null ? 'está vacío' : `tiene max ${cl.max} ≤ ${i}`} ⇒ UNA llamada al resumen: sucesor de ${c}.` });
	const c2 = sucesor(V.summary!, c, -1, prof + 1, `summary`, ev);
	if (c2 === null) {
		ev.push({ prof, donde, rango: r, msg: 'El resumen no tiene sucesor ⇒ nulo.' });
		return null;
	}
	const m = V.cluster![c2].min!;
	ev.push({ prof, donde, rango: base < 0 ? r : [base + c2 * s, base + c2 * s + s - 1], resumen: prof === 0 ? c2 : undefined, msg: `${donde}: el siguiente cluster no vacío es ${c2}; su min = ${m} se lee en O(1) ⇒ ⟨${c2}, ${m}⟩ = ${c2 * s + m}.` });
	return c2 * s + m;
}

export default function VebSuccAnim() {
	const [x, setX] = useState(5);
	const { evs, res } = useMemo(() => {
		const ev: Ev[] = [];
		const res = sucesor(T, x, 0, 0, 'V', ev);
		ev.push({ prof: 0, donde: 'V', msg: `Sucesor(${x}) = ${res ?? 'nulo'}. Hubo a lo más una llamada recursiva por nivel: T(u) = T(√u) + O(1) = O(lg lg u) = O(lg w).` });
		return { evs: [{ prof: 0, donde: 'V', msg: `S = {${S.join(', ')}}. El min (2) se guarda aparte y NO entra en los clusters. Pulsa reproducir.` } as Ev, ...ev], res };
	}, [x]);
	const p = usePlayer(evs.length, 1700);
	const e = evs[p.i];
	const enS = (k: number) => S.includes(k) && k !== T.min;
	return (
		<div className="pg not-content">
			<h4>🎬 Animación: Sucesor en un árbol de van Emde Boas</h4>
			<p className="pg-sub">El ejemplo de la página, con u = 16. Fíjate en que cada nivel hace una sola llamada: al cluster o al resumen, nunca a ambos.</p>
			<div className="pg-row">
				<label className="pg-field">
					<span>Sucesor de x =</span>
					<select value={x} onChange={(ev) => (setX(+ev.target.value), p.go(0))}>
						{Array.from({ length: 16 }, (_, k) => (
							<option key={k}>{k}</option>
						))}
					</select>
				</label>
				<span className="an-chip">min = {T.min} · max = {T.max}</span>
				<span className="an-chip">resultado: {p.i === evs.length - 1 ? (res ?? 'nulo') : '?'}</span>
			</div>
			<div className="an-veb">
				<div className="an-sum">
					<span className="an-s">summary</span>
					{[0, 1, 2, 3].map((c) => (
						<motion.span key={c} className="an-pill" animate={{ scale: e.resumen === c ? 1.25 : 1 }} style={{ background: T.cluster![c].min !== null ? 'color-mix(in srgb, var(--pg-c4) 40%, transparent)' : undefined, outline: e.resumen === c ? '2px solid var(--sl-color-white)' : undefined }}>
							{c}
						</motion.span>
					))}
				</div>
				<div className="an-clusters">
					{[0, 1, 2, 3].map((c) => (
						<div key={c} className="an-cl">
							<span className="an-s">cluster[{c}]</span>
							<div>
								{[0, 1, 2, 3].map((i) => {
									const k = c * 4 + i;
									const lit = e.rango && e.rango[0] >= 0 && k >= e.rango[0] && k <= e.rango[1];
									return (
										<motion.span key={i} className="an-pill" animate={{ y: lit ? -3 : 0 }} style={{ background: enS(k) ? 'color-mix(in srgb, var(--pg-c1) 45%, transparent)' : undefined, outline: k === x ? '2px dashed var(--pg-c2)' : lit ? '2px solid var(--sl-color-white)' : undefined, opacity: lit || !e.rango || e.rango[0] < 0 ? 1 : 0.4 }}>
											{k}
										</motion.span>
									);
								})}
							</div>
						</div>
					))}
				</div>
			</div>
			<Nota k={`${x}-${p.i}`}>
				<span className="an-s">profundidad {e.prof} · </span>
				{e.msg}
			</Nota>
			<Controles p={p} />
		</div>
	);
}

