import {
	Layout,
	LayoutProps,
	nodeName,
	Rect,
	Txt,
	View2D,
} from '@motion-canvas/2d';
import { getViewportData } from '~/util';
import { WGTheme } from '~/util/themes';

export interface CreditsProps extends LayoutProps {
	view: View2D;
	sketchId: number;
}

@nodeName('Week3Credits')
export class Week3Credits extends Layout {
	public constructor(props: CreditsProps) {
		super(props);

		const { view, sketchId } = props;

		const { byOrientation } = getViewportData(view);
		this.add(
			<Rect
				layout
				padding={[28, 50]}
				gap={24}
				bottom={[0, view.height() * 0.5 - byOrientation(60, 240)]}
			>
				<Txt
					text={`Sketch #${sketchId.toString().padStart(3, '0')}`.toUpperCase()}
					fill={WGTheme.bubbleBg}
					fontWeight={250}
				/>
				<Txt text={`•`} fill={WGTheme.bubbleBg} fontWeight={350} />
				<Txt
					text={`Bret Hudson`.toUpperCase()}
					fill={WGTheme.bubbleBg}
					fontWeight={250}
				/>
			</Rect>,
		);
	}
}
