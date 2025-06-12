import {
	Layout,
	nodeName,
	Rect,
	RectProps,
	signal,
	Txt,
} from '@motion-canvas/2d';
import {
	createSignal,
	easeInQuad,
	Reference,
	SimpleSignal,
} from '@motion-canvas/core';
import { WGTheme } from '~/util/themes';

export interface TableRowProps extends RectProps {
	label: string;
	value: SimpleSignal<number>;
	letterSpacing?: number;
}

@nodeName('TableRow')
export class TableRow extends Layout {
	txt: Reference<Txt>;

	@signal()
	public declare readonly label: SimpleSignal<string, this>;

	@signal()
	public declare readonly value: SimpleSignal<number, this>;

	constructor(props: TableRowProps) {
		super(props);

		const { label, value, letterSpacing } = props;

		// this.value(value);

		const labelFill = '8fbcbb';
		const valueNumberFill = 'b48ead';
		const valueStringFill = 'a3be8c';
		const tableStroke = '#888';
		const tableLineWidth = 3;
		const rectProps = {
			stroke: tableStroke,
			lineWidth: tableLineWidth,
			alignItems: 'center',
			justifyContent: 'center',
			minWidth: 150,
		} as const;
		const txtProps = {
			fill: WGTheme.bubbleBg,
			// fill: WGTheme.bubbleBg,
			padding: 12,
			fontSize: 36,
		};

		const i = createSignal(() => Math.round(value()).toString());
		// TODO(bret): maybe a createEffect here?
		const o = createSignal(() => {
			const off = Math.abs(value() - Math.round(value()));
			return easeInQuad(1 - off * 2);
		});

		this.add(
			<>
				<Rect {...rectProps}>
					<Txt
						text={label}
						letterSpacing={letterSpacing}
						paddingLeft={letterSpacing}
						{...txtProps}
						fill={labelFill}
					/>
				</Rect>
				<Rect {...rectProps}>
					<Txt
						text={i}
						letterSpacing={0}
						opacity={o}
						{...txtProps}
						fill={valueNumberFill}
					/>
				</Rect>
			</>,
		);
	}
}
