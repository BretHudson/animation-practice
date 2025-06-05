import {
	Circle,
	initial,
	Layout,
	LayoutProps,
	makeScene2D,
	nodeName,
	PossibleCanvasStyle,
	Ray,
	Rect,
	signal,
	Txt,
	View2D,
} from '@motion-canvas/2d';
import {
	all,
	createRef,
	createSignal,
	easeInOutQuad,
	easeInQuad,
	easeOutBack,
	easeOutBounce,
	easeOutCirc,
	easeOutCubic,
	easeOutElastic,
	easeOutExpo,
	easeOutQuad,
	easeOutSine,
	linear,
	map,
	range,
	Reference,
	SignalValue,
	SimpleSignal,
	ThreadGenerator,
	TimingFunction,
	waitFor,
} from '@motion-canvas/core';
import { LineSegment } from '~/components/LineSegment';
import { SafeArea } from '~/components/SafeArea';
import { Week3Credits } from '~/components/week/week-003/Credits';
import { Week3Title } from '~/components/week/week-003/Title';
import {
	allMap,
	getSketchId,
	getViewportData,
	positionItemInRow,
} from '~/util';
import { WGTheme } from '~/util/themes';

interface EaseProps extends LayoutProps {
	title?: string;
	easingFunc: () => TimingFunction;
	view: View2D;
	stroke?: SignalValue<PossibleCanvasStyle> | null;
}

const rectSize = 60;
const dotSize = 18;

@nodeName('Ease')
class Ease extends Layout {
	@initial(() => linear)
	@signal()
	public declare readonly easingFunc: SimpleSignal<TimingFunction, this>;

	@initial(0)
	@signal()
	public declare readonly curTime: SimpleSignal<number, this>;

	@initial('')
	@signal()
	public declare readonly title: SimpleSignal<string, this>;

	private childLayout: Reference<Layout>;

	private text: Reference<Txt>;

	constructor(props: EaseProps) {
		super(props);

		const { stroke = WGTheme.yellow } = props;

		const { view } = props;
		const { byOrientation } = getViewportData(view);

		const { easingFunc } = props;

		const span = byOrientation(800, 500);
		const halfSpan = span / 2;

		const start = -halfSpan;
		const end = halfSpan;

		const lineSize = 20;
		const segments = 10;

		this.easingFunc(easingFunc);

		this.removeChildren();

		const pos = createSignal(() => map(start, end, this.curTime()));
		this.childLayout = createRef<Layout>();

		const titleY = byOrientation(0, -10);
		const lineY = byOrientation(70, 80);
		this.add(
			<Layout y={lineY}>
				<LineSegment
					from={[start, 0]}
					to={[end, 0]}
					stroke={stroke}
					lineWidth={2}
				/>
				{range(segments + 1).map((index) => {
					const x = positionItemInRow(index, segments + 1, span / segments);
					let size = index % 2 ? lineSize * 0.75 : lineSize * 0.5;
					// halfway point
					switch (index) {
						case 0:
						case segments:
							size = lineSize * 1.75;
							break;
						case segments / 2:
							size = lineSize * 1.125;
							break;
					}

					return (
						<Ray
							from={[x, -size]}
							to={[x, size]}
							stroke={stroke}
							lineWidth={2}
						/>
					);
				})}
				<Layout ref={this.childLayout} x={pos}>
					{props.children}
					<Circle
						size={dotSize}
						fill={WGTheme.bubbleBg}
						stroke={WGTheme.bubbleFg}
						lineWidth={4}
					/>
				</Layout>
			</Layout>,
		);

		this.text = createRef<Txt>();
		this.add(
			<Txt
				ref={this.text}
				y={titleY}
				text={this.title}
				fill={WGTheme.bubbleBg}
				fontWeight={150}
			/>,
		);
	}

	*animate(dur: number) {
		yield* this.curTime(1, dur, this.easingFunc());
	}

	hideChildren() {
		this.childLayout().opacity(0);
	}

	*fadeOut() {
		yield* this.childLayout().opacity(0, 0.3);
	}

	*fadeIn() {
		this.curTime(0);
		yield* this.childLayout().opacity(1, 0.3);
	}

	*reset() {
		if (this.opacity() === 1) yield* this.fadeOut();
		yield* this.fadeIn();
	}

	*updateTitle(title: string) {
		if (this.title().length > 0) yield* this.text().opacity(0, 0.3);
		this.text().opacity(0);
		this.title(title);
		yield* this.text().opacity(1, 0.3);
	}
}

export default makeScene2D(function* (view) {
	const { byOrientation } = getViewportData(view);

	view.fill(WGTheme.darkBlue);
	view.fontFamily('Outfit');

	view.add(<SafeArea />);

	view.add(
		<>
			<Week3Title y={-650 * 0.5 - 110} view={view} title="Timing Functions" />
			<Week3Credits view={view} sketchId={getSketchId(import.meta.url)} />
		</>,
	);

	const rect = createRef<Rect>();
	<Rect ref={rect} size={rectSize} fill={WGTheme.yellow} radius={12} />;

	const grayRect = rect().clone();
	grayRect.fill(WGTheme.blue);

	const ease: Ease[] = [];

	const easeLayoutRef = createRef<Layout>();
	view.add(<Layout ref={easeLayoutRef} />);
	const easeLayout = easeLayoutRef();

	const easeLinear = createRef<Ease>();
	const easeDynamic = createRef<Ease>();

	// TODO(bret): show values

	easeLayout.add(
		<Ease
			zIndex={1}
			title="Linear"
			view={view}
			ref={easeLinear}
			easingFunc={() => linear}
		>
			{grayRect}
		</Ease>,
	);
	easeLayout.add(
		<Ease view={view} ref={easeDynamic} easingFunc={() => linear} opacity={0}>
			{rect().clone()}
		</Ease>,
	);

	const animDur = 1.2;
	const layoutDur = 1;

	yield* waitFor(0.3);
	yield* easeLinear().animate(animDur);
	yield* easeLinear().fadeOut();
	// yield* waitFor(0.3);

	function* yieldEase(
		callback: (item: Ease, index: number) => ThreadGenerator,
	) {
		yield* allMap([easeLinear(), easeDynamic()], callback);
	}

	// second line in
	{
		const sep = byOrientation(80, 120);
		easeDynamic().hideChildren();
		yield* all(
			easeLinear().y(-sep, layoutDur, easeOutCubic),
			easeDynamic()
				.y(sep * 0.5)
				.y(sep, layoutDur, easeOutCubic),
			easeDynamic().opacity(1, layoutDur * 0.7),
		);
	}

	const functions = [
		//
		[easeInQuad, 'Ease In'],
		[easeOutQuad, 'Ease Out'],
		[easeInOutQuad, 'Ease In Out'],
		[easeOutSine, 'Sine Out'],
		[easeOutCirc, 'Circ Out'],
		[easeOutExpo, 'Expo Out'],
		[easeOutBounce, 'Bounce Out'],
		[easeOutElastic, 'Elastic Out'],
		[easeOutBack, 'Back Out'],
	] as const;

	for (let i = 0, n = functions.length; i < n; ++i) {
		const [func, title] = functions[i];

		yield* all(
			yieldEase((e) => (i === 0 ? e.fadeIn() : e.reset())),
			easeDynamic().updateTitle(title),
		);

		easeDynamic().easingFunc(() => func);

		yield* waitFor(0.3);

		yield* yieldEase((e) => e.animate(animDur));

		yield* waitFor(0.3);
	}

	// second line out
	{
		yield* all(
			easeDynamic().updateTitle(''),
			yieldEase((e) => e.fadeOut()),
		);
		yield* all(
			easeLinear().y(0, layoutDur, easeOutCubic),
			easeDynamic().y(0, layoutDur, easeOutCubic),
			easeDynamic().opacity(0, layoutDur * 0.7),
		);
	}

	yield* easeLinear().fadeIn();
	yield* waitFor(0.3);
});
