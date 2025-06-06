import {
	Layout,
	LayoutProps,
	nodeName,
	type PossibleCanvasStyle,
	Txt,
	View2D,
} from '@motion-canvas/2d';
import { SimpleSignal } from '@motion-canvas/core';
import { getViewportData } from '~/util';
import { AoCTheme } from '~/util/themes';

export interface CreditsProps extends LayoutProps {
	view?: View2D;
	title?: string | SimpleSignal<string>;
	author: string | SimpleSignal<string>;
	fontFamily?: string;
	fontSize1?: number;
	fontSize2?: number;
	color1?: PossibleCanvasStyle;
	color2?: PossibleCanvasStyle;
}

@nodeName('Credits')
export class Credits extends Layout {
	public constructor(props: CreditsProps) {
		super(props);

		this.zIndex(1000);
		this.layout(true);
		this.direction('column');
		this.padding([12, 20]);

		this.add(
			<>
				<Txt
					text={props.title}
					fill={props.color1 ?? '#aaa'}
					fontFamily={props.fontFamily}
					fontSize={props.fontSize1}
				/>
				<Txt
					text={props.author}
					fill={props.color2 ?? '#efefef'}
					fontFamily={props.fontFamily}
					fontSize={props.fontSize2}
				/>
			</>,
		);
	}

	public static AoC(props: CreditsProps) {
		const credits = new Credits({
			...props,
			fontFamily: AoCTheme.fontFamily,
			fontSize1: 32,
			color1: AoCTheme.white,
			color2: AoCTheme.gray,
		});

		const { byOrientation } = getViewportData(props.view);
		credits.padding([byOrientation(12, 100), 20]);

		props.ref?.(credits);

		return credits;
	}
}
