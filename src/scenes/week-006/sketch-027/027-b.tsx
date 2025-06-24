import { makeScene2D } from '@motion-canvas/2d';

import { initScene } from './shared-027';
import {
	Color,
	Direction,
	slideTransition,
	useScene,
	waitFor,
} from '@motion-canvas/core';

export default makeScene2D(function* (view) {
	const { shared } = initScene(2);
	// @ts-expect-error - this is fine
	view.fill(new Color(0.6064 * 60, 0.636, 0.9686, 'hsv'));

	console.log('hi', useScene().previous);
	yield* slideTransition(Direction.Right);

	yield* waitFor(1);
});
