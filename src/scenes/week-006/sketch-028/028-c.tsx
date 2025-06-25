import { Layout, makeScene2D, Rect } from '@motion-canvas/2d';

import {
	Color,
	createSignal,
	easeInOutCubic,
	easeOutQuad,
	finishScene,
	range,
	sequence,
	ThreadGenerator,
	useScene,
	useTransition,
	waitFor,
} from '@motion-canvas/core';
import { useViewport } from '~/hooks/useViewport';
import { positionItemInRow } from '~/util';
import { WGTheme } from '~/util/themes';
import { initScene } from './shared-028';

export function* dotsTransition(duration = 1.4): ThreadGenerator {
	const size = useScene().getRealSize();

	const bgRadius = createSignal(0);
	const clipRadius = createSignal(0);

	const dot = 100;
	const cols = size.x / dot;
	const rows = size.y / dot;
	const endTransition = useTransition((ctx) => {
		for (let row = -1; row <= rows; ++row) {
			for (let col = -1; col <= cols; ++col) {
				const x = (col + (row % 2 ? 1 : 0.5)) * dot;
				const y = (row + 0.5) * dot;
				ctx.fillStyle = WGTheme.darkBlue;
				ctx.beginPath();
				ctx.arc(x, y, dot * bgRadius(), 0, 2 * Math.PI);
				ctx.fill();
			}
		}

		ctx.beginPath();
		if (clipRadius() > 0) {
			for (let row = -1; row <= rows; ++row) {
				for (let col = -1; col <= cols; ++col) {
					const x = (col + (row % 2 ? 1 : 0.5)) * dot;
					const y = (row + 0.5) * dot;
					ctx.arc(x, y, dot * clipRadius(), 0, 2 * Math.PI);
					ctx.closePath();
				}
			}
		}
		ctx.clip();
	});

	yield* sequence(
		duration * 0.25,
		bgRadius(1, duration * 0.7, easeInOutCubic),
		clipRadius(1, duration * 0.75, easeOutQuad),
	);

	endTransition();
}

export default makeScene2D(function* (view) {
	const { shared } = initScene(3);
	const { viewW, viewH } = useViewport();

	const h = viewH / 10;
	const count = 9;
	view.add(
		<Layout rotation={-10} zIndex={-1}>
			{range(count).map((i) => (
				<Rect
					y={positionItemInRow(i, count, h, h)}
					width={viewW * 1.5}
					height={h}
					fill="#fff6"
				/>
			))}
		</Layout>,
	);
	view.fill('#f28579');

	yield* dotsTransition();

	yield* waitFor(1);

	finishScene();
});
