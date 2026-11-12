import katex from 'katex';

export function tex(s: string | undefined): string {
	if (!s) return '';
	return s.replace(/\$([^$]+)\$/g, (_, m: string) =>
		katex.renderToString(m, { throwOnError: false, output: 'html' }),
	);
}
