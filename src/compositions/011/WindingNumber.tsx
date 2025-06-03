import { Circle, Layout, Line, Ray, RayProps } from '@motion-canvas/2d';
import {
	createRef,
	createSignal,
	easeInOutQuart,
	easeOutCubic,
	EPSILON,
	map,
	RAD2DEG,
	range,
	Reference,
	SimpleSignal,
	useRandom,
	Vector2,
	waitFor,
} from '@motion-canvas/core';
import { WGTheme } from '~/util/themes';

function getAccumulatedAngle(points: Vector2[], index: number) {
	const numPoints = points.length;
	const pA = Math.floor(index) % numPoints;
	const pB = Math.ceil(index) % numPoints;

	let acc = 0;
	for (let i = 0; i < pA; ++i) {
		acc += Vector2.angleBetween(points[i], points[(i + 1) % numPoints]);
	}

	const partWay = Vector2.lerp(points[pA], points[pB], index % 1);
	acc += Vector2.angleBetween(points[pA], partWay);
	return acc * RAD2DEG;
}

interface LineWithNodesOptions {
	lineWidth: number;
	stroke: RayProps['stroke'];
	points: Vector2[];
	wp: WP;
	startSize: number;
	endSize: number;
	opacity: SimpleSignal<number>;
}

function createLineWithNodes({
	lineWidth,
	stroke,
	wp,
	points,
	startSize,
	endSize,
	opacity,
}: LineWithNodesOptions) {
	const { from, pointIndex, ray } = wp;

	const lineRef = createRef<Line>();

	const _points = [...points].map((p) => p.sub(from));
	const [firstPoint] = _points;
	const numPoints = _points.length;

	const startAngle = firstPoint.degrees;
	const endAngle = createSignal(() => {
		if (pointIndex() === numPoints) return startAngle + 360;
		return startAngle + getAccumulatedAngle(_points, pointIndex());
	});

	const percentage = createSignal(() => pointIndex() / numPoints);

	const to = createSignal(() => {
		return lineRef().getPointAtPercentage(percentage()).position;
	});

	const shared = {
		stroke,
		from,
	};

	const endCapPos = createSignal(() => {
		return ray().getPointAtPercentage(ray().end()).position;
	});

	const computedEndSize = createSignal(() => {
		return map(startSize, endSize, ray().end());
	});

	return (
		<Layout>
			<Line
				ref={lineRef}
				lineWidth={20}
				points={points.concat(points[0])}
				end={percentage}
			/>

			<Ray
				end={0}
				ref={ray}
				lineWidth={lineWidth}
				{...shared}
				to={to}
				opacity={opacity}
			/>
			<Ray
				end={ray().end}
				lineWidth={4}
				{...shared}
				to={points[0]}
				opacity={createSignal(() => Math.floor(opacity()))}
			/>
			{startSize ? (
				<Circle position={ray().from} size={startSize} fill={stroke} />
			) : null}
			{endSize ? (
				<Circle
					position={endCapPos}
					size={computedEndSize}
					fill={stroke}
					opacity={opacity}
				/>
			) : null}
			<Circle
				position={from}
				stroke={stroke}
				size={startSize + 15}
				lineWidth={10}
				startAngle={startAngle}
				endAngle={endAngle}
				scaleX={1.5}
				scaleY={1.5}
				counterclockwise
				opacity={opacity}
			/>
		</Layout>
	);
}

interface WP {
	pointIndex: SimpleSignal<number>;
	from: Vector2;
	ray: Reference<Ray>;
}

const useWindingPoint = (from: Vector2): WP => ({
	from,
	pointIndex: createSignal(0),
	ray: createRef<Ray>(),
});

export function windingNumberComposition() {
	const random = useRandom(4);

	const size = 30;

	const numPoints = 12;

	const points = range(numPoints).map((index) => {
		const d = 250;
		const a = -(index / numPoints) * 2 * Math.PI;
		const x = Math.cos(a) * d * 1.3 + random.nextInt(-50, 50);
		const y = Math.sin(a) * d + random.nextInt(-50, 50);
		return new Vector2(x, y);
	});

	const inner = useWindingPoint(new Vector2(-100, 0));
	const outer = useWindingPoint(new Vector2(400, 170));

	const lineWidth = 12;
	const rayLineWidth = lineWidth - 2;
	const color = '#eef';

	const shared = {
		lineWidth: rayLineWidth,
		startSize: size,
	} as const;

	const opacity = createSignal(1);

	const innerRay = createLineWithNodes({
		...shared,
		wp: inner,
		points,
		endSize: size + 5,
		stroke: WGTheme.yellow,
		opacity,
	});

	const outerRay = createLineWithNodes({
		...shared,
		wp: outer,
		points,
		endSize: size - 5,
		stroke: WGTheme.blue,
		opacity,
	});

	const layout = (
		<Layout x={-35} y={-30}>
			<Line
				points={points}
				stroke={color}
				lineWidth={lineWidth}
				opacity={0.7}
				closed
			/>
			{...points.map((v) => (
				<Circle x={v.x} y={v.y} size={size} fill={color} />
			))}
			{innerRay}
			{outerRay}
		</Layout>
	);

	function* animateLine(line: WP) {
		yield* line.ray().end(0).end(1, 0.7, easeOutCubic);
		yield* waitFor(0.15);
		yield* line.pointIndex(numPoints, 3, easeInOutQuart);
	}

	function* animateInner() {
		yield* animateLine(inner);
	}

	function* animateOuter() {
		yield* animateLine(outer);
	}

	function* fadeOut() {
		yield* opacity(0, 0.5);
	}

	return {
		animateInner,
		animateOuter,
		fadeOut,
		layout,
		numPoints,
	};
}
