import {
	Circle,
	Img,
	Layout,
	makeScene2D,
	Node,
	Rect,
	RectProps,
	Spline,
} from '@motion-canvas/2d';
import {
	all,
	Color,
	createRef,
	createSignal,
	easeInBounce,
	easeInOutCubic,
	easeInOutExpo,
	easeInOutQuad,
	easeInOutSine,
	easeInQuad,
	easeInSine,
	easeOutBack,
	easeOutBounce,
	easeOutCubic,
	easeOutElastic,
	easeOutExpo,
	easeOutQuad,
	easeOutSine,
	linear,
	makeRef,
	map,
	range,
	TimingFunction,
	waitFor,
} from '@motion-canvas/core';
import { getViewportData } from '~/util';

import { useWeek7 } from '~/hooks/useWeek7';
import { WGTheme } from '~/util/themes';

const textColor = new Color(WGTheme.bubbleBg);
const fillColor = new Color('#dbdedb');

export default makeScene2D(function* (view) {
	const { byOrientation, viewW, viewH, primaryAxis, crossAxis } =
		getViewportData(view);

	const { bg, credits } = useWeek7(undefined, '#111', 5);

	bg().fill('#f3f6ff');

	credits().sketchTxt().fill(textColor);
	credits().authorTxt().fill(textColor);
	credits().authorTxt().stroke('#111');
	credits().authorTxt().lineWidth(5);
	credits().authorTxt().strokeFirst(true);

	const offsetX = byOrientation(viewW / 4, 0);
	const offsetY = byOrientation(0, -viewH / 4);
	const direction = byOrientation('column', 'row');
	const gap = 40;
	const width = viewW / byOrientation(2, 1.5) - byOrientation(gap, 80);
	const height = viewH / byOrientation(1.5, 2) - byOrientation(80, gap);
	const rectProps: RectProps = {
		width,
		height,
		radius: 40,
		shadowColor: '#7776',
		shadowOffset: [0, 3],
		shadowBlur: 12,
		// lineWidth: 10,
		// stroke: 'white',
	};

	const col1 = createRef<Layout>();
	const col2 = createRef<Layout>();

	const colors1 = [
		//
		'#F2E7C4',
		'#E5F2FB',
		'#F1DFBE',
		'#C0E1D8',
		'#D3B8D2',
		'#CDE8FB',
	];

	const colors2 = [
		//
		'#B5DEE2',
		'#E4C3BD',
		'#E4CCE6',
		'#9DA8CE',
		'#86C1AF',
		'#EAB5C5',
	];

	view.add(
		<Layout>
			<Layout
				ref={col1}
				x={-offsetX}
				y={-offsetY}
				layout
				direction={direction}
				gap={gap}
			>
				{[...colors1, ...colors1, ...colors1].map((fill) => (
					<Rect {...rectProps} fill={fill} />
				))}
			</Layout>
			<Layout
				ref={col2}
				x={offsetX}
				y={offsetY}
				layout
				direction={direction}
				gap={gap}
			>
				<Rect {...rectProps} />
				{[...colors2, ...colors2, ...colors2].map((fill) => (
					<Rect {...rectProps} fill={fill} />
				))}
			</Layout>
		</Layout>,
	);

	const loops = 2;
	const dur = 1.5;
	for (let loop = 0; loop < loops; ++loop) {
		col1()[crossAxis](0);
		col2()[crossAxis](0);
		for (let i = 1; i <= colors1.length; ++i) {
			const offset = i * (byOrientation(height, width) + gap);
			yield* all(
				col1()[crossAxis](offset, dur),
				col2()[crossAxis](-offset, dur),
			);
			yield* waitFor(0.05);
		}
	}
});
