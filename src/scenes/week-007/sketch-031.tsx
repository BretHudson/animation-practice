import { Layout, makeScene2D, Node } from '@motion-canvas/2d';
import { all, makeRef, sequence, waitFor } from '@motion-canvas/core';

import { File } from '~/components/week/week-007/File';
import { useWeek7 } from '~/hooks/useWeek7';
import { allMap } from '~/util';

export default makeScene2D(function* (view) {
	useWeek7();

	const fileNames = [
		'.gitignore',
		'components/input.jsx',
		'components/form.tsx',
		'index.js',
		'types.ts',
		'sitemap.xml',
	];

	const files: File[] = [];

	view.add(
		<Layout layout direction={'column'} gap={10}>
			{fileNames.map((fileName, i) => (
				<Node>
					<File ref={makeRef(files, i)} fileName={fileName} />
				</Node>
			))}
		</Layout>,
	);

	files.forEach((f) => f.opacity(0));

	yield* waitFor(0.1);

	yield* sequence(
		0.12,
		...files.map(function* (f) {
			yield* all(
				//
				f.opacity(1, 0.3),
				f.parent().x(16).x(0, 0.3),
			);
		}),
	);

	const jsFiles = [files[1], files[3]];
	const tsFiles = [files[2], files[4]];

	function* highlightFiles(target = files) {
		yield* allMap(files, (file) => {
			const opacity = target.includes(file) ? 1 : 0.5;
			return file.opacity(opacity, 0.3);
		});
	}

	yield* highlightFiles(jsFiles);
	yield* waitFor(0.5);
	yield* highlightFiles(tsFiles);
	yield* waitFor(0.5);
	yield* highlightFiles();

	yield* sequence(
		0.12,
		...files.map(function* (f) {
			yield* all(
				//
				f.opacity(0, 0.3),
				f.parent().y(-8, 0.3),
			);
		}),
	);

	yield* waitFor(0.5);
});
