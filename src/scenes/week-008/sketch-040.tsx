import { makeScene2D } from '@motion-canvas/2d';
import {
	all,
	chain,
	Color,
	createSignal,
	easeInCubic,
	easeInOutQuad,
	easeInQuad,
	easeOutCubic,
	easeOutElastic,
	easeOutQuad,
	map,
	sequence,
	TimingFunction,
	tween,
	waitFor,
} from '@motion-canvas/core';

import { useViewport } from '~/hooks/useViewport';
import { useWeek7 } from '~/hooks/useWeek7';

import shader from '~/shaders/shader-040.glsl';

export default makeScene2D(function* (view) {
	const { byOrientation, viewW, viewH } = useViewport();

	const { bg } = useWeek7(undefined, '#111f', 10);

	bg().fill('rgb(230, 115, 69)');

	const size = createSignal(1);
	const rotation = createSignal(0);
	const shape = createSignal(0);

	const white = new Color({
		r: 230 / 255,
		g: 222 / 255,
		b: 227 / 255,
		a: 1,
	});

	const bgColors = [
		{
			r: 0.8,
			g: 0.3,
			b: 0.6,
			a: 1,
		},
		{
			r: 0,
			g: 0.4,
			b: 0.6,
			a: 1,
		},
		{
			r: 0.3,
			g: 0.7,
			b: 0.3,
			a: 1,
		},
		{
			r: 0.9,
			g: 0.45,
			b: 0.27,
			a: 1,
		},
	].map((c) => new Color(c));

	const _bgColor = createSignal(bgColors[0]);

	const bgColor = createSignal(() => _bgColor()._rgb._unclipped);

	console.log(bgColor());

	bg().shaders({
		fragment: shader,
		uniforms: {
			axis: byOrientation(0, 1),
			size,
			rotation,
			shape,
			// bgColor: [0.9, 0.45, 0.27, 1],
			// bgColor: [0, 0.45, 0.27],
			bgColor, //: [0, 0.5, 0.5],
		},
	});

	function* switchBg(
		to: Color,
		dur: number,
		timingFunction: TimingFunction = easeOutElastic,
	) {
		const from = _bgColor();
		yield* tween(dur, (v) => {
			const t = timingFunction(v);
			_bgColor(Color.lerp(from, to, t, 'oklch'));
		});
	}

	let dur = 1;

	const pulse: TimingFunction = (value: number) => Math.sin(value * Math.PI);

	for (let i = 1; i <= bgColors.length; ++i) {
		const to = bgColors[i % bgColors.length];
		const bgDur = dur * 0.75;
		const wait = dur - bgDur;
		const bgOut = chain(
			waitFor(wait),
			switchBg(white, bgDur, easeInCubic),
			() => shape(i),
		);
		const wait2 = 0.5;
		rotation(0);
		const shapeShift = chain(
			//
			waitFor(dur * wait2),
			rotation(360, dur * (2 - wait2 * 2)),
			waitFor(dur * wait2),
		);
		const wait3 = 0.7;
		const sizePulse = chain(
			//
			waitFor(dur * wait3),
			tween(dur * (2 - wait3 * 2), (v) => {
				const t = pulse(v);
				size(map(1, 0.7, t));
			}),
			// size(1.5, dur * (2 - wait2 * 2), pulse).do(() => size(1)),
			waitFor(dur * wait3),
		);
		const bgIn = chain(waitFor(dur), switchBg(to, bgDur, easeOutCubic));
		// yield* sizePulse;
		yield* all(bgOut, shapeShift, bgIn, sizePulse);
		// yield* all(switchBg(start, 2), shape(2, 1));
	}
});
