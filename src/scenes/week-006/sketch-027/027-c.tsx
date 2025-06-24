import { makeScene2D } from '@motion-canvas/2d';

import {
	all,
	Color,
	createSignal,
	Direction,
	fadeTransition,
	ThreadGenerator,
	useScene,
	useTransition,
	Vector2,
	waitFor,
} from '@motion-canvas/core';
import { initScene } from './shared-027';
import { WGTheme } from '~/util/themes';

export function* customTransition(
	direction: Direction = Direction.Top,
	duration = 0.8,
): ThreadGenerator {
	const size = useScene().getRealSize();
	const position = size.getOriginOffset(direction).scale(2);
	const previousPosition = Vector2.createSignal();
	const currentPosition = Vector2.createSignal(position);

	const rectX = createSignal(size.width);

	const endTransition = useTransition((ctx) => {
		const ww = size.width + previousPosition.x();
		ctx.fillStyle = WGTheme.darkBlue;
		ctx.fillRect(rectX(), 0, ww, size.height);

		ctx.beginPath();
		ctx.rect(rectX() + ww, 0, size.width, size.height);
		ctx.clip();
	});

	// perform animations
	yield* all(
		previousPosition(position.scale(-1), duration),
		currentPosition(Vector2.zero, duration),
		rectX(0, duration * 0.5),
	);

	// finish the transition
	endTransition();
}

export default makeScene2D(function* (view) {
	const { shared } = initScene(3);
	// @ts-expect-error - this is fine
	view.fill(new Color(0.6064, 0.336, 0.9686, 'hsv'));

	yield* customTransition(Direction.Right);

	yield* waitFor(1);
});
