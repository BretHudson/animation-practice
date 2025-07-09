import {
	Camera,
	Node,
	Circle,
	Layout,
	makeScene2D,
	Rect,
	Txt,
	TxtProps,
	Pattern,
} from '@motion-canvas/2d';
import {
	all,
	chain,
	Color,
	createRef,
	createSignal,
	easeInCirc,
	easeInCubic,
	easeInOutCubic,
	easeInOutQuad,
	easeInQuad,
	easeOutBack,
	easeOutCubic,
	easeOutQuad,
	makeRef,
	sequence,
	Vector2,
	waitFor,
} from '@motion-canvas/core';
import { CodeBlockWithTitle } from '~/components/CodeBlockWithTitle';
import { TxtPlus } from '~/components/TxtPlus';

import { useViewport } from '~/hooks/useViewport';

import { useWeek7 } from '~/hooks/useWeek7';
import { WGTheme } from '~/util/themes';

export default makeScene2D(function* (view) {
	const { viewW, viewH } = useViewport();
	const w = 1920 / 4;
	const h = 1920 / 4;
	const offscreenCanvas = new OffscreenCanvas(w, h);
	const ctx = offscreenCanvas.getContext('2d');
	if (!ctx) throw new Error('oh no');
	const hW = w / 2;
	const hH = h / 2;
	ctx.fillStyle = 'rgb(255 255 255 / 5%)';
	ctx.fillRect(0, 0, hW, hH);
	ctx.fillRect(hW, hH, hW, hH);

	const p = new Pattern({
		image: offscreenCanvas,
		repetition: 'repeat',
	});

	useWeek7();

	const scene = <Node />;

	scene.add(<Rect width={viewW * 3} height={viewH * 3} fill={p} zIndex={0} />);

	const size = 240;

	const colors = ['#77ee77', '#eeee66', '#eeC0CB'];

	const radius = createSignal(0);
	// view.add(<Circle size={size * 2} fill="red" />);
	const circles: Circle[] = [];
	const circleContainer = createRef<Layout>();
	scene.add(
		<Layout ref={circleContainer}>
			{colors.map((c, i) => {
				const pos = createSignal(() => {
					return Vector2.up.scale(radius()).rotate(-i * 120);
				});
				return (
					<Circle
						ref={makeRef(circles, i)}
						position={pos}
						fill={c}
						size={radius}
						stroke={WGTheme.bubbleBg}
						// lineDash={[120, 70]}
						strokeFirst
						lineWidth={createSignal(() => {
							const cSize = circles[i].size().x;
							if (cSize <= radius()) return 0;
							return (cSize - radius()) / 1.5;
						})}
					/>
				);
			})}
		</Layout>,
	);

	const ref = createRef<Camera>();
	view.add(
		<Camera.Stage
			cameraRef={ref}
			scene={scene}
			size={view.size()}
			opacity={createSignal(() => radius() / size)}
		/>,
	);

	// animation

	yield* all(
		radius(size, 1.5, easeOutBack),
		circleContainer().rotation(120 * 4.5, 1.7, easeOutCubic),
	);

	yield* waitFor(0.3);
	for (let i = 1; i <= 3; ++i) {
		const grow = circles.map((c, j) => {
			return c.size(radius() * (i % 3 === j ? 1.5 : 0.75), 1);
		});
		yield* all(...grow, ref().rotation(-i * 120, 1, easeInOutQuad));

		yield* waitFor(0.3);
	}

	// circles.forEach((c) => c.opacity(0.5));
	yield* all(...circles.map((c) => c.size(radius, 1)));

	yield* waitFor(0.3);
	yield* all(
		radius(0, 1, easeInQuad),
		circleContainer().rotation(120 * 9, 1.2, easeInCubic),
	);
	yield* waitFor(1);
});
