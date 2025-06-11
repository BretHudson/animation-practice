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
	view: View2D;
	/** @deprecated - Credits is able to retrieve this itself now */
	sketchId?: number;
}

@nodeName('Week4Credits')
export class Week4Credits extends Layout {
	public constructor(props: CreditsProps) {
		super(props);

		const { name } = useScene();
		const { view, byOrientation } = useViewport();

		let sketchId = getSketchId(name);

		this.add(
			<Rect
				layout
				padding={[28, 50]}
				gap={24}
				bottom={[0, view.height() * 0.5 - byOrientation(60, 240)]}
			>
				<Txt
					text={`Sketch #${sketchId.toString().padStart(3, '0')}`}
					fill={WGTheme.bubbleBg}
					fontWeight={250}
				/>
				<Txt text={`•`} fill={WGTheme.bubbleBg} fontWeight={350} />
				<Txt text={`Bret Hudson`} fill={WGTheme.bubbleBg} fontWeight={250} />
			</Rect>,
		);
	}
}
