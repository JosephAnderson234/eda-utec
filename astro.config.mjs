// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
	outDir: process.env.ASTRO_OUT || './dist',
	cacheDir: process.env.ASTRO_CACHE || './node_modules/.astro',
	markdown: {
		processor: unified({
			remarkPlugins: [remarkMath],
			rehypePlugins: [[rehypeKatex, { strict: false }]],
		}),
	},
	integrations: [
		starlight({
			title: 'CS3014 · EDA Avanzadas',
			description: 'Web de estudio del final de Estructuras de Datos Avanzadas (UTEC, 2026-2): optimalidad dinámica, memoria, enteros, árboles estáticos, grafos dinámicos y strings.',
			locales: { root: { label: 'Español', lang: 'es' } },
			customCss: ['@fontsource-variable/inter', '@fontsource-variable/jetbrains-mono', 'katex/dist/katex.min.css', './src/styles/custom.css', './src/styles/svgfig.css'],
			components: { Head: './src/components/Head.astro' },
			pagination: true,
			tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 2 },
			expressiveCode: { themes: ['github-dark-dimmed', 'github-light'], styleOverrides: { borderRadius: '12px' } },
			sidebar: [
				{
					label: 'Inicio',
					items: [
						{ label: 'Mapa del final', slug: 'index' },
						{ label: 'Ruta de estudio y tu progreso', slug: 'ruta', badge: { text: 'empieza aquí', variant: 'caution' } },
						{ label: 'Formulario de cotas', slug: 'formulario' },
					],
				},
				{
					label: '1 · Optimalidad dinámica (sem. 9)',
					items: [
						{ label: 'Rectángulos independientes', slug: 'optimalidad/rectangulos' },
						{ label: 'Cotas de Wilber 1 y 2', slug: 'optimalidad/wilber' },
						{ label: 'Tango Trees y Signed-Greedy', slug: 'optimalidad/tango' },
					],
				},
				{
					label: '2 · Jerarquía de memoria (sem. 10–11)',
					items: [
						{ label: 'Modelo de memoria externa', slug: 'memoria/modelo-externo' },
						{ label: 'B-Trees y cache-oblivious', slug: 'memoria/btree' },
						{ label: 'Layout de van Emde Boas', slug: 'memoria/layout-veb' },
						{ label: 'Packed-Memory Array y Order Maintenance', slug: 'memoria/pma' },
					],
				},
				{
					label: '3 · Enteros (sem. 11–12)',
					items: [
						{ label: 'Predecesor y árbol de van Emde Boas', slug: 'enteros/veb' },
						{ label: 'X-fast y Y-fast trees', slug: 'enteros/xfast-yfast' },
						{ label: 'Fusion trees', slug: 'enteros/fusion' },
					],
				},
				{
					label: '4 · Árboles estáticos (sem. 12)',
					items: [{ label: 'RMQ, cartesian tree y LCA', slug: 'estaticos/rmq-lca' }],
				},
				{
					label: '5 · Grafos dinámicos (sem. 14)',
					items: [
						{ label: 'Heavy-Light', slug: 'grafos/heavy-light' },
						{ label: 'Descomposición por centroides', slug: 'grafos/centroides' },
					],
				},
				{
					label: '6 · Strings (sem. 12–13)',
					items: [
						{ label: 'Bordes, función prefijo y KMP', slug: 'strings/kmp' },
						{ label: 'Trie y Aho–Corasick', slug: 'strings/aho-corasick' },
						{ label: 'Suffix array y LCP', slug: 'strings/suffix-array' },
						{ label: 'Construcción lineal: DC3 y SA-IS', slug: 'strings/sa-lineal' },
						{ label: 'Suffix tree y Ukkonen', slug: 'strings/suffix-tree' },
					],
				},
				{
					label: 'Repaso',
					items: [{ label: 'Simulacro del final', slug: 'repaso/simulacro', badge: { text: 'examen', variant: 'tip' } }],
				},
			],
		}),
		react(),
	],
});
