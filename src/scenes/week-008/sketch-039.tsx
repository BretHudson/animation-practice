import { makeScene2D, Rect } from '@motion-canvas/2d';
import {
	all,
	chain,
	createSignal,
	easeInOutBack,
	easeOutBack,
	easeOutElastic,
	linear,
	sequence,
	waitFor,
} from '@motion-canvas/core';

import { useViewport } from '~/hooks/useViewport';
import { useWeek7 } from '~/hooks/useWeek7';

import shader from '~/shaders/shader-039.glsl';

console.log(shader);

export default makeScene2D(function* (view) {
	const { byOrientation, viewW, viewH } = useViewport();

	const { bg } = useWeek7(undefined, '#111f', 10);

	const size = createSignal(1);
	const rotation = createSignal(0);
	const shape = createSignal(0);

	bg().shaders({
		fragment: shader,
		uniforms: {
			axis: byOrientation(0, 1),
			size,
			rotation,
			shape,
		},
	});

	for (let i = 1; i <= 4; ++i) {
		rotation(0);
		yield* all(
			rotation(360, 1.5),
			chain(
				waitFor(0.1),
				sequence(0.4, size(0.4, 0.6), shape(i, 1), size(1, 1, easeOutElastic)),
			),
		);
	}
	// for (let i = 1; i <= 8; ++i) {
	// 	yield* t(i, 1);
	// 	yield* waitFor(0.3);
	// }
});
