import { makeScene2D, Node, Txt } from '@motion-canvas/2d';
import {
	Color,
	createSignal,
	Direction,
	easeInOutCubic,
	easeInOutQuad,
	easeOutQuad,
	linear,
	sequence,
	slideTransition,
	ThreadGenerator,
	useRandom,
	useScene,
	useTransition,
	waitFor,
} from '@motion-canvas/core';
import { Week6Credits } from '~/components/week/week-006/Credits';
import { Week6Title } from '~/components/week/week-006/Title';
import { useViewport } from '~/hooks/useViewport';

import { useWeek6 } from '~/hooks/useWeek6';
import { WGTheme } from '~/util/themes';

// Pulled from Kyle Pulver's Otter2d
// https://github.com/kylepulver/Otter/blob/master/Otter/Utility/Util.cs
function scaleClamp(
	value: number,
	min: number,
	max: number,
	min2: number,
	max2: number,
) {
	value = min2 + ((value - min) / (max - min)) * (max2 - min2);
	if (max2 > min2) {
		value = value < max2 ? value : max2;
		return value > min2 ? value : min2;
	}
	value = value < min2 ? value : min2;
	return value > max2 ? value : max2;
}

function* customTransition(duration = 5): ThreadGenerator {
	const size = useScene().getRealSize();

	const random = useRandom();
	const colors = new Map();

	const bgRadius = createSignal(0);
	const clipRadius = createSignal(0);

	const dot = 100;
	const cols = size.x / dot;
	const rows = size.y / dot;
	const hSpacing = Math.sqrt(3);
	const vSpacing = 3 / 2;
	const diagX = Math.sin(Math.PI / 3);
	const diagY = Math.cos(Math.PI / 3);
	const color = new Color('#bb44aa');
	const endTransition = useTransition((ctx) => {
		for (let row = -1; row <= rows; ++row) {
			for (let col = -1; col <= cols; ++col) {
				const start = (row + col * 1.4) * 0.025;
				const end = start + 0.4;
				let p = scaleClamp(bgRadius(), start, end, 0, 1);
				const xO = col + (row % 2 ? 1 : 0.5);
				const yO = row;
				const x = xO * dot * hSpacing;
				const y = yO * dot * vSpacing;

				const hash = [row, col].join(',');
				if (!colors.has(hash))
					colors.set(hash, 180 + random.nextInt(0, 30) * 4);

				// @ts-expect-error - this is alright
				ctx.fillStyle = color.set('hsv.h', colors.get(hash));
				ctx.translate(x, y);
				ctx.beginPath();
				// const p = bgRadius() + (row + col) * 0.02;
				const t = Math.min(1, Math.sin(p * Math.PI) * 1.1);
				if (t < 0) continue;
				const d = dot * t;
				const dX = d * diagX;
				const dY = d * diagY;
				ctx.moveTo(0, d);
				ctx.lineTo(dX, dY);
				ctx.lineTo(dX, -dY);
				ctx.lineTo(0, -d);
				ctx.lineTo(-dX, -dY);
				ctx.lineTo(-dX, dY);
				ctx.closePath();
				ctx.fill();
				ctx.translate(-x, -y);
			}
		}

		ctx.beginPath();
		if (clipRadius() > 0) {
			// TODO(bret): figure this out in the future :)
			// for (let row = -1; row <= rows; ++row) {
			// 	for (let col = -1; col <= cols; ++col) {
			// 		const x = (col + (row % 2 ? 1 : 0.5)) * dot;
			// 		const y = (row + 0.5) * dot;
			// 		ctx.arc(x, y, dot * clipRadius(), 0, 2 * Math.PI);
			// 		ctx.closePath();
			// 	}
			// }
		}
		ctx.clip();
	});

	yield* bgRadius(1, duration, easeInOutQuad);

	endTransition();
}

export default makeScene2D(function* (view) {
	const { byOrientation, portrait, viewW, viewH } = useViewport();

	view.fill('#733');

	const { shared } = useWeek6('Transitions 4', 'Loop & loop & loop');

	const week6Title = view.childAs<Week6Title>(2);
	const week6Credits = view.childAs<Week6Credits>(3);
	week6Title.y(0);
	week6Title.childAs<Txt>(0).fontSize(128);

	week6Title.zIndex(0);
	week6Credits.zIndex(1);

	const scale = byOrientation(1, 1 / 1.2);
	shared.fontSize = 96 * scale;

	const transition = <Node />;
	view.add(transition);

	transition.zIndex(0);

	yield* customTransition();

	yield* waitFor(0.1);
});
//
