import { Gradient } from '@motion-canvas/2d';
import { PossibleColor, Vector2 } from '@motion-canvas/core';

export function createGradient(
	w: number,
	h: number,
	c1: PossibleColor = '#ccddff',
	c2: PossibleColor = '#000011',
) {
	return new Gradient({
		from: new Vector2(-w * 0.4, -h * 0.4),
		to: new Vector2(w * 0.3, h * 0.4),
		stops: [
			{ offset: 0, color: c1 },
			{ offset: 1, color: c2 },
		],
	});
}

export function tToRadians(v: number): number {
	return v * Math.PI * 2;
}

export const positionItemInRow = (
	i: number,
	count: number,
	size: number,
	padding: number,
) => {
	const spacing = size + padding;
	const start = -(count - 1) * 0.5 * spacing;
	return start + i * spacing;
};
