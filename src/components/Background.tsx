import { nodeName, Rect, RectProps, View2D } from '@motion-canvas/2d';
import { Color } from '@motion-canvas/core';
import { useViewport } from '~/hooks/useViewport';

export interface BackgroundProps extends RectProps {
	view?: View2D;
}

const getOffset = (cellSize: number, fillSize: number) => {
	const total = Math.ceil(fillSize / cellSize) * cellSize;
	return (total - fillSize) / 2;
};

@nodeName('Background')
export class Background extends Rect {
	public constructor(props: BackgroundProps) {
		super(props);

		const { view } = useViewport();

		this.width(view.width());
		this.height(view.height());
	}

	public static Week5(hue: number) {
		const bg = new Background({});

		const { view, viewW, viewH } = useViewport();
		const hsv = [hue * 360, 0.4025, 0.9451] as const;
		const hsv2 = [hue * 360, 0.336, 0.9686] as const;

		// @ts-expect-error - this is valid
		const color = new Color(...hsv, 'hsv');
		// @ts-expect-error - this is valid
		const color2 = new Color(...hsv2, 'hsv');

		view.fill(color);

		const cellSize = 240;
		const xOffset = -viewW / 2 - getOffset(cellSize, viewW);
		const yOffset = -viewH / 2 - getOffset(cellSize, viewH);
		for (let y = 0; y <= viewH; y += cellSize) {
			for (let x = 0; x <= viewW; x += cellSize) {
				const xx = x / cellSize;
				const yy = y / cellSize;
				if ((xx + yy) % 2) continue;
				bg.add(
					<Rect
						x={x + xOffset}
						y={y + yOffset}
						offset={[-1, -1]}
						width={cellSize}
						height={cellSize}
						fill={color2}
					/>,
				);
			}
		}

		return bg;
	}
}
