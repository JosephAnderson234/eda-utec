import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cronograma, hhmm, TOTAL, UNIDADES } from './plan';
import { load, save } from '../ui/storage';

const SLOTS = cronograma();
const BLOQUES = SLOTS.filter((s) => s.tipo === 'bloque') as Extract<(typeof SLOTS)[number], { tipo: 'bloque' }>[];
const COLU: Record<string, string> = { '0': 'var(--pg-muted)', '1': 'var(--pg-c1)', '2': 'var(--pg-c2)', '3': 'var(--pg-c3)', '4': 'var(--pg-c4)', '5': 'var(--pg-c5)', '6': 'var(--pg-c6)', '7': 'var(--sl-color-accent)' };

const reloj = (base: string, m: number) => {
	const [h, mi] = base.split(':').map(Number);
	const t = (h * 60 + mi + m) % (24 * 60);
	return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
};

export default function RushPlan() {
	const [hecho, setHecho] = useState<string[]>(() => load('rush:hecho', []));
	const [inicio, setInicio] = useState<string>(() => load('rush:inicio', '08:00'));
	const [resta, setResta] = useState<number | null>(null);
	const [corre, setCorre] = useState(false);
	useEffect(() => save('rush:hecho', hecho), [hecho]);
	useEffect(() => save('rush:inicio', inicio), [inicio]);
	const actual = BLOQUES.find((b) => !hecho.includes(b.id));
	useEffect(() => {
		setResta(actual ? actual.min * 60 : null);
		setCorre(false);
	}, [actual?.id]);
	useEffect(() => {
		if (!corre || resta === null) return;
		if (resta <= 0) {
			setCorre(false);
			return;
		}
		const t = setTimeout(() => setResta((r) => (r ?? 0) - 1), 1000);
		return () => clearTimeout(t);
	}, [corre, resta]);
	const minHechos = useMemo(() => BLOQUES.filter((b) => hecho.includes(b.id)).reduce((a, b) => a + b.min, 0), [hecho]);
	const minTotal = BLOQUES.reduce((a, b) => a + b.min, 0);
	const pct = (minHechos / minTotal) * 100;
	const toggle = (id: string) => setHecho((h) => (h.includes(id) ? h.filter((x) => x !== id) : [...h, id]));
	let uPrev = '';
	return (
		<div className="pg not-content rush-plan">
			<h4>⏱️ Tu cronograma rush ({hhmm(TOTAL)} con descansos)</h4>
			<p className="pg-sub">Pon la hora a la que empiezas. Marca cada bloque al terminarlo: el siguiente se ilumina y su temporizador queda listo. Se guarda en este navegador.</p>
			<div className="pg-row" style={{ alignItems: 'center' }}>
				<label className="pg-field">
					<span>Empiezo a las</span>
					<input type="time" value={inicio} onChange={(e) => setInicio(e.target.value || '08:00')} />
				</label>
				<span className="an-chip">
					termino ≈ <b>{reloj(inicio, TOTAL)}</b>
				</span>
				<span className="an-chip">
					{hecho.length}/{BLOQUES.length} bloques · {hhmm(minHechos)} de {hhmm(minTotal)} de estudio
				</span>
				<button onClick={() => setHecho([])}>Reiniciar</button>
			</div>
			<div className="an-bar" style={{ height: 10 }}>
				<motion.div className="an-bar__in" animate={{ width: `${pct}%` }} transition={{ type: 'spring', stiffness: 80, damping: 18 }} />
			</div>
			<AnimatePresence mode="wait">
				{actual && (
					<motion.div key={actual.id} className="rush-now" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ borderColor: COLU[actual.u] }}>
						<div>
							<span className="an-s">AHORA · {UNIDADES[actual.u]}</span>
							<p style={{ margin: 0 }}>
								<a href={actual.href}>
									<b>{actual.t}</b>
								</a>{' '}
								— {actual.foco}
							</p>
						</div>
						<div className="rush-timer">
							<span>{resta !== null ? `${Math.floor(resta / 60)}:${String(resta % 60).padStart(2, '0')}` : ''}</span>
							<button className="primary" onClick={() => setCorre(!corre)}>
								{corre ? '⏸' : '▶ Empezar'}
							</button>
							<button onClick={() => toggle(actual.id)}>✓ Hecho</button>
						</div>
					</motion.div>
				)}
				{!actual && (
					<motion.p key="fin" className="pg-note" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
						🎉 Plan completo. Duerme: dormir consolida lo que repasaste más que una hora extra de lectura.
					</motion.p>
				)}
			</AnimatePresence>
			<ol className="rush-list">
				{SLOTS.map((s, k) => {
					if (s.tipo === 'descanso')
						return (
							<li key={k} className="rush-break">
								<span className="rush-hora">{reloj(inicio, s.inicio)}</span> ☕ descanso de {s.min} min: levántate, agua, nada de pantalla
							</li>
						);
					const cab = s.u !== uPrev;
					uPrev = s.u;
					const ok = hecho.includes(s.id);
					const es = actual?.id === s.id;
					return (
						<li key={k} className={`rush-item${ok ? ' ok' : ''}${es ? ' now' : ''}`} style={{ borderLeftColor: COLU[s.u] }}>
							{cab && <span className="rush-u" style={{ color: COLU[s.u] }}>{UNIDADES[s.u]}</span>}
							<label>
								<input type="checkbox" checked={ok} onChange={() => toggle(s.id)} />
								<span className="rush-hora">{reloj(inicio, s.inicio)}</span>
								<a href={s.href}>{s.t}</a>
								<span className="rush-min">{s.min} min</span>
							</label>
							<span className="an-s rush-foco">{s.foco}</span>
						</li>
					);
				})}
			</ol>
		</div>
	);
}
