import {
	Circle,
	Layout,
	Line,
	makeScene2D,
	Node,
	Ray,
	Rect,
} from '@motion-canvas/2d';
import {
	all,
	cancel,
	chain,
	createEaseOutBack,
	createEaseOutElastic,
	createRef,
	createSignal,
	easeInBack,
	easeInElastic,
	easeInQuad,
	easeOutBack,
	easeOutElastic,
	easeOutQuad,
	linear,
	makeRef,
	map,
	range,
	sequence,
	tween,
	useRandom,
	Vector2,
	waitFor,
} from '@motion-canvas/core';
import { SafeArea } from '~/components/SafeArea';
import { Week3Credits } from '~/components/week/week-003/Credits';
import { Week3Title } from '~/components/week/week-003/Title';
import { getSketchId, getViewportData } from '~/util';
import { WGTheme } from '~/util/themes';

export default makeScene2D(function* (view) {
	view.fill(WGTheme.darkBlue);
	view.fontFamily('Outfit');

	const { byOrientation } = getViewportData(view);

	view.add(<SafeArea />);

	view.add(
		<>
			<Week3Title
				y={-650 * 0.5 - 110}
				view={view}
				title="⛔ NO RUNNING ⛔"
				subtitle="Violators will be persecuted"
			/>
			<Week3Credits view={view} sketchId={getSketchId(import.meta.url)} />
		</>,
	);

	const random = useRandom();

	const circles: Circle[] = [];

	const shrink = (v: Vector2) => v.scale(0.93);

	const numWheels = 7;
	const wheelSize = 105;
	const innerSize = 45;
	const metalWidth = 12;
	const gap = 30;
	const boxSize = 80;

	const rotateStart = 0;
	const rotateEnd = -180 * 8;

	const rotate = createSignal(rotateStart);
	const xOffsetScale = createSignal(0);
	const xOffset = createSignal(
		() => xOffsetScale() * (rotate() * 0.5 - rectSkew() * 0.75),
	);

	const scale = byOrientation(1, 0.75);

	const sceneLayout = createRef<Layout>();
	view.add(<Layout scale={scale} ref={sceneLayout}></Layout>);

	// Wheels & their container
	const wheelsRef = createRef<Layout>();
	const layoutY = 105;
	sceneLayout().add(
		<Layout ref={wheelsRef} y={layoutY} gap={gap} layout>
			{range(numWheels).map((index) => {
				return (
					<Circle
						fill="white"
						ref={makeRef(circles, index)}
						size={wheelSize}
						lineWidth={metalWidth}
						stroke="gray"
					/>
				);
			})}
		</Layout>,
	);

	// Wheel centers & lines
	sceneLayout().add(
		<>
			{range(numWheels).map((index) => {
				const start = random.nextInt(0, 180);
				const rotation = createSignal(() => start + rotate());
				return (
					<Node x={circles[index].x} y={wheelsRef().y} rotation={rotation}>
						<Ray
							from={[0, circles[index].top().y]}
							to={[0, circles[index].bottom().y]}
							lineWidth={metalWidth * 0.6}
							stroke="gray"
						/>
						<Circle size={innerSize} fill="black" />
					</Node>
				);
			})}
		</>,
	);

	// Belt
	const [firstWheel] = circles;
	const [lastWheel] = circles.reverse();
	sceneLayout().add(
		['lightgray', 'gray'].map((stroke, index) => (
			<Line
				y={wheelsRef().y}
				closed
				stroke={stroke}
				lineWidth={8}
				basis={'fit-content'}
				scaleX={1.04}
				lineDash={[10, 10]}
				lineDashOffset={createSignal(() => xOffset() - index * 10)}
				radius={50}
				points={[
					firstWheel.top(),
					shrink(firstWheel.topLeft()),
					firstWheel.left(),
					shrink(firstWheel.bottomLeft()),
					firstWheel.bottom(),

					lastWheel.bottom(),
					shrink(lastWheel.bottomRight()),
					lastWheel.right(),
					shrink(lastWheel.topRight()),
					lastWheel.top(),
				]}
			/>
		)),
	);

	// Box
	const y = -(boxSize + wheelSize) * 0.5 + wheelsRef().y();

	const rect = createRef<Rect>();
	const rectLayoutRef = createRef<Layout>();

	const x1 = -180 * 4 * 0.5;
	const x2 = -x1;

	const _rectX = createSignal(x1);
	const rectSkew = createSignal(0);
	const rectX = createSignal(() => _rectX() - rectSkew() * 0.75);

	sceneLayout().add(
		<Layout ref={rectLayoutRef} x={xOffset}>
			<Rect
				ref={rect}
				x={rectX}
				y={y}
				skewX={rectSkew}
				width={boxSize}
				height={boxSize}
				fill={WGTheme.yellow}
			/>
			{/* For testing where the rect would be if there was no skew */}
			{/* I could have also adjusted the origin but w/e */}
			{/* <Rect
				x={_rectX}
				y={y}
				width={boxSize}
				height={boxSize}
				fill="#ff000088"
			/> */}
		</Layout>,
	);

	yield* waitFor(0.3);

	const time = 1;
	console.warn('x', rect().x());
	yield* all(_rectX(x2, time, easeInQuad), rectSkew(-20, time));

	// adjust rect for rotation stuff

	const corner = new Vector2(x2 + boxSize * 0.5, lastWheel.top().y);

	// reposition rect
	rect().offset(new Vector2(1, 1));
	rect().bottomRight(corner);
	rectLayoutRef().y(wheelSize);

	const elasticRotation = yield rect().rotation(45, 1.8, easeOutElastic);
	yield* all(rectSkew(0, 0.7), waitFor(1.4));
	cancel(elasticRotation);
	yield* all(
		rect().rotation(0, 0.3, easeInQuad),
		tween(0.8, (t) => {
			const v = Math.sin(t * 2 * Math.PI);
			rectSkew(v * map(10, 2, t));
			const t2 = easeOutQuad(t);
			const v2 = Math.sin((Math.max(0, t2 - 0) / 1) * 2 * Math.PI);
			const squashV = map(0, 0.25, t);
			rect().scale(
				new Vector2(1 - v2 * squashV, 1 + Math.min(0.2, v2 * squashV)),
			);
		}),
	);

	// reposition rect
	rect().offset(new Vector2(0, 0));
	rect().bottomRight(corner);

	const beltDur = 2.6;
	const skewTransDur = 0.3;
	const skewWaitDur = beltDur - skewTransDur;

	xOffsetScale(1);
	yield* waitFor(0.3);
	yield* all(
		//
		rotate(rotateEnd, 2.6, linear),
		chain(
			rectSkew(-8, skewTransDur),
			waitFor(skewWaitDur),
			rectSkew(0, skewTransDur * 4, createEaseOutElastic(3)),
		),
	);
	yield* waitFor(0.3);
});
