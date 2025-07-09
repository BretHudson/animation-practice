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
}

@nodeName('Week7Credits')
export class Week7Credits extends Layout {
	public constructor(props: CreditsProps) {
		super(props);

		this.fontFamily('Outfit');

		const { name } = useScene();
		const { view, portrait } = useViewport();

		const sketchId = getSketchId(name);

		this.width(view.width());
		this.height(view.height());
		this.padding([50, 50]);

		const sketchTxt = createRef<Txt>();
		const authorTxt = createRef<Txt>();

		this.textAlign('left');

		const anchor = createSignal(new Vector2());

		this.add(
			<Txt
				text={`Sketch #${sketchId.toString().padStart(3, '0')}`}
				ref={sketchTxt}
				fontFamily={'Outfit'}
				fill={WGTheme.bubbleBg}
				fontWeight={600}
				topRight={anchor}
			/>,
		);

		const author = `Bret Hudson` + (props.coauthor ? ' &' : '');
		this.add(
			<Txt
				text={author}
				ref={authorTxt}
				fontWeight={200}
				fontFamily={'Outfit'}
				fill={WGTheme.bubbleBg}
				fontSize={sketchTxt().fontSize() * 0.85}
				topRight={sketchTxt().bottomRight}
			/>,
		);

		if (props.coauthor) {
			this.add(
				<Txt
					text={props.coauthor}
					ref={authorTxt}
					fontWeight={200}
					fontFamily={'Outfit'}
					fill={WGTheme.bubbleBg}
					fontSize={sketchTxt().fontSize() * 0.85}
					topRight={authorTxt().bottomRight}
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
