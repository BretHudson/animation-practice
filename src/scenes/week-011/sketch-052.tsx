import { Circle, Layout, makeScene2D, Ray, Spline } from '@motion-canvas/2d';
import {
	all,
	Color,
	createRef,
	easeInCubic,
	easeInElastic,
	easeOutBack,
	easeOutCubic,
	easeOutQuad,
	makeRef,
	sequence,
	Vector2,
} from '@motion-canvas/core';

import { useViewport } from '~/hooks/useViewport';
import { useWeek7 } from '~/hooks/useWeek7';

const bgColor = new Color('#222120');

function createArrow() {
	const layout = createRef<Layout>();
	const ray = createRef<Spline>();
	const from = new Vector2(-150, 0);
	const to = new Vector2(150, 0);
	const delta = to.sub(from);

	const lineWidth = 20;

	const from2 = from.sub(delta.normalized.scale(lineWidth));
	const to2 = from.add(delta.normalized.scale(lineWidth * 0.5));
	<Layout ref={layout}>
		<Ray
			from={from}
			to={to}
			ref={ray}
			lineWidth={lineWidth}
			stroke={'lightseagreen'}
			arrowSize={lineWidth * 1.5}
			endArrow
		/>
		<Ray
			from={from2}
			to={to2}
			ref={ray}
			lineWidth={lineWidth}
			stroke={bgColor}
			arrowSize={lineWidth}
			endArrow
		/>
	</Layout>;
	return layout;
}

export default makeScene2D(function* (view) {
	const { byOrientation, viewW, viewH, axes, dims } = useViewport();

	const textColor = '#171c16';

	const { bg, credits } = useWeek7(); //undefined, '#111f', 10);
	bg().fill(bgColor);
	// bg().fill('#efd99b');
	// bg().fill('#eac783');

	credits().sketchTxt().fill(textColor);
	credits().authorTxt().fill(textColor);

	const fillSize = new Vector2(viewW, viewH).magnitude;

	const _colors = [
		'#5433FF',
		'#4379FF',
		'#1CC6FF',
		'#97FBD1',
		'#F6A4EC',
		'#171c16',
	] as const;

	const colors = [..._colors, ..._colors, ..._colors].reverse();

	const circles: Circle[] = [];
	view.add(
		colors.map((c, i) => (
			<Circle
				ref={makeRef(circles, i)}
				position={new Vector2(100, 0).rotate(-60 * (i % 6))}
				size={fillSize * 1.3}
				fill={c}
			/>
		)),
	);

	yield* sequence(
		0.4,
		...circles
			.toReversed()
			.map((c) => all(c.position(0, 1.5, easeInCubic), c.size(0, 1.5))),
	);
});
