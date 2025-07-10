import { makeScene2D, Rect } from '@motion-canvas/2d';
import { createSignal, waitFor } from '@motion-canvas/core';

import { useViewport } from '~/hooks/useViewport';
import { useWeek7 } from '~/hooks/useWeek7';

import shader from '~/shaders/shader-038.glsl';

console.log(shader);

export default makeScene2D(function* (view) {
	const { byOrientation, viewW, viewH } = useViewport();

	const { bg } = useWeek7(undefined, '#111f', 10);
	bg().fill('red');

	const opacity = createSignal(0);
	const t = createSignal(0);
	bg().shaders({
		fragment: shader,
		uniforms: {
			iTime: view.globalTime(),
			opacity,
			axis: byOrientation(0, 1),
			t,
		},
	});

	opacity(0.9);
	for (let i = 1; i <= 8; ++i) {
		yield* t(i, 1);
		yield* waitFor(0.3);
	}
});
