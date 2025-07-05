import { Gradient, makeScene2D } from '@motion-canvas/2d';
import {
	all,
	chain,
	makeRef,
	PossibleColor,
	useRandom,
	waitFor,
	waitUntil,
} from '@motion-canvas/core';
import {
	Fireworks,
	FireworksProps,
} from '~/components/week/week-007/Fireworks';

import { useViewport } from '~/hooks/useViewport';

import { useWeek7 } from '~/hooks/useWeek7';
import { positionItemInRow } from '~/util';

export default makeScene2D(function* (view) {
	const { byOrientation, viewH } = useViewport();
	const { bg } = useWeek7();

	const gradient = new Gradient({
		type: 'linear',
		fromY: -viewH * 0.6,
		toY: viewH * 0.8,
		stops: [
			{ offset: 0, color: '#11143777' },
			{ offset: 0.4, color: '#111437FF' },
			{ offset: 0.6, color: '#111437FF' },
			{ offset: 1, color: 'rgb(57, 3, 3)' },
		],
	});
	bg().fill('#111437');
	bg().fill(gradient);

	const random = useRandom();

	const ref: Fireworks[][] = [];

	const layer = (
		length: number,
		count: number,
		color: PossibleColor = 'red',
	) => ({
		length,
		count,
		color,
	});

	const computeDelays = (fireworks: FireworksProps[]) => {
		const maxDist = Math.max(...fireworks.map(({ distance }) => distance));
		fireworks.forEach((f) => {
			f.delay = (maxDist - f.distance) / 500;
		});
	};

	const mapPartialToProps = (f: Omit<FireworksProps, 'delay' | 'random'>) => ({
		...f,
		random,
		delay: 'delay' in f ? (f.delay as number) : 0,
	});

	const fireworks1: FireworksProps[] = [
		{
			angle: -16,
			distance: 900,
			layers: [layer(50, 12, '#3ae'), layer(30, 8, 'white')],
		},
		{
			x: 100,
			angle: 7,
			distance: 1160,
			layerScale: 1.1,
			layers: [layer(80, 14), layer(55, 14), layer(20, 8, 'white')],
		},
		{
			x: 100,
			angle: 2,
			distance: 1500,
			layerScale: 1.2,
			layers: [layer(55, 14, '#3ae'), layer(20, 8, 'white')],
		},
		{
			angle: -7,
			distance: 1400,
			layerScale: 1.2,
			layers: [layer(80, 16), layer(55, 16, '#3ae'), layer(20, 8, 'white')],
		},
		{
			angle: 4,
			distance: 800,
			layerScale: 1.2,
			layers: [layer(30, 12, '#ccc'), layer(20, 8, 'white')],
		},
	].map(mapPartialToProps);

	const fireworks2: FireworksProps[] = [
		{
			angle: -16,
			distance: 1050,
			layerScale: 0.75,
			layers: [layer(80, 12, '#e3e'), layer(45, 12, 'yellow')],
		},
		{
			x: 100,
			angle: 8,
			distance: 1260,
			layerScale: 1.1 * 0.75,
			layers: [layer(80, 14), layer(45, 14, 'yellow')],
		},
		{
			angle: -3,
			distance: 1600,
			layerScale: 1.2 * 0.75,
			layers: [layer(80, 16, '#3ae'), layer(45, 12, 'yellow')],
		},
	].map(mapPartialToProps);
	fireworks2.forEach((f) => (f.x = -500));

	const fireworks3: FireworksProps[] = [
		{
			angle: 5,
			distance: 800,
			layers: [
				layer(80, 6, '#eef9'),
				layer(70, 6, '#eef9'),
				layer(55, 12, '#e3e'),
				layer(20, 8, 'white'),
			],
		},
		{
			x: 100,
			angle: -20,
			distance: 1100,
			layerScale: 0.9,
			layers: [
				layer(80, 7, '#eef9'),
				layer(70, 7, '#eef9'),
				layer(55, 14, '#3e3'),
				layer(20, 8, 'white'),
			],
		},
		{
			angle: -3,
			distance: 1400,
			layerScale: 1.2,
			layers: [
				layer(80, 10, '#eef9'),
				layer(70, 10, '#eef9'),
				layer(55, 16, '#3ae'),
				layer(20, 8, 'white'),
			],
		},
	].map(mapPartialToProps);
	fireworks3.forEach((f) => (f.x = 500));

	const f4Length = 7;
	const fireworks4: FireworksProps[] = Array.from(
		{ length: f4Length },
		(_, i) => ({
			x: positionItemInRow(i, f4Length, 30),
			angle: positionItemInRow(i, f4Length, 16),
			// angle: 0,
			delay: i * 0.2,
			distance: 1400,
			layers: [
				layer(90, 8, 'pink'),
				layer(80, 12, '#e3e'),
				layer(55, 12, '#3ae'),
				layer(20, 8, 'white'),
			],
		}),
	).map(mapPartialToProps);

	const f5Length = 4;
	const fireworks5: FireworksProps[] = Array.from(
		{ length: f5Length },
		(_, i) => ({
			x: positionItemInRow(i, f5Length, 40),
			angle: positionItemInRow(i, f5Length, 22),
			// angle: 0,
			delay: i * 0.2,
			distance: 900,
			layers: [layer(55, 12, 'orange'), layer(35, 12)],
		}),
	)
		.map(mapPartialToProps)
		.map((f) => ({ ...f, layerScale: 0.75 }));

	const f6Length = 5;
	const fireworks6: FireworksProps[] = Array.from(
		{ length: f6Length },
		(_, i) => ({
			x: positionItemInRow(i, f6Length, 40),
			angle: positionItemInRow(i, f6Length, 22),
			// angle: 0,
			delay: i * 0.2,
			distance: 1100,
			layers: [layer(55, 12, '#3e3'), layer(35, 12, 'yellow')],
		}),
	)
		.map(mapPartialToProps)
		.map((f) => ({ ...f, layerScale: 0.75 }));

	const registerFireworks = (fireworks: FireworksProps[]) => {
		computeDelays(fireworks);
		const len = ref.length;
		ref[len] = [];
		view.add(
			fireworks.map((props, i) => (
				<Fireworks
					y={viewH * 0.5}
					ref={makeRef(ref[len], i)}
					random={random}
					{...props}
				/>
			)),
		);
	};

	let done = 0;
	let count = 0;
	const emitDone = () => {
		++count;
		return () => ++done;
	};
	yield* waitFor(0.1);

	const fireworkArr = [
		fireworks1,
		fireworks2,
		fireworks3,
		fireworks4,
		fireworks5,
		fireworks6,
	];

	registerFireworks(fireworks1);
	registerFireworks(fireworks2);
	registerFireworks(fireworks3);
	registerFireworks(fireworks4);
	registerFireworks(fireworks6);
	registerFireworks(fireworks5);

	fireworks4.forEach((f, i) => {
		ref[3][i].delay = (i * 0.7) / 7;
	});
	fireworks6.forEach((f, i) => {
		ref[4][i].delay = (i * 0.7) / 5;
	});
	fireworks5.forEach((f, i) => {
		ref[5][i].delay = (i * 0.7) / 4;
	});

	for (let i = 0; i < fireworkArr.length; ++i) {
		yield* waitUntil(`burst${i + 1}`);
		yield chain(all(...ref[i].map((r) => r.launch())), emitDone());
	}
	// yield* waitUntil('burst2');
	// yield chain(all(...ref[1].map((r) => r.launch())), emitDone());
	yield* waitFor(0.1);
	// yield* waitUntil('burst3');
	let i = 0;
	while (i++ < 1000) {
		if (done >= count) break;
		yield;
	}
	// yield* sequence(0.2, ...ref.map((r) => r.launch()));
});
