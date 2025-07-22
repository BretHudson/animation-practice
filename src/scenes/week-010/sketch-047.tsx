import {
	Circle,
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
	Vector2,
	waitFor,
} from '@motion-canvas/core';

import { useViewport } from '~/hooks/useViewport';
import { useWeek7 } from '~/hooks/useWeek7';
import { WGTheme } from '~/util/themes';

interface HexagonProps extends PolygonProps {
	q: number;
	r: number;
	s: number;
}

export default makeScene2D(function* (view) {
	const { byOrientation, viewW, viewH } = useViewport();

	const { bg, credits } = useWeek7(); //undefined, '#111f', 10);
	// bg().fill('#fff6ea');
	credits().zIndex(1000);

	const pathX = createSignal(0);
	const pathY = createSignal(0);

	const size = 70; // mm

	const width = 200;
	const height = 700;

	const lineWidth = 10;
	const padding = lineWidth + 40;

	const rawPercentage = createSignal(1);
	const percentage = createSignal(1);
	const fillHeight = createSignal(() => {
		return height * percentage();
	});
	const colorT = createSignal(() => 1 - (rawPercentage() - 0.2) / 0.8);
	const color = createSignal(() => {
		return Color.lerp('#0d0', '#d00', colorT(), 'hsl');
	});

	const spline = createRef<Spline>();
	view.add(
		<Layout>
			<Rect
				y={height * 0.5}
				width={width}
				height={fillHeight}
				fill={color}
				radius={15}
				offsetY={1}
			/>
			<Rect
				width={width + padding * 0.5}
				height={height + padding * 0.5}
				// fill="transparent"
				// padding={100}
				// stroke={'red'}
				stroke={bg().fill}
				// stroke={'blue'}
				radius={30}
				lineWidth={padding / 2}
			/>
			<Rect
				width={width + padding}
				height={height + padding}
				// fill="transparent"
				// padding={100}
				stroke="#ccc"
				radius={40}
				lineWidth={lineWidth}
			/>
		</Layout>,
	);

	const text = createSignal(() => {
		return Math.round(rawPercentage() * 100) + '%';
	});

	view.add(
		<Txt
			fontFamily="Outfit"
			y={height * 0.5 + padding}
			fontSize={72}
			offsetY={-1}
			text={text}
			fill={'#ccc'}
		/>,
	);

	yield* waitFor(0.3);
	yield* all(
		rawPercentage(0.2, 0.7, easeOutCubic),
		percentage(0.2, 0.8, (t) => (easeInOutCubic(t) + easeOutBack(t) * 3) / 4),
	);
	yield* waitFor(0.3);

	yield* all(
		rawPercentage(0.4, 0.5, easeOutExpo),
		percentage(0.4, 0.8, easeOutElastic),
	);
	yield* waitFor(0.2);
	yield* all(
		rawPercentage(0.65, 0.5, easeOutExpo),
		percentage(0.65, 0.8, easeOutElastic),
	);
	yield* waitFor(0.1);
	yield* all(
		rawPercentage(1, 0.3, easeOutExpo),
		percentage(1, 0.4, easeOutBack),
	);
});
