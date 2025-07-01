import {
	Icon,
	Layout,
	LayoutProps,
	makeScene2D,
	Node,
	nodeName,
	signal,
	Txt,
} from '@motion-canvas/2d';
import {
	all,
	createRef,
	createSignal,
	DEFAULT,
	easeOutQuad,
	makeRef,
	map,
	sequence,
	SimpleSignal,
	waitFor,
} from '@motion-canvas/core';

import { useWeek7 } from '~/hooks/useWeek7';
import { allMap } from '~/util';
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

	public readonly icon = createRef<Icon>();
	public readonly txt = createRef<Txt>();

	constructor(props: FileProps) {
		super(props);

		this.layout(true);
		this.alignItems('center');
		this.gap(8);

		const icon = createSignal(() => {
			const ext = this.fileName().split('.')[1].toUpperCase() as IconKey;
			return icons[ext] ?? icons.OTHER;
		});

		this.add(
			<Icon ref={this.icon} icon={icon} stroke={WGTheme.bubbleBg} size={70} />,
		);
		this.add(
			<Txt
				ref={this.txt}
				text={this.fileName}
				fontFamily={'Source Code Pro'}
				fill={WGTheme.bubbleBg}
			/>,
		);
	}

	*hideText() {
		const icon = this.icon();
		const txt = this.txt();

		const t = createSignal(0);
		const startW = txt.width();
		const newScale = 2;

		txt.opacity(createSignal(() => 1 - t()));
		txt.width(createSignal(() => map(startW, 0, t())));
		icon.scale(createSignal(() => map(1, newScale, t())));

		const dur = 1;
		yield* all(t(1, dur), this.gap(0, dur));

		const size = icon.size();
		icon.size(size.scale(newScale));
		icon.scale(1);
	}

	pre() {
		this.save();
		this.icon().save();
		this.txt().save();
		this.txt().opacity.save();
	}

	post() {
		this.restore();
		this.icon().restore();
		this.txt().restore();
	}
}
