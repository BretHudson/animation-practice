import {
	Layout,
	LayoutProps,
	nodeName,
	Txt,
	TxtProps,
	View2D,
} from '@motion-canvas/2d';
import {
	createRef,
	createSignal,
	useScene,
	Vector2,
} from '@motion-canvas/core';
import { useViewport } from '~/hooks/useViewport';
import { getSketchId } from '~/util';
import { WGTheme } from '~/util/themes';

export interface CreditsProps extends LayoutProps {
	coauthor?: string;
	stroke?: string;
	lineWidth?: number;
}

@nodeName('Week7Credits')
export class Week7Credits extends Layout {
	public sketchTxt = createRef<Txt>();
	public authorTxt = createRef<Txt>();
	public coauthorTxt = createRef<Txt>();

	public constructor(props: CreditsProps) {
		super(props);

		this.fontFamily('Outfit');

		const { name } = useScene();
		const { view, portrait } = useViewport();

		const sketchId = getSketchId(name);

		this.width(view.width());
		this.height(view.height());
		this.padding([50, 50]);

		this.textAlign('left');

		const anchor = createSignal(new Vector2());

		this.add(
			<Txt
				text={`Sketch #${sketchId.toString().padStart(3, '0')}`}
				ref={this.sketchTxt}
				fontFamily={'Outfit'}
				fill={WGTheme.bubbleBg}
				fontWeight={600}
				topRight={anchor}
				stroke={props.stroke}
				lineWidth={props.lineWidth}
				strokeFirst
			/>,
		);

		const author = `Bret Hudson` + (props.coauthor ? ' &' : '');
		this.add(
			<Txt
				text={author}
				ref={this.authorTxt}
				fontWeight={props.stroke ? 400 : 200}
				fontFamily={'Outfit'}
				fill={props.stroke ?? WGTheme.bubbleBg}
				fontSize={this.sketchTxt().fontSize() * 0.85}
				topRight={this.sketchTxt().bottomRight}
			/>,
		);

		if (props.coauthor) {
			this.add(
				<Txt
					text={props.coauthor}
					ref={this.coauthorTxt}
					fontWeight={props.stroke ? 400 : 200}
					fontFamily={'Outfit'}
					fill={props.stroke ?? WGTheme.bubbleBg}
					fontSize={this.sketchTxt().fontSize() * 0.85}
					topRight={this.authorTxt().bottomRight}
				/>,
			);
		}

		const size = new Vector2(view.width(), -view.height());
		const anchorOffset = size.scale(portrait ? -0.05 : -0.025);
		if (portrait) {
			anchorOffset.y = view.height() * 0.15;
		}
		anchor(size.scale(0.5).add(anchorOffset));
	}
}
