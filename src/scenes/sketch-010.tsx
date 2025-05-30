import { makeScene2D, LayoutProps, Txt, Layout } from '@motion-canvas/2d';
import { allMap, getSketchId } from '~/util';
import {
	waitFor,
	all,
	cancel,
	chain,
	Color,
	createSignal,
	loop,
	makeRef,
	range,
	sequence,
	SignalValue,
	useRandom,
	Vector2,
} from '@motion-canvas/core';
import {
	easeInOutBack,
	easeInOutCubic,
	easeInOutQuad,
	easeOutBack,
	easeOutQuad,
	tween,
} from '@motion-canvas/core/lib/tweening';

import { addBgCredits } from '~/components/advent-of-code/AoCLayout';
import { AoCTheme } from '~/util/themes';

const waitDur = 0.3;

export interface ValueDisplayProps extends LayoutProps {
	label: string;
	value: SignalValue<number>;
	speed?: SignalValue<number | null>;
}

export default makeScene2D(function* (view) {
	view.fontFamily(AoCTheme.fontFamily);

	addBgCredits(view, {
		sketchId: getSketchId(import.meta.url),
		year: 2017,
		day: 2,
		part: 1,
		hideTitle: true,
	});

	const stars: Txt[] = [];

	const txtProps = {
		text: '*',
		fill: AoCTheme.silver,
		fontSize: 92,
	} as const;

	const n = 50;

	const starFlicker = range(n).map(() => createSignal(1));
	const starOpacity = range(n).map(() => createSignal(0));

	const angle = createSignal(0);
	const antiAngle = createSignal(() => -angle());

	view.add(
		<Layout fontFamily={AoCTheme.fontFamily} rotation={angle}>
			{range(n).map((i) => (
				<Txt
					ref={makeRef(stars, i)}
					{...txtProps}
					rotation={antiAngle}
					opacity={createSignal(() => starFlicker[i]() * starOpacity[i]())}
				/>
			))}
		</Layout>,
	);

	const half = n / 2;
	yield* all(
		angle(Math.PI * 30, 2, easeOutQuad),
		sequence(
			0.04,
			...range(half).map((_i) => {
				const a = ((Math.PI * 2) / half) * _i;
				const dist = 250;
				const cos = Math.cos(a);
				const sin = Math.sin(a);
				const x = cos * dist;
				const y = sin * dist;
				const i = _i * 2;
				const xStart = cos * (-130 + 15 * i);
				const yStart = sin * (-130 + 15 * i);
				const star = stars[i];
				star.position([xStart, yStart]);
				return all(
					starOpacity[i](1, 0.1),
					star.position([x, y], 1 - i * 0.02, easeOutBack),
				);
			}),
		),
	);

	yield* allMap(stars, (star) => star.position([0, 0], 0.5));
	stars.forEach((_, i) => starOpacity[i](1));

	const colorSilver = new Color(AoCTheme.silver);
	const colorGold = new Color(AoCTheme.gold);
	yield* tween(
		0.6,
		(value) => {
			console.log(value);
			stars.forEach((star) => {
				star.scale(1 + Math.sin(value * Math.PI) * 0.7);
				star.fill(Color.lerp(colorSilver, colorGold, Math.min(1, value * 2)));
			});
		},
		easeInOutCubic,
	);
	angle(0);

	const points = range(10).map((i) => {
		const inc = 360 / 10;
		return new Vector2(i % 2 ? 260 : 100).rotate(i * inc);
	});

	const random = useRandom();

	const flickerOffsets = range(n).map(() => random.nextFloat(0, 1));
	const getFlicker = (i: number, t: number) => {
		const v = ((t + flickerOffsets[i]) % 1) * Math.PI;
		return (Math.sin(v) * 4 - 2) * 0.7 + Math.sin(v * 4) * 0.3;
	};

	yield* allMap(stars, (star, i) => {
		const p1 = points[Math.floor(i / 10) * 2].scale(2);
		const p2 = p1.scale(0);
		const ii = Math.floor(i / 2);
		const pos = Vector2.lerp(p1, p2, (ii % 5) / 4);
		return all(
			star.position(pos, 1, (v) => easeOutBack(easeInOutQuad(v))),
			starFlicker[i](getFlicker(i, 0), 1.3),
		);
	});

	yield* waitFor(waitDur);

	const task = yield loop(() => {
		return tween(3, (value) => {
			starFlicker.forEach((flick, i) => {
				flick(getFlicker(i, value));
			});
		});
	});

	yield* all(
		angle(-30, 1.5, easeOutBack),
		allMap(stars, (star, _i) => {
			const i = _i + 8;
			const p1 = points[Math.floor(i / 5) % 10];
			const p2 = points[Math.ceil(i / 5) % 10];
			const xOffset = easeOutQuad(random.nextFloat(0, 1)) * 3;
			const yOffset = easeOutQuad(random.nextFloat(0, 1)) * 3;
			const a = random.nextFloat(0, 360);
			let pos = Vector2.lerp(p1, p2, (i % 5) / 5);
			pos = pos.add(new Vector2(xOffset, yOffset).rotate(a));
			return chain(
				waitFor(random.nextFloat(0, 0.2)),
				star.position(pos, 1.5 - random.nextFloat(0, 0.4), (v) =>
					easeInOutBack(v),
				),
			);
		}),
	);

	yield* waitFor(waitDur * 10);

	yield* allMap(range(n), (i) => starOpacity[i](0, 0.5));
	cancel(task);

	yield* waitFor(waitDur);
});
