import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';

export type Player = ReturnType<typeof usePlayer>;

/** Reproductor de pasos: avanza solo con ▶, o a mano con ◀ ▶. */
export function usePlayer(n: number, ms = 1200) {
	const [i, setI] = useState(0);
	const [on, setOn] = useState(false);
	const [vel, setVel] = useState(1);
	const last = Math.max(0, n - 1);
	useEffect(() => {
		if (i > last) setI(0);
	}, [n]);
	useEffect(() => {
		if (!on) return;
		if (i >= last) {
			setOn(false);
			return;
		}
		const t = setTimeout(() => setI((x) => Math.min(x + 1, last)), ms / vel);
		return () => clearTimeout(t);
	}, [on, i, last, ms, vel]);
	return {
		i: Math.min(i, last),
		n,
		on,
		vel,
		setVel,
		go: (k: number) => {
			setOn(false);
			setI(Math.max(0, Math.min(k, last)));
		},
		toggle: () => {
			if (!on && i >= last) setI(0);
			setOn(!on);
		},
	};
}

export function Controles({ p, children }: { p: Player; children?: ReactNode }) {
	const pct = p.n > 1 ? (p.i / (p.n - 1)) * 100 : 100;
	return (
		<div className="an-ctl">
			<div className="pg-row" style={{ alignItems: 'center' }}>
				<button className="primary" onClick={p.toggle} aria-label={p.on ? 'Pausar' : 'Reproducir'}>
					{p.on ? '⏸ Pausa' : p.i >= p.n - 1 && p.n > 1 ? '↺ Otra vez' : '▶ Reproducir'}
				</button>
				<button onClick={() => p.go(p.i - 1)} disabled={p.i === 0} aria-label="Paso anterior">
					◀
				</button>
				<button onClick={() => p.go(p.i + 1)} disabled={p.i >= p.n - 1} aria-label="Paso siguiente">
					▶
				</button>
				<button onClick={() => p.go(0)} aria-label="Reiniciar">
					⏮
				</button>
				<span className="pg-seg" role="group" aria-label="Velocidad">
					{[0.5, 1, 2].map((v) => (
						<button key={v} className={p.vel === v ? 'active' : ''} onClick={() => p.setVel(v)}>
							{v}×
						</button>
					))}
				</span>
				{children}
				<span className="an-cnt">
					paso {p.i}/{p.n - 1}
				</span>
			</div>
			<div className="an-bar">
				<motion.div className="an-bar__in" animate={{ width: `${pct}%` }} transition={{ duration: 0.35 }} />
			</div>
		</div>
	);
}

/** Texto explicativo del paso actual, con entrada animada. */
export function Nota({ k, children }: { k: string | number; children: ReactNode }) {
	return (
		<motion.p
			key={k}
			className="pg-note"
			initial={{ opacity: 0, y: 6 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
		>
			{children}
		</motion.p>
	);
}

export const COL = ['var(--pg-c1)', 'var(--pg-c2)', 'var(--pg-c3)', 'var(--pg-c4)', 'var(--pg-c5)', 'var(--pg-c6)'];
