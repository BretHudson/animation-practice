import { makeScene2D } from '@motion-canvas/2d';

import {
	Direction,
	sequence,
	ThreadGenerator,
	useScene,
	useTransition,
	Vector2,
	waitFor,
	waitUntil,
} from '@motion-canvas/core';
import { initScene } from './shared-028';

export function* stripsTransition(
	direction: Direction = Direction.Top,
	duration = 1.2,
): ThreadGenerator {
	const size = useScene().getRealSize();
	const position = size.getOriginOffset(direction).scale(2);
	const strips1 = Vector2.createSignal(position);
	const strips2 = Vector2.createSignal(position);

	const endTransition = useTransition((ctx) => {
		ctx.beginPath();
		const numRows = 10;
		const rowH = size.height / numRows;

		for (let row = 0; row < numRows; ++row) {
			ctx.rect((row % 2 ? strips1 : strips2).x(), row * rowH, size.width, rowH);
			ctx.closePath();
		}
		ctx.clip();
	});

	yield* sequence(
		0.35,
		strips1(Vector2.zero, duration * 0.65),
		strips2(Vector2.zero, duration * 0.65),
	);

	endTransition();
}

let doWait = false;
export default makeScene2D(function* (view) {
	const { shared } = initScene(1);
	view.fill('#cca4f7');

	console.log('we here');
	if (useScene().previous) {
		console.log('time to transition!!');
		doWait = true;
		console.log(doWait);
		yield* stripsTransition(Direction.Right);
	}

	console.warn('do wait', doWait);
	if (doWait) {
		yield* waitFor(0.7);
	}

	yield* waitUntil('event');
});
