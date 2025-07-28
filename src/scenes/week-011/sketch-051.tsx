import {
	Gradient,
	GradientStop,
	Layout,
	makeScene2D,
	Rect,
	Txt,
} from '@motion-canvas/2d';
import {
	all,
	chain,
	Color,
	createSignal,
	easeInBack,
	easeOutBack,
	easeOutBounce,
	easeOutCubic,
	easeOutElastic,
	EPSILON,
	linear,
	loop,
	range,
	sequence,
	waitFor,
} from '@motion-canvas/core';

import { useViewport } from '~/hooks/useViewport';
import { useWeek7 } from '~/hooks/useWeek7';

import shaderGlsl from '../../shaders/shader-051.glsl';
import shaderBgGlsl from '../../shaders/shader-051-bg.glsl';
import { ShaderConfig } from '@motion-canvas/2d/lib/partials/ShaderConfig';

export default makeScene2D(function* (view) {
	const { byOrientation, viewW, viewH, axes, dims } = useViewport();

	const textColor = '#171c16';

	const { bg, credits } = useWeek7(); //undefined, '#111f', 10);
	// bg().fill('#efd99b');
	// bg().fill('#eac783');
	bg().shaders({
		fragment: shaderBgGlsl,
		uniforms: {
			colorA: new Color('#efd99b'),
			colorB: new Color('#d9af5a'),
		},
	});

	credits().sketchTxt().fill(textColor);
	credits().authorTxt().fill(textColor);

	const curvePercent = createSignal(0);

	const shader: ShaderConfig = {
		fragment: shaderGlsl,
		uniforms: {
			axis: byOrientation(0, 1),
			curvePercent,
			// ratio: byOrientation(1, 0.5625),
			ratio: byOrientation(1, 0.5625),
		},
	};

	view.add(
		<Txt
			text="Booiiinngg!!!"
			fontFamily="Winky Rough"
			fill={textColor}
			fontSize={150}
			letterSpacing={10}
			fontWeight={900}
			shaders={shader}
			cachePadding={250}
			opacity={0.9}
			skewY={-10}
		/>,
	);

	curvePercent(0.5);
	yield* loop(3, function* () {
		yield* waitFor(0.5);
		yield* curvePercent(-0.2, 1, easeOutCubic);
		yield* curvePercent(0.5, 1, (v) => easeOutElastic(v));
		yield* waitFor(0.5);
	});
});
