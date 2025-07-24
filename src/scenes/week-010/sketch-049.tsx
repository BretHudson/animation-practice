import {
	Circle,
	Img,
	initial,
	Knot,
	Layout,
	makeScene2D,
	nodeName,
	Path,
	Polygon,
	PolygonProps,
	Rect,
	Shape,
	ShapeProps,
	signal,
	Spline,
	Txt,
	TxtProps,
} from '@motion-canvas/2d';
import {
	all,
	clamp,
	Color,
	createEaseInOutBack,
	createEaseOutBounce,
	createRef,
	createSignal,
	easeInCubic,
	easeInExpo,
	easeInOutBack,
	easeInOutCubic,
	easeInOutExpo,
	easeInOutQuad,
	easeInOutSine,
	easeInQuad,
	easeInQuint,
	easeOutBack,
	easeOutBounce,
	easeOutCubic,
	easeOutElastic,
	easeOutExpo,
	easeOutQuad,
	linear,
	loop,
	makeRef,
	map,
	remap,
	sequence,
	SignalGenerator,
	SimpleSignal,
	ThreadGenerator,
	TimingFunction,
	useRandom,
	Vector2,
	waitFor,
} from '@motion-canvas/core';

import { useViewport } from '~/hooks/useViewport';
import { useWeek7 } from '~/hooks/useWeek7';
import { positionItemInRow } from '~/util';
import { WGTheme } from '~/util/themes';

import shaderGlsl from '../../shaders/shader-049.glsl';

export default makeScene2D(function* (view) {
	const { byOrientation, viewW, viewH, axes, dims } = useViewport();

	const { bg } = useWeek7(undefined, '#111f', 10);

	bg().shaders({
		fragment: shaderGlsl,
		uniforms: {
			axis: byOrientation(0, 1),
		},
	});

	// yield* waitFor(3 * 6 * 2 + 1.72);
	yield* waitFor(37.6);
});
