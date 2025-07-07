import { Gradient, makeScene2D, View2D } from '@motion-canvas/2d';
import {
	all,
	chain,
	createRef,
	createSignal,
	FullSceneDescription,
	map,
	PossibleColor,
	ThreadGenerator,
	ThreadGeneratorFactory,
	TimingFunction,
	tween,
	ValueDispatcher,
	Vector2,
	waitFor,
} from '@motion-canvas/core';
import { Background } from '~/components/Background';
import { Credits } from '~/components/Credits';
import { useViewport } from '~/hooks/useViewport';

export { getSketchId } from '../hooks/useSketchId';

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

// TODO(bret): rename this
// Gage: placeListItem
export const positionItemInRow = (
	i: number,
	count: number,
	size: number,
	padding = 0,
) => {
	const spacing = size + padding;
	const start = -(count - 1) * 0.5 * spacing;
	return start + i * spacing;
};

export const getViewportData = (view: View2D) => {
	return useViewport();
};

export const useDimensions = () => {
	return useViewport();
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

export function tweenLoop(
	seconds: number,
	iterations: number,
	onProgress: (value: number, loopIndex: number, time: number) => void,
	timingFunction?: TimingFunction,
	onEnd?: (value: number, iterations: number, time: number) => void,
): ThreadGenerator {
	return tween(
		seconds,
		(value, time) => {
			const _value = timingFunction?.(value) ?? value;
			const t = _value * iterations;
			const v = t % 1;
			const loopIndex = Math.floor(t / iterations);
			return onProgress(v, loopIndex, time);
		},
		(value, time) => {
			const v = value * iterations;
			return onEnd?.(v, iterations, time);
		},
	);
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

// TODO(bret): I need to rename this
export const easeFullCosineRotation: TimingFunction = (
	value,
	from = 0,
	to = 1,
) => {
	return map(from, to, Math.cos(value * 2 * Math.PI) * 0.5 + 0.5);
};

export const easeFullSineRotation: TimingFunction = (
	value,
	from = 0,
	to = 1,
) => {
	return map(from, to, Math.sin(value * 2 * Math.PI) * 0.5 + 0.5);
};

// The below is from aarthificial on GitHub
// link: https://github.com/motion-canvas/motion-canvas/issues/954#issuecomment-1939415237
type CyclicConfig<T> = (params: T) => CyclicConfig<T>;

export function parametrize<T>(scene: FullSceneDescription, params: T) {
	const typeScene = scene as FullSceneDescription<CyclicConfig<T>>;
	const newScene = {
		...typeScene,
		config: typeScene.config(params),
		onReplaced: new ValueDispatcher(scene),
	};

	typeScene.onReplaced.subscribe((value) => {
		newScene.onReplaced.current = {
			...newScene,
			config: value.config(params),
		};
	}, false);

	return newScene;
}

export function makeParametrizedScene<T>(
	factory: (view: View2D, params: T) => ThreadGenerator,
) {
	return makeScene2D(
		((params: T) =>
			function* (view: View2D) {
				yield* factory(view, params);
			}) as unknown as ThreadGeneratorFactory<View2D>,
	);
}
