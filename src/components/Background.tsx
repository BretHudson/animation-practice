import { nodeName, Rect, RectProps, View2D } from '@motion-canvas/2d';

export interface BackgroundProps extends RectProps {
	view: View2D;
}

@nodeName('Background')
export class Background extends Rect {
	public constructor(props: BackgroundProps) {
		super(props);

		this.width(props.view.width());
		this.height(props.view.height());
	}
}
