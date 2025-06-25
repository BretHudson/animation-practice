import { makeScene2D } from '@motion-canvas/2d';

import {
	all,
	Color,
	createSignal,
	Direction,
	ThreadGenerator,
	useScene,
	useTransition,
	Vector2,
	waitFor,
} from '@motion-canvas/core';
import { WGTheme } from '~/util/themes';
import { initScene } from './shared-028';

// TODO(bret): Make this work for multiple directions
export function* slantedSlideTransition(
	direction: Direction = Direction.Top,
	duration = 0.8,
): ThreadGenerator {
	const size = useScene().getRealSize();
	const position = size.getOriginOffset(direction).scale(2);
	const previousPosition = Vector2.createSignal();
	const currentPosition = Vector2.createSignal(position);

	const diagonal = 45;
	const rectX = createSignal(size.width + diagonal);

	const endTransition = useTransition((ctx) => {
		const ww = size.width + previousPosition.x();
		ctx.fillStyle = WGTheme.darkBlue;
		const x1 = rectX();
		const y1 = 0;
		const x2 = x1 + ww;
		const y2 = y1 + size.height;
		ctx.beginPath();
		ctx.moveTo(x1 + diagonal, y1);
		ctx.lineTo(x2 + diagonal, y1);
		ctx.lineTo(x2 - diagonal, y2);
		ctx.lineTo(x1 - diagonal, y2);
		ctx.closePath();
		ctx.fill();

		ctx.beginPath();
		// ctx.rect(rectX() + ww, 0, size.width, size.height);
		ctx.moveTo(x2 + diagonal, y1);
		ctx.lineTo(size.width, y1);
		ctx.lineTo(size.width, y2);
		ctx.lineTo(x2 - diagonal, y2);
		ctx.closePath();
		ctx.clip();
	});

	// perform animations
	yield* all(
		previousPosition(position.scale(-1), duration),
		currentPosition(Vector2.zero, duration),
		rectX(-diagonal, duration * 0.5),
	);

	// finish the transition
	endTransition();
}

export default makeScene2D(function* (view) {
	const { shared } = initScene(2);
	view.fill('#7adb76');

	yield* slantedSlideTransition(Direction.Right);

	yield* waitFor(1);
});
