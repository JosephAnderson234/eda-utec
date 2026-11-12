export type Tema = { id: string; t: string; href: string; u: string; peso: 1 | 2 | 3 };

/** Temas del final de CS3014; `peso` es una estimación propia de cuánto pesa en el examen (3 = central, 1 = de apoyo). */
export const TEMAS: Tema[] = [
	{ id: 'rectangulos', t: 'Rectángulos independientes', href: '/optimalidad/rectangulos/', u: '1', peso: 2 },
	{ id: 'wilber', t: 'Cotas de Wilber 1 y 2', href: '/optimalidad/wilber/', u: '1', peso: 2 },
	{ id: 'tango', t: 'Tango Trees y Signed-Greedy', href: '/optimalidad/tango/', u: '1', peso: 2 },
	{ id: 'modelo-externo', t: 'Modelo de memoria externa', href: '/memoria/modelo-externo/', u: '2', peso: 3 },
	{ id: 'btree', t: 'B-Trees y cache-oblivious', href: '/memoria/btree/', u: '2', peso: 3 },
	{ id: 'layout-veb', t: 'Layout de van Emde Boas', href: '/memoria/layout-veb/', u: '2', peso: 3 },
	{ id: 'pma', t: 'Packed-Memory Array y Order Maintenance', href: '/memoria/pma/', u: '2', peso: 2 },
	{ id: 'veb', t: 'Árbol de van Emde Boas', href: '/enteros/veb/', u: '3', peso: 3 },
	{ id: 'xfast-yfast', t: 'X-fast y Y-fast trees', href: '/enteros/xfast-yfast/', u: '3', peso: 3 },
	{ id: 'fusion', t: 'Fusion trees', href: '/enteros/fusion/', u: '3', peso: 2 },
	{ id: 'rmq-lca', t: 'RMQ, cartesian tree y LCA', href: '/estaticos/rmq-lca/', u: '4', peso: 3 },
	{ id: 'heavy-light', t: 'Heavy-Light', href: '/grafos/heavy-light/', u: '5', peso: 3 },
	{ id: 'centroides', t: 'Descomposición por centroides', href: '/grafos/centroides/', u: '5', peso: 3 },
	{ id: 'kmp', t: 'Función prefijo y KMP', href: '/strings/kmp/', u: '6', peso: 3 },
	{ id: 'aho-corasick', t: 'Trie y Aho–Corasick', href: '/strings/aho-corasick/', u: '6', peso: 3 },
	{ id: 'suffix-array', t: 'Suffix array y LCP', href: '/strings/suffix-array/', u: '6', peso: 3 },
	{ id: 'sa-lineal', t: 'DC3 y SA-IS', href: '/strings/sa-lineal/', u: '6', peso: 2 },
	{ id: 'suffix-tree', t: 'Suffix tree y Ukkonen', href: '/strings/suffix-tree/', u: '6', peso: 3 },
];

export const NIVELES = [
	'No lo reconozco o lo confundo con otro tema',
	'Lo entiendo leyendo, pero no lo aplico solo',
	'Resuelvo ejercicios parecidos a los vistos, con alguna pista',
	'Resuelvo uno nuevo sin ayuda y justifico cada paso',
	'Lo transfiero: comparo alternativas y veo casos límite',
];

/** Días hasta el próximo repaso según el nivel (repaso espaciado). */
export const INTERVALO = [0, 1, 2, 4, 7];

export type Registro = { nivel: number; fecha: string };
export const clave = (id: string) => `dominio:${id}`;

export function proximo(r: Registro): Date {
	const d = new Date(r.fecha);
	d.setDate(d.getDate() + INTERVALO[r.nivel]);
	return d;
}
