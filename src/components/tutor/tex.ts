import katex from 'katex';

const desescapar = (m: string) => m.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

export function tex(s: string | undefined): string {
	if (!s) return '';
	return s.replace(/\$([^$]+)\$/g, (_, m: string) =>
		katex.renderToString(desescapar(m), { throwOnError: false, output: 'html' }),
	);
}
