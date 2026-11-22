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
					label: '🎯 Examen final · 6 preguntas',
					items: [
						{ label: 'Qué entra en el final', slug: 'final', badge: { text: 'empieza', variant: 'danger' } },
						{ label: 'P1 · Cotas de Wilber', slug: 'optimalidad/wilber' },
						{ label: 'P2 · Modelo de memoria externa', slug: 'memoria/modelo-externo' },
						{ label: 'P3 · X-fast y Y-fast trees', slug: 'enteros/xfast-yfast' },
						{ label: 'P4 · Disjoint Sparse Table', slug: 'estaticos/disjoint-sparse-table', badge: { text: 'nuevo', variant: 'success' } },
						{ label: 'P5 · Aho–Corasick', slug: 'strings/aho-corasick' },
						{ label: 'P6 · Centroid Decomposition', slug: 'grafos/centroides' },
						{ label: 'Simulacro de las 6 preguntas', slug: 'repaso/final', badge: { text: 'examen', variant: 'tip' } },
					],
				},
				{
					label: 'Herramientas',
					items: [
						{ label: 'Modo rush · 6 preguntas', slug: 'rush', badge: { text: 'rush', variant: 'caution' } },
						{ label: 'Formulario de cotas', slug: 'formulario' },
						{ label: 'Tu progreso', slug: 'ruta' },
						{ label: 'Portada', slug: 'index' },
					],
				},
				{
					label: '🧱 Base que piden las 6',
					items: [
						{ label: 'Para P1 · Rectángulos independientes', slug: 'optimalidad/rectangulos' },
						{ label: 'Para P3 · Predecesor y vEB', slug: 'enteros/veb' },
						{ label: 'Para P4 · Sparse Table (RMQ)', slug: 'estaticos/rmq-lca' },
						{ label: 'Para P5 · Bordes y función prefijo', slug: 'strings/kmp' },
					],
				},
				{
					label: '⚪ No entra en el final',
					collapsed: true,
					items: [
						{ label: 'Tango Trees y Signed-Greedy', slug: 'optimalidad/tango' },
						{ label: 'B-Trees y cache-oblivious', slug: 'memoria/btree' },
						{ label: 'Layout de van Emde Boas', slug: 'memoria/layout-veb' },
						{ label: 'Packed-Memory Array', slug: 'memoria/pma' },
						{ label: 'Fusion trees', slug: 'enteros/fusion' },
						{ label: 'Heavy-Light', slug: 'grafos/heavy-light' },
						{ label: 'Suffix array y LCP', slug: 'strings/suffix-array' },
						{ label: 'DC3 y SA-IS', slug: 'strings/sa-lineal' },
						{ label: 'Suffix tree y Ukkonen', slug: 'strings/suffix-tree' },
						{ label: 'Simulacro general (todos los temas)', slug: 'repaso/simulacro' },
					],
				},
			],
		}),
		react(),
	],
});
