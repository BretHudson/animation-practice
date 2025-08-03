import { Layout, makeScene2D, Node, Rect, Video } from '@motion-canvas/2d';
import {
	Color,
	createRef,
	createSignal,
	easeInCubic,
	makeRef,
	range,
	sequence,
	useRandom,
	Vector2,
	waitFor,
} from '@motion-canvas/core';
import { getViewportData, positionItemInRow } from '~/util';

import motionBlurGlsl from '../../shaders/shader-055.glsl';
import { useWeek7 } from '~/hooks/useWeek7';
import { WGTheme } from '~/util/themes';

const textColor = new Color(WGTheme.bubbleBg);

export default makeScene2D(function* (view) {
	const { byOrientation, viewH } = getViewportData(view);

	const { bg, credits } = useWeek7(undefined, '#111', 5);

	bg().fill('#181820');

	credits().sketchTxt().fill(textColor);
	credits().authorTxt().fill(textColor);
	credits().authorTxt().stroke('#111');
	credits().authorTxt().lineWidth(5);
	credits().authorTxt().strokeFirst(true);

	const numVids = 60;

	const gridBorder = '#323143';
	const frameBorder = '#4C4C67';

	const gap = 5;
	// const size = 180;
	// const size = 250;
	const size = byOrientation(400, 300);
	const mask = createRef<Rect>();
	const n = 3;
	const videoWrapper: Node[] = [];

	const col = n;
	const row = Math.ceil(numVids / col);

	const color = new Color('#dde');
	const random = useRandom(123);

	const layout = createRef<Layout>();
	view.add(
		<Layout ref={layout}>
			<Rect
				width={(size + gap) * col - 2}
				height={(size + gap) * row - 2}
				stroke={gridBorder}
				lineWidth={1}
			/>
			{...range(numVids).map((i) => (
				<Node
					ref={makeRef(videoWrapper, i)}
					x={positionItemInRow(i % n, col, size, gap)}
					y={positionItemInRow(Math.floor(i / n), 1.5, size, gap)}
					cache
				>
					<Rect ref={mask} width={size} height={size} fill="white" />
					<Rect
						width={size}
						height={size}
						fill={color
							.darken(random.nextFloat(-0.25, 0.25))
							.set('lch.h', Math.floor(i / n) * 50)}
						compositeOperation={'source-in'}
					/>
					<Rect
						width={size + 0.5}
						height={size + 0.5}
						stroke={frameBorder}
						lineWidth={1}
					/>
				</Node>
			))}
		</Layout>,
	);

	const samples = 12;
	const scale = 0.3;
	let lastPosition = layout().position();
	const velocity = createSignal(() => {
		const curPosition = layout().position();
		const delta = lastPosition.sub(curPosition).scale(scale / samples / viewH);
		lastPosition = curPosition;
		return delta;
	});

	if (true) {
		const inView = videoWrapper.slice(0, byOrientation(9, 15));
		inView.forEach((e) => e.opacity(0));
		yield* waitFor(0.3);

		yield* waitFor(0.3);
		yield* sequence(0.05, ...inView.map((e) => e.opacity(1, 0.3)));
	}

	layout().shaders({
		//
		fragment: motionBlurGlsl,
		uniforms: {
			axis: 0,
			samples,
			velocity,
		},
	});
	yield* layout().y(
		-positionItemInRow(row - 1.5, 1.5, size, gap),
		(1.5 / 180) * size,
	);
	layout().shaders.reset();

	if (true) {
		velocity(new Vector2(0));
		const inView = videoWrapper.slice(-byOrientation(9, 15));

		yield* waitFor(0.3);
		yield* sequence(0.05, ...inView.map((e) => e.opacity(0, 0.3)));
	}

	yield* waitFor(0.3);
});
