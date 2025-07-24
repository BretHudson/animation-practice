import {
	Circle,
	Img,
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
	useRandom,
	Vector2,
	waitFor,
} from '@motion-canvas/core';

import { useViewport } from '~/hooks/useViewport';
import { useWeek7 } from '~/hooks/useWeek7';
import { positionItemInRow } from '~/util';
import { WGTheme } from '~/util/themes';

export default makeScene2D(function* (view) {
	const { byOrientation, viewW, viewH, axes, dims } = useViewport();

	useWeek7(undefined, '#111f', 10);

	const stripW = byOrientation(viewW, viewH) / 3;

	const layout = createRef<Layout>();
	const colors = ['#ffcc00', '#00ccff', '#ccff00'];
	const strips: Rect[] = [];
	view.add(
		<Layout ref={layout}>
			{colors.map((c, i) => {
				const sign = (i % 2) * 2 - 1;
				<Rect
					ref={makeRef(strips, i)}
					width={byOrientation(stripW, viewW)}
					height={byOrientation(viewH, stripW)}
					fill={c}
				/>;

				strips[i][axes[0]](positionItemInRow(i, colors.length, stripW));
				strips[i][axes[1]](sign * byOrientation(viewH, viewW) * 1.1);

				return strips[i];
			})}
		</Layout>,
	);

	yield* sequence(
		0.15,
		...strips.map((s) => {
			return s[axes[1]](0, 1);
		}),
	);

	yield* waitFor(0.5);

	yield* all(
		//
		...strips.map((s, i) => {
			const third = byOrientation(viewH, viewW) / 3;
			return all(
				s[axes[0]](
					positionItemInRow(i, strips.length, third),
					0.4,
					easeInOutCubic,
				),
				s[dims[0]](third, 0.4, easeInOutCubic),
				s[dims[1]](byOrientation(viewH, viewW) * 2, 0.5, easeOutCubic),
			);
		}),
		layout().rotation(byOrientation(90, -90), 0.5),
	);

	yield* waitFor(0.5);

	yield* layout().opacity(0, 0.4, easeOutQuad);

	yield* waitFor(0.3);
});
