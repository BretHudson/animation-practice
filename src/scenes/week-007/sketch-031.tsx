import {
	Icon,
	makeScene2D,
	nodeName,
	Node,
	NodeProps,
	signal,
	LayoutProps,
	Layout,
	Txt,
} from '@motion-canvas/2d';
import {
	all,
	createSignal,
	makeRef,
	sequence,
	SimpleSignal,
	waitFor,
} from '@motion-canvas/core';

import { useWeek7 } from '~/hooks/useWeek7';
import { allMap, positionItemInRow } from '~/util';
import { WGTheme } from '~/util/themes';

const icons = {
	JS: 'tabler:file-type-js',
	JSX: 'tabler:file-type-jsx',
	TS: 'tabler:file-type-ts',
	TSX: 'tabler:file-type-tsx',
	XML: 'tabler:file-type-xml',
	OTHER: 'tabler:file',
} as const;

type IconKey = keyof typeof icons;

interface FileProps extends LayoutProps {
	fileName: string;
}

@nodeName('File')
export class File extends Layout {
	@signal()
	public declare readonly fileName: SimpleSignal<IconKey, this>;

	constructor(props: FileProps) {
		super(props);

		this.layout(true);
		this.alignItems('center');
		this.gap(8);

		const icon = createSignal(() => {
			const ext = this.fileName().split('.')[1].toUpperCase() as IconKey;
			return icons[ext] ?? icons.OTHER;
		});

		this.add(<Icon icon={icon} stroke={WGTheme.bubbleBg} size={70} />);
		this.add(
			<Txt
				text={this.fileName}
				fontFamily={'Source Code Pro'}
				fill={WGTheme.bubbleBg}
			/>,
		);
	}
}

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
