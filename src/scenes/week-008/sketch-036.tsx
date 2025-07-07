import { Layout, makeScene2D, Rect } from '@motion-canvas/2d';
import {
	all,
	easeOutBack,
	easeOutCubic,
	makeRef,
	range,
	sequence,
	useRandom,
	waitFor,
} from '@motion-canvas/core';

import { useViewport } from '~/hooks/useViewport';

import { useWeek7 } from '~/hooks/useWeek7';

import { positionItemInRow } from '~/util';
import { WGTheme } from '~/util/themes';

export default makeScene2D(function* (view) {
	const { byOrientation, portrait, viewH } = useViewport();
	useWeek7('Gage Krause');

	const random = useRandom();

	const n = 7;
	const card: Rect[] = [];
	const w = 140;
	const h = (w * 3) / 2;
	const pad = byOrientation(40, 60);
	view.add(
		<Layout>
			{range(n).map((i) => (
				<Rect
					ref={makeRef(card, i)}
					y={viewH * 0.7}
					width={w}
					height={h}
					fill={i % 2 === 0 ? WGTheme.blue : WGTheme.yellow}
					radius={16}
				/>
			))}
		</Layout>,
	);

	yield* waitFor(0.3);

	const tScale = 1.5;

	yield* sequence(
		0.07 * tScale,
		...range(n).map((i) => {
			let x = positionItemInRow(i, n, w, pad);
			const yOffset = random.nextFloat(-3, 3);
			let y = yOffset;
			const rotOffset = random.nextFloat(-3, 3);
			const dur = 0.4 * tScale;

			if (portrait) {
				if (i < 4) {
					x = positionItemInRow(i, 4, w, pad);
					y -= (h + pad) * 0.5;
				} else {
					x = positionItemInRow((i - 1) % 3, 3, w, pad);
					y += (h + pad) * 0.5;
				}
			}

			const pos = card[i].position([x, y], dur, easeOutCubic);

			const spin = card[i]
				.rotation(-90)
				.rotation(180 + rotOffset, dur, easeOutCubic);
			return all(pos, spin);
		}),
	);

	yield* waitFor(0.3);

	yield* sequence(
		0.16 * tScale,
		...range(n).map((i) => {
			const pos = card[i]
				.y(card[i].y() - h * 0.5, 0.3 * tScale)
				.back(0.3 * tScale, easeOutBack);
			return all(pos);
		}),
	);

	yield* waitFor(0.3);

	yield* sequence(
		0.03,
		...range(n).map((i) => {
			return card[i].opacity(0, 0.3);
		}),
	);

	yield* waitFor(0.1);
});
