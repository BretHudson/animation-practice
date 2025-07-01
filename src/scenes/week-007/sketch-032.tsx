import { Layout, makeScene2D, Node } from '@motion-canvas/2d';
import {
	all,
	createRef,
	makeRef,
	range,
	sequence,
	Vector2,
	waitFor,
} from '@motion-canvas/core';

import { File } from '~/components/week/week-007/File';
import { useViewport } from '~/hooks/useViewport';

import { useWeek7 } from '~/hooks/useWeek7';
import { allMap, positionItemInRow } from '~/util';

export default makeScene2D(function* (view) {
	const { byOrientation } = useViewport();
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

	const layout = createRef<Layout>();
	view.add(
		<Layout ref={layout} layout direction={'column'} gap={10}>
			{fileNames.map((fileName, i) => (
				<Node>
					<File ref={makeRef(files, i)} fileName={fileName} />
				</Node>
			))}
		</Layout>,
	);

	layout().save();
	files.forEach((f) => f.pre());

	yield* waitFor(0.1);

	const w = Math.max(...files.map((f) => f.txt().width()));
	files.forEach((f, i) => {
		f.txt().width(w);
		const abs = f.absolutePosition().add([0, i * 40]);
		f.reparent(view);
		f.absolutePosition(abs);
	});
	layout().alignItems('center');

	const cols = range(3).map(() => [] as File[]);
	const xx = byOrientation(500, 250);
	const yy = byOrientation(0, 300);
	const pos = range(3).map((i) => {
		return new Vector2(
			positionItemInRow(i, 3, xx),
			positionItemInRow(i, 3, yy) + 100,
		);
	});
	function* addToCol(item: File, index: number) {
		const arr = cols[index];
		const xOffset = positionItemInRow(arr.length, 2, 100, 50);
		const target = pos[index].addX(xOffset);
		arr.push(item);

		yield* item.position(target, 1);
	}

	yield* sequence(
		0.12,
		...files.map(function* (f, i) {
			let colIndex = 2;
			switch (f.fileName().split('.')[1]) {
				case 'js':
				case 'jsx':
					colIndex = 0;
					break;
				case 'ts':
				case 'tsx':
					colIndex = 1;
					break;
			}
			yield* all(f.hideText(), addToCol(f, colIndex));
		}),
	);

	yield* waitFor(0.5);

	yield* allMap(files, (f) => f.opacity(0, 0.3));

	files.forEach((f) => {
		f.reparent(layout());
		f.post();
	});
	layout().restore();

	yield* allMap(files, (f) => f.opacity(0).opacity(1, 0.3));

	yield* waitFor(0.2);
});
