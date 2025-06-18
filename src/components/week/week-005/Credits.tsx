import {
	Layout,
	LayoutProps,
	nodeName,
	Rect,
	Txt,
	View2D,
} from '@motion-canvas/2d';
import { useScene } from '@motion-canvas/core';
import { useViewport } from '~/hooks/useViewport';
import { getSketchId, getViewportData } from '~/util';
import { WGTheme } from '~/util/themes';

export interface CreditsProps extends LayoutProps {
	/** @deprecated - Credits is able to retrieve this itself now */
	view?: View2D;
	/** @deprecated - Credits is able to retrieve this itself now */
	sketchId?: number;
	stroke?: string;
}

@nodeName('Week5Credits')
export class Week5Credits extends Layout {
	public constructor(props: CreditsProps) {
		super(props);

		const { stroke } = props;

		this.fontFamily('Outfit');

		const { name } = useScene();
		const { view, byOrientation } = useViewport();

		let sketchId = getSketchId(name);

		const txtProps = {
			fill: WGTheme.bubbleBg,
			stroke: stroke ?? '#444',
			lineWidth: 8,
			strokeFirst: true,
		};
		this.add(
			<Rect
				layout
				padding={[28, 50]}
				gap={24}
				bottom={[0, view.height() * 0.5 - byOrientation(60, 240)]}
				opacity={0.7}
			>
				<Txt
					text={`Sketch #${sketchId.toString().padStart(3, '0')}`}
					{...txtProps}
					fontWeight={250}
				/>
				<Txt text={`•`} {...txtProps} fontWeight={350} />
				<Txt text={`Bret Hudson`} {...txtProps} fontWeight={250} />
			</Rect>,
		);
	}
}
