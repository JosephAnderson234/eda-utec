/** Plan rush: las 6 preguntas del final, en orden, con su base mínima. */
export type Bloque = { id: string; t: string; href: string; min: number; u: string; foco: string };

export const UNIDADES: Record<string, string> = {
	'0': 'Arranque',
	'1': 'P1 · Cotas de Wilber',
	'2': 'P2 · Memoria externa',
	'3': 'P3 · X-fast y Y-fast',
	'4': 'P4 · Disjoint Sparse Table',
	'5': 'P5 · Aho–Corasick',
	'6': 'P6 · Centroides',
	'7': 'Examen',
};

/** Solo las 6 preguntas anunciadas por el profesor, más la base mínima que cada una necesita. */
export const PLAN: Bloque[] = [
	{ id: 'arranque', t: 'Las 6 preguntas: qué te van a pedir', href: '/final/', min: 10, u: '0', foco: 'Saber qué sale y qué no' },
	{ id: 'rectangulos', t: 'Base: rectángulos independientes', href: '/optimalidad/rectangulos/', min: 15, u: '1', foco: 'Qué es OPT y por qué un piso' },
	{ id: 'wilber', t: 'Cotas de Wilber 1 y 2', href: '/optimalidad/wilber/', min: 35, u: '1', foco: 'Contar alternancias a mano' },
	{ id: 'modelo-externo', t: 'Modelo de memoria externa', href: '/memoria/modelo-externo/', min: 45, u: '2', foco: 'Escanear, buscar, ordenar, permutar' },
	{ id: 'veb', t: 'Base: predecesor y vEB', href: '/enteros/veb/', min: 25, u: '3', foco: 'El problema del predecesor' },
	{ id: 'xfast-yfast', t: 'X-fast y Y-fast', href: '/enteros/xfast-yfast/', min: 45, u: '3', foco: 'Hash por niveles + indirección' },
	{ id: 'rmq-lca', t: 'Base: Sparse Table', href: '/estaticos/rmq-lca/', min: 15, u: '4', foco: 'Dos ventanas solapadas' },
	{ id: 'disjoint-sparse-table', t: 'Disjoint Sparse Table', href: '/estaticos/disjoint-sparse-table/', min: 35, u: '4', foco: 'Nivel = bit más alto de l XOR r' },
	{ id: 'kmp', t: 'Base: bordes y función prefijo', href: '/strings/kmp/', min: 15, u: '5', foco: 'Qué es un borde' },
	{ id: 'aho-corasick', t: 'Aho–Corasick', href: '/strings/aho-corasick/', min: 45, u: '5', foco: 'Trie + enlaces de falla' },
	{ id: 'centroides', t: 'Descomposición por centroides', href: '/grafos/centroides/', min: 45, u: '6', foco: 'Profundidad lg n, separador' },
	{ id: 'simulacro-final', t: 'Simulacro de las 6 preguntas', href: '/repaso/final/', min: 60, u: '7', foco: 'Sin mirar; luego autocorrige' },
	{ id: 'cierre', t: 'Cierre: repasa solo lo que fallaste', href: '/final/', min: 15, u: '7', foco: 'Solo lo que fallaste' },
];

export const DESCANSO = 10;
export type Slot = (Bloque & { tipo: 'bloque'; inicio: number }) | { tipo: 'descanso'; inicio: number; min: number };

/** Inserta un descanso de 10 min cada vez que se acumulan 50 min de estudio. */
export function cronograma(): Slot[] {
	const out: Slot[] = [];
	let t = 0,
		acum = 0;
	PLAN.forEach((b, k) => {
		out.push({ ...b, tipo: 'bloque', inicio: t });
		t += b.min;
		acum += b.min;
		if (acum >= 50 && k < PLAN.length - 1) {
			out.push({ tipo: 'descanso', inicio: t, min: DESCANSO });
			t += DESCANSO;
			acum = 0;
		}
	});
	return out;
}

export const hhmm = (m: number) => `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}`;
export const TOTAL = (() => {
	const c = cronograma();
	const u = c[c.length - 1];
	return u.inicio + u.min;
})();
