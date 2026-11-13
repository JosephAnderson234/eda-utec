/** Plan rush: todo el final en menos de 12 horas, en el orden lineal de la ruta. */
export type Bloque = { id: string; t: string; href: string; min: number; u: string; foco: string };

export const UNIDADES: Record<string, string> = {
	'0': 'Arranque',
	'1': '1 · Optimalidad dinámica',
	'2': '2 · Jerarquía de memoria',
	'3': '3 · Enteros',
	'4': '4 · Árboles estáticos',
	'5': '5 · Grafos dinámicos',
	'6': '6 · Strings',
	'7': 'Examen',
};

export const PLAN: Bloque[] = [
	{ id: 'arranque', t: 'Formulario: lee las 6 tablas una vez', href: '/formulario/', min: 10, u: '0', foco: 'Saber qué cota va con qué modelo' },
	{ id: 'rectangulos', t: 'Rectángulos independientes', href: '/optimalidad/rectangulos/', min: 20, u: '1', foco: 'OPT ≥ |I| + ½·MIS' },
	{ id: 'wilber', t: 'Wilber 1 y 2', href: '/optimalidad/wilber/', min: 20, u: '1', foco: 'Contar alternancias' },
	{ id: 'tango', t: 'Tango y Signed-Greedy', href: '/optimalidad/tango/', min: 20, u: '1', foco: 'Por qué O(lg lg n)' },
	{ id: 'modelo-externo', t: 'Modelo de memoria externa', href: '/memoria/modelo-externo/', min: 30, u: '2', foco: 'Escanear, buscar, ordenar, permutar' },
	{ id: 'btree', t: 'B-Trees y cache-oblivious', href: '/memoria/btree/', min: 25, u: '2', foco: 'log_B N y el modelo sin B' },
	{ id: 'layout-veb', t: 'Layout vEB', href: '/memoria/layout-veb/', min: 30, u: '2', foco: 'Cortar la altura a la mitad' },
	{ id: 'pma', t: 'PMA y Order Maintenance', href: '/memoria/pma/', min: 25, u: '2', foco: 'Umbrales de densidad, O(lg² N)' },
	{ id: 'veb', t: 'Árbol de van Emde Boas', href: '/enteros/veb/', min: 45, u: '3', foco: 'Sucesor con una sola llamada' },
	{ id: 'xfast-yfast', t: 'X-fast y Y-fast', href: '/enteros/xfast-yfast/', min: 35, u: '3', foco: 'Hash por niveles + indirección' },
	{ id: 'fusion', t: 'Fusion trees', href: '/enteros/fusion/', min: 20, u: '3', foco: 'Sketch y O(log_w n)' },
	{ id: 'rmq-lca', t: 'RMQ, cartesian tree y LCA', href: '/estaticos/rmq-lca/', min: 55, u: '4', foco: 'Sparse Table + Euler tour' },
	{ id: 'heavy-light', t: 'Heavy-Light', href: '/grafos/heavy-light/', min: 40, u: '5', foco: 'Camino = O(lg n) rangos' },
	{ id: 'centroides', t: 'Centroides', href: '/grafos/centroides/', min: 35, u: '5', foco: 'Profundidad lg n, separador' },
	{ id: 'kmp', t: 'Función prefijo y KMP', href: '/strings/kmp/', min: 25, u: '6', foco: 'Calcular π a mano' },
	{ id: 'aho-corasick', t: 'Aho–Corasick', href: '/strings/aho-corasick/', min: 25, u: '6', foco: 'Enlaces de falla' },
	{ id: 'suffix-array', t: 'Suffix array y LCP', href: '/strings/suffix-array/', min: 30, u: '6', foco: 'SA y LCP de banana' },
	{ id: 'sa-lineal', t: 'DC3 y SA-IS', href: '/strings/sa-lineal/', min: 15, u: '6', foco: 'Solo la recurrencia y la idea' },
	{ id: 'suffix-tree', t: 'Suffix tree y Ukkonen', href: '/strings/suffix-tree/', min: 35, u: '6', foco: 'SA+LCP ⇔ árbol; reglas de Ukkonen' },
	{ id: 'simulacro', t: 'Simulacro cronometrado', href: '/repaso/simulacro/', min: 60, u: '7', foco: 'Sin mirar; luego autocorrige' },
	{ id: 'cierre', t: 'Cierre: repasa tus fallos y el formulario', href: '/formulario/', min: 15, u: '7', foco: 'Solo lo que fallaste' },
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
