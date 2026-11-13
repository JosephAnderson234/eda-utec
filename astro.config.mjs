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
						{ label: 'Modo rush · 12 h', slug: 'rush', badge: { text: 'rush', variant: 'danger' } },
						{ label: 'Mapa del final', slug: 'index' },
						{ label: 'Ruta de estudio y tu progreso', slug: 'ruta', badge: { text: 'orden', variant: 'caution' } },
						{ label: 'Formulario de cotas', slug: 'formulario' },
					],
				},
				{
					label: '1 · Optimalidad dinámica · 1 h',
					items: [
						{ label: '1. Rectángulos independientes', slug: 'optimalidad/rectangulos' },
						{ label: '2. Cotas de Wilber 1 y 2', slug: 'optimalidad/wilber' },
						{ label: '3. Tango Trees y Signed-Greedy', slug: 'optimalidad/tango' },
					],
				},
				{
					label: '2 · Jerarquía de memoria · 1 h 50',
					items: [
						{ label: '4. Modelo de memoria externa', slug: 'memoria/modelo-externo' },
						{ label: '5. B-Trees y cache-oblivious', slug: 'memoria/btree' },
						{ label: '6. Layout de van Emde Boas', slug: 'memoria/layout-veb' },
						{ label: '7. Packed-Memory Array y Order Maintenance', slug: 'memoria/pma' },
					],
				},
				{
					label: '3 · Enteros · 1 h 40',
					items: [
						{ label: '8. Predecesor y árbol de van Emde Boas', slug: 'enteros/veb' },
						{ label: '9. X-fast y Y-fast trees', slug: 'enteros/xfast-yfast' },
						{ label: '10. Fusion trees', slug: 'enteros/fusion' },
					],
				},
				{
					label: '4 · Árboles estáticos · 55 min',
					items: [{ label: '11. RMQ, cartesian tree y LCA', slug: 'estaticos/rmq-lca' }],
				},
				{
					label: '5 · Grafos dinámicos · 1 h 15',
					items: [
						{ label: '12. Heavy-Light', slug: 'grafos/heavy-light' },
						{ label: '13. Descomposición por centroides', slug: 'grafos/centroides' },
					],
				},
				{
					label: '6 · Strings · 2 h 10',
					items: [
						{ label: '14. Bordes, función prefijo y KMP', slug: 'strings/kmp' },
						{ label: '15. Trie y Aho–Corasick', slug: 'strings/aho-corasick' },
						{ label: '16. Suffix array y LCP', slug: 'strings/suffix-array' },
						{ label: '17. Construcción lineal: DC3 y SA-IS', slug: 'strings/sa-lineal' },
						{ label: '18. Suffix tree y Ukkonen', slug: 'strings/suffix-tree' },
					],
				},
				{
					label: 'Examen · 1 h 15',
					items: [{ label: '19. Simulacro del final', slug: 'repaso/simulacro', badge: { text: 'examen', variant: 'tip' } }],
				},
			],
		}),
		react(),
	],
});
