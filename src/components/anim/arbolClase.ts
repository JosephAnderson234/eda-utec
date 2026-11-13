/** Árbol de 11 nodos de las diapositivas de Grafos dinámicos (raíz 1). */
export const NODOS = [
	{ v: 1, x: 370, y: 40, p: 0 },
	{ v: 2, x: 210, y: 105, p: 1 },
	{ v: 3, x: 490, y: 105, p: 1 },
	{ v: 4, x: 640, y: 105, p: 1 },
	{ v: 5, x: 120, y: 175, p: 2 },
	{ v: 6, x: 300, y: 175, p: 2 },
	{ v: 7, x: 490, y: 175, p: 3 },
	{ v: 8, x: 65, y: 245, p: 5 },
	{ v: 9, x: 170, y: 245, p: 5 },
	{ v: 10, x: 300, y: 245, p: 6 },
	{ v: 11, x: 490, y: 245, p: 7 },
];
export const N = NODOS.length;
export const padre: Record<number, number> = Object.fromEntries(NODOS.map((n) => [n.v, n.p]));
export const hijos: Record<number, number[]> = Object.fromEntries(NODOS.map((n) => [n.v, NODOS.filter((m) => m.p === n.v).map((m) => m.v)]));
export const xy = (v: number) => NODOS.find((n) => n.v === v)!;
export const vecinos = (v: number) => [...hijos[v], ...(padre[v] ? [padre[v]] : [])];

/** Descomposición Heavy-Light: tamaños, hijo pesado, tope, pos, profundidad. */
export function hld() {
	const sz: Record<number, number> = {};
	const prof: Record<number, number> = {};
	const pesado: Record<number, number> = {};
	const tope: Record<number, number> = {};
	const pos: Record<number, number> = {};
	const dfs1 = (v: number, d: number) => {
		prof[v] = d;
		sz[v] = 1;
		for (const h of hijos[v]) {
			dfs1(h, d + 1);
			sz[v] += sz[h];
			if (!pesado[v] || sz[h] > sz[pesado[v]]) pesado[v] = h;
		}
	};
	let t = 0;
	const dfs2 = (v: number, cab: number) => {
		tope[v] = cab;
		pos[v] = t++;
		if (pesado[v]) dfs2(pesado[v], cab);
		for (const h of hijos[v]) if (h !== pesado[v]) dfs2(h, h);
	};
	dfs1(1, 0);
	dfs2(1, 1);
	return { sz, prof, pesado, tope, pos };
}
