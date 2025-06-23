import {
	canvasStyleSignal,
	CanvasStyleSignal,
	Circle,
	initial,
	makeScene2D,
	Node,
	nodeName,
	NodeProps,
	PossibleCanvasStyle,
	Rect,
	signal,
	Txt,
} from '@motion-canvas/2d';
import {
	createRef,
	createSignal,
	easeOutBack,
	easeOutElastic,
	easeOutQuad,
	makeRef,
	sequence,
	SignalValue,
	SimpleSignal,
	waitFor,
} from '@motion-canvas/core';
import { Week6Credits } from '~/components/week/week-006/Credits';
import { Week6Title } from '~/components/week/week-006/Title';
import { useViewport } from '~/hooks/useViewport';

import { useWeek6 } from '~/hooks/useWeek6';
import { WGTheme } from '~/util/themes';

interface CircleRevealProps extends NodeProps {
	fill?: SignalValue<PossibleCanvasStyle>;
}

@nodeName('CircleReveal')
class CircleReveal extends Node {
	@initial(0)
	@signal()
	public declare readonly t: SimpleSignal<number, this>;

	@initial('#1a1a1a')
	@canvasStyleSignal()
	public declare readonly fill: CanvasStyleSignal<this>;

	constructor(props: CircleRevealProps) {
		super(props);

		const { viewW, viewH } = useViewport();
		const hyp = Math.ceil(Math.sqrt(viewW * viewW + viewH * viewH));

		this.cache(true);

		const circleSize = createSignal(() => {
			return this.t() * hyp;
		});

		this.add(<Rect width={viewW} height={viewH} fill={this.fill} />);
		this.add(
			<Circle
				size={circleSize}
				fill="white"
				compositeOperation="destination-out"
			/>,
		);
	}

	*reveal(dur: number) {
		yield* this.t(1, dur, easeOutQuad);
	}
}

export default makeScene2D(function* (view) {
	const { byOrientation, portrait, viewW, viewH } = useViewport();

	const { shared } = useWeek6('Transitions 1');

	const week6Title = view.childAs<Week6Title>(2);
	const week6Credits = view.childAs<Week6Credits>(3);
	week6Title.y(0);
	week6Title.childAs<Txt>(0).fontSize(128);

	week6Title.zIndex(0);
	week6Credits.zIndex(1);

	const scale = byOrientation(1, 1 / 1.2);
	shared.fontSize = 96 * scale;

	const transition = <Node />;
	view.add(transition);

	transition.zIndex(0);

	const colors = [
		'black',
		WGTheme.bubbleFg,
		WGTheme.blue,
		WGTheme.yellow,
	].reverse();
	const circles: CircleReveal[] = [];
	colors.forEach((c, i) => {
		transition.add(<CircleReveal ref={makeRef(circles, i)} fill={c} />);
	});
	circles.reverse();
	yield* sequence(0.2, ...circles.map((c) => c.reveal(0.8)));

	const rects: Rect[] = [];
	colors.forEach((c, i) => {
		transition.add(
			<Rect
				ref={makeRef(rects, i)}
				width={viewW}
				height={viewH}
				fill={c}
				offset={[0, 2]}
			/>,
		);
	});
	yield* waitFor(0.3);

	yield* sequence(0.2, ...rects.map((c) => c.offset([0, 0], 1)));
	yield* waitFor(0.3);
});
//
