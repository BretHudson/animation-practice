import { Gradient, View2D } from '@motion-canvas/2d';
import {
	all,
	chain,
	createRef,
	createSignal,
	PossibleColor,
	ThreadGenerator,
	Vector2,
	waitFor,
} from '@motion-canvas/core';
import { Background } from '~/components/Background';
import { Credits } from '~/components/Credits';

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

export const getViewportData = (view: View2D) => {
	const [viewW, viewH] = [view.width(), view.height()];
	const landscape = viewW >= viewH;
	const axisX = 'x' as const;
	const axisY = 'y' as const;
	const axes = landscape ? [axisX, axisY] : [axisY, axisX];
	const [primaryAxis, crossAxis] = axes;
	const byOrientation = <T,>(primary: T, cross: T): T => {
		return landscape ? primary : cross;
	};

	return {
		landscape,
		portrait: !landscape,
		viewW,
		viewH,
		axes,
		primaryAxis,
		crossAxis,
		byOrientation,
	} as const;
};

export function* repeat(
	iterations: number,
	thing: (iterationIndex: number) => ThreadGenerator,
) {
	for (let i = 0; i < iterations; ++i) {
		yield* thing(i);
	}
}

export function* allMap<T>(
	arr: T[],
	callback: (item: T, index: number) => ThreadGenerator,
) {
	yield* all(...arr.map(callback));
}

export function* chainWithWait(
	waitSeconds: number,
	...items: ThreadGenerator[]
) {
	yield* waitFor(waitSeconds);
	yield* chain(
		...items.map((item) => {
			return chain(item, waitFor(waitSeconds));
		}),
	);
}

export function getSketchId(importMetaUrl: string) {
	return +/sketch-(\d+)/.exec(importMetaUrl)[1];
}

export const initSpeed = (view: View2D, bg: Background, base = 1) => {
	const speed = createSignal(base);
	const speedStr = createSignal(() => `Speed: ${(speed() / base).toFixed(1)}x`);
	const ref = createRef<Credits>();

	view.add(
		<Credits.AoC
			ref={ref}
			author={speedStr}
			textAlign="left"
			bottomLeft={bg.bottomLeft}
			view={view}
		/>,
	);

	function* _waitFor(value: number) {
		yield* waitFor(value / speed());
	}

	const adjust = (value: number) => value / speed();

	return {
		speed,
		adjust,
		waitFor: _waitFor,
		ref,
	};
};
