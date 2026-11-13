import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Controles, Nota, usePlayer } from './Player';

type Paso = { i: number; q: number; ok: boolean | null; hallados: number[]; comp: number; nota: string };

function prefijo(p: string) {
	const pi = Array(p.length).fill(0);
	for (let i = 1, k = 0; i < p.length; i++) {
		while (k > 0 && p[i] !== p[k]) k = pi[k - 1];
		if (p[i] === p[k]) k++;
		pi[i] = k;
	}
	return pi;
}

function calcular(t: string, p: string): Paso[] {
	const pi = prefijo(p);
	const out: Paso[] = [{ i: 0, q: 0, ok: null, hallados: [], comp: 0, nota: `π(${p}) = [${pi.join(', ')}]. El índice i del texto nunca retrocede; solo se desliza el patrón.` }];
	if (!p.length) return out;
	const hallados: number[] = [];
	let q = 0,
		comp = 0;
	for (let i = 0; i < t.length; i++) {
		while (q > 0 && t[i] !== p[q]) {
			comp++;
			out.push({ i, q, ok: false, hallados: [...hallados], comp, nota: `T[${i}] = ${t[i]} ≠ P[${q}] = ${p[q]}. Falla: q ← π[${q - 1}] = ${pi[q - 1]}; el patrón salta ${q - pi[q - 1]} posiciones sin releer el texto.` });
			q = pi[q - 1];
		}
		comp++;
		const ok = t[i] === p[q];
		out.push({ i, q, ok, hallados: [...hallados], comp, nota: ok ? `T[${i}] = P[${q}] = ${t[i]}: coincide, q sube a ${q + 1}.` : `T[${i}] = ${t[i]} ≠ P[0]: q queda en 0 y avanzamos i.` });
		if (ok) q++;
		if (q === p.length) {
			hallados.push(i - p.length + 1);
			out.push({ i, q: q - 1, ok: true, hallados: [...hallados], comp, nota: `¡Ocurrencia en la posición ${i - p.length + 1}! Seguimos con q ← π[${q - 1}] = ${pi[q - 1]}, sin perder solapamientos.` });
			q = pi[q - 1];
		}
	}
	out.push({ i: t.length, q, ok: null, hallados, comp, nota: `Fin: ${comp} comparaciones para n = ${t.length} (cota 2n = ${2 * t.length}). Ocurrencias en: ${hallados.join(', ') || 'ninguna'}.` });
	return out;
}

export default function KmpAnim() {
	const [t, setT] = useState('abababacababaca');
	const [p, setP] = useState('ababaca');
	const ps = useMemo(() => calcular(t, p), [t, p]);
	const pl = usePlayer(ps.length, 900);
	const s = ps[pl.i];
	const off = s.i - s.q;
	const W = 34;
	return (
		<div className="pg not-content">
			<h4>🎬 Animación: KMP buscando sin retroceder</h4>
			<p className="pg-sub">Verde: ya coincide. Recuadro: la comparación actual. Rojo: falla, y el patrón salta según π.</p>
			<div className="pg-row">
				<label className="pg-field">
					<span>Texto T</span>
					<input type="text" value={t} maxLength={22} onChange={(e) => (setT(e.target.value), pl.go(0))} />
				</label>
				<label className="pg-field">
					<span>Patrón P</span>
					<input type="text" value={p} maxLength={10} onChange={(e) => (setP(e.target.value), pl.go(0))} />
				</label>
			</div>
			<div className="an-scroll">
				<div style={{ position: 'relative', width: (t.length + 1) * W, height: 112 }}>
					{[...t].map((c, k) => {
						const hit = s.hallados.some((h) => k >= h && k < h + p.length);
						return (
							<div key={k} className="an-kc" style={{ left: k * W, top: 0, borderColor: k === s.i && s.ok !== null ? 'var(--sl-color-white)' : undefined, background: hit ? 'color-mix(in srgb, var(--pg-c6) 30%, transparent)' : undefined }}>
								{c}
								<small>{k}</small>
							</div>
						);
					})}
					{s.i < t.length && (
						<motion.div style={{ position: 'absolute', top: 54 }} animate={{ left: off * W }} transition={{ type: 'spring', stiffness: 160, damping: 20 }}>
							{[...p].map((c, k) => (
								<div key={k} className="an-kc" style={{ left: k * W, top: 0, background: k < s.q ? 'color-mix(in srgb, var(--pg-ok) 35%, transparent)' : k === s.q && s.ok === false ? 'color-mix(in srgb, var(--pg-bad) 40%, transparent)' : k === s.q && s.ok ? 'color-mix(in srgb, var(--pg-ok) 60%, transparent)' : undefined, borderColor: k === s.q ? 'var(--sl-color-white)' : undefined }}>
									{c}
								</div>
							))}
						</motion.div>
					)}
				</div>
			</div>
			<p className="an-s" style={{ margin: 0 }}>
				comparaciones: <b>{s.comp}</b> · q = {s.q} · amarillo: ocurrencias encontradas
			</p>
			<Nota k={`${t}-${p}-${pl.i}`}>{s.nota}</Nota>
			<Controles p={pl} />
		</div>
	);
}
