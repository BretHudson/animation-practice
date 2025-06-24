import { makeScene2D } from '@motion-canvas/2d';

import { fadeTransition, useScene, waitFor } from '@motion-canvas/core';
import { initScene } from './shared-027';

export default makeScene2D(function* (view) {
	const { shared } = initScene(1);
	view.fill('#a4c2f7');

	if (useScene().previous) yield* fadeTransition();

	yield* waitFor(0.5);
});
