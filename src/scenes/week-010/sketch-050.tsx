import {
	Gradient,
	GradientStop,
	Layout,
	makeScene2D,
	Rect,
} from '@motion-canvas/2d';
import {
	all,
	chain,
	Color,
	createSignal,
	easeOutBack,
	easeOutBounce,
	easeOutElastic,
	EPSILON,
	linear,
	range,
	sequence,
	waitFor,
} from '@motion-canvas/core';

import { useViewport } from '~/hooks/useViewport';
import { useWeek7 } from '~/hooks/useWeek7';

import shaderGlsl from '../../shaders/shader-050.glsl';

export default makeScene2D(function* (view) {
	const { byOrientation, viewW, viewH, axes, dims } = useViewport();

	const { bg } = useWeek7(undefined, '#111f', 10);

	const COLOR_YELLOW = '#D9B665';
	const COLOR_WHITE = '#DED9AB';
	const COLOR_GRAY = '#B3A78D';
	const COLOR_TEAL = '#536B63';
	const COLOR_NAVY = '#32374D';
	const COLOR_RED = '#9F4234';

	interface Stripe {
		color: string;
		height: number;
	}

	const generateStripe = (
		color: string,
		{
			height = 1.5,
			padding = 2.5,
			start = false,
			end = false,
		}: {
			height?: number;
			padding?: number;
			start?: boolean;
			end?: boolean;
		} = {},
	): Stripe[] => {
		const yellow = padding * 0.5;
		return [
			start ? null : { color: COLOR_YELLOW, height: yellow },
			{ color: COLOR_WHITE, height: 1 },
			{ color, height },
			{ color: COLOR_WHITE, height: 1 },
			end ? null : { color: COLOR_YELLOW, height: yellow },
		].filter(Boolean);
	};

	const stripes = [
		generateStripe(COLOR_NAVY, { height: 2.5, start: true }),
		generateStripe(COLOR_TEAL, {}),
		generateStripe(COLOR_RED, { padding: 5 }),
		generateStripe(COLOR_TEAL, { padding: 7.5 }),

		generateStripe(COLOR_NAVY, { padding: 10 }),

		generateStripe(COLOR_TEAL, { padding: 7.5 }),
		generateStripe(COLOR_RED, { padding: 5 }),
		generateStripe(COLOR_TEAL, {}),
		generateStripe(COLOR_NAVY, { height: 2.5, end: true }),

		...range(25).flatMap(() => {
			return [
				{ color: COLOR_WHITE, height: 1 },
				{ color: COLOR_GRAY, height: 1 },
			];
		}),
	].flat();

	const convertToGradient = (stripes: Stripe[]) => {
		const totalHeight = stripes
			.map(({ height }) => height)
			.reduce((acc, v) => acc + v, 0);

		const stops: GradientStop[] = [];
		let offset = 0;
		stripes.forEach(({ color, height }) => {
			const _offset = height / totalHeight;
			stops.push({ offset: offset + EPSILON, color });
			offset += _offset;
			stops.push({ offset: offset - EPSILON, color });
		});

		stops.at(0).offset = 0;
		stops.at(-1).offset = 1;

		return new Gradient({
			fromY: -viewH * 0.5,
			toY: viewH * 0.5,
			stops,
		});
	};

	const gradient = convertToGradient(stripes);

	const ratio = viewH / viewW;

	const sinAmp = createSignal(0);
	const sawAmp = createSignal(1);
	const period = createSignal(1);

	const s = {
		fragment: shaderGlsl,
		uniforms: {
			axis: byOrientation(0, 1),
			sinAmp,
			sinAmpScale: 0.2,
			sawAmp,
			sawAmpScale: 0.2,
			period: createSignal(() => (period() * ratio) / 2),
			zoom: byOrientation(1, 1.4),
		},
	};

	view.add(<Rect width={viewW} height={viewH} fill={gradient} shaders={s} />);

	yield* waitFor(0.5);

	const waves = sequence(
		1.5,
		all(sinAmp(1, 1), sawAmp(0, 1)),
		sinAmp(1, 1),
		all(sinAmp(0, 1), sawAmp(1, 1)),
		sawAmp(0, 1),
		sawAmp(1, 1),
	);
	const periods = chain(
		period(3, 1.75),
		period(2, 1.75, easeOutBounce),
		period(0.9, 1.75, easeOutElastic),
		waitFor(1),
		() => period(0.5),
		period(1, 0.75, easeOutBack),
	);
	// yield* periods;
	yield* all(periods, waves);
});
