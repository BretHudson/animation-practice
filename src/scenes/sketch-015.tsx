import {
	initial,
	Layout,
	makeScene2D,
	Node,
	Rect,
	signal,
	Txt,
} from '@motion-canvas/2d';
import {
	all,
	Color,
	createRef,
	createSignal,
	DEG2RAD,
	easeInBack,
	easeInOutCubic,
	easeInOutQuad,
	easeOutBack,
	easeOutCubic,
	easeOutQuad,
	makeRef,
	map,
	range,
	sequence,
	SimpleSignal,
	Spacing,
	Thread,
	ThreadGenerator,
	tween,
	Vector2,
	waitFor,
} from '@motion-canvas/core';
import { AnimLayout } from '~/components/week/week-003/AnimLayout';
import { Week3Credits } from '~/components/week/week-003/Credits';
import { Week3Title } from '~/components/week/week-003/Title';
import {
	allMap,
	getSketchId,
	getViewportData,
	positionItemInRow,
} from '~/util';
import { WGTheme } from '~/util/themes';

class Animatable {
	node: Node;
	dur: number;
	constructor(node: Node, dur = 0.3) {
		this.node = node;
		this.dur = dur;
	}

	*fadeIn(dur = this.dur) {
		yield* this.node.opacity(1, dur);
	}
	*fadeOut(dur = this.dur) {
		yield* this.node.opacity(0, dur);
	}

	*slideUp(dur = this.dur) {
		yield* this.node.y(30).y(0, dur);
	}
	*slideDown(dur = this.dur) {
		yield* this.node.y(0).y(30, dur);
	}
}

export default makeScene2D(function* (view) {
	const { byOrientation } = getViewportData(view);

	view.fill(WGTheme.darkBlue);
	view.fontFamily('Outfit');

	const rectLayouts: AnimLayout<Rect>[] = [];

	const scale = byOrientation(1, 0.75);
	const size = Math.floor(150 * scale);
	const radius = Math.floor(24 * scale);
	const spacing = Math.floor(60 * scale);
	const yOffset = Math.floor(30 * scale);
	const fontSize = Math.floor(38 * scale);
	const num = 5;

	view.add(
		<>
			<Week3Title y={-650 * 0.5 - 110} view={view} title="Emphasis Effects" />
			<Week3Credits view={view} sketchId={getSketchId(import.meta.url)} />
		</>,
	);

	const rectPos = (index: number) =>
		positionItemInRow(index, num, size, spacing);

	const _rect = createRef<Rect>();
	view.add(
		<Layout y={yOffset} zIndex={100}>
			{range(num).map((index) => {
				return (
					<AnimLayout
						x={rectPos(index)}
						ref={makeRef(rectLayouts, index)}
						height={size}
					>
						<Rect
							ref={_rect}
							size={size}
							fill={WGTheme.blue}
							radius={radius}
							lineCap="round"
							stroke={WGTheme.yellow}
							lineDash={[0, 10000]}
							zIndex={1}
						/>
						<Rect
							size={size * 1.05}
							fill={WGTheme.darkBlue}
							radius={radius}
							lineCap="round"
							stroke={WGTheme.yellow}
							lineDash={[0, 10000]}
						/>
					</AnimLayout>
				);
			})}
		</Layout>,
	);

	const effects = [
		//
		['pulse', [0.5, 2, 0.5] as const] as const,
		['effectAlarmClock', [] as const] as const,
		['effectGrow', [] as const] as const,
		['colorPulse', [new Color(WGTheme.bubbleBg), 2, 0.6] as const] as const,
		['outline', [2] as const] as const,
		// two
		['spin', [1.2, 1, easeInOutQuad] as const] as const,
		['teeter', [15, 3, 1] as const] as const,
		['effectShrink', [] as const] as const,
		[
			'colorPulse',
			[new Color(WGTheme.blue).darken(2.5), 2, 0.8] as const,
		] as const,
		['effectWiggle', [] as const] as const,
	] as const;

	const scaleY = (v: Vector2, s: number) => new Vector2(v.x, v.y * s);

	const transform = (str: string) => {
		str = str.replace('effect', '');
		return (
			str.charAt(0).toUpperCase() +
			str.slice(1).replaceAll(/[A-Z]/g, (m) => ` ${m}`)
		);
	};

	const n = rectLayouts.length;

	const txtRefs: Txt[] = [];
	view.add(
		<Layout y={yOffset}>
			{effects.map((e, i) => {
				const targetRect = rectLayouts[i % n];
				const scale = 1.675;
				const row = Math.floor(i / n);

				return (
					<Txt
						ref={makeRef(txtRefs, i)}
						text={transform(e[0])}
						textAlign="center"
						// width={size}
						fontSize={fontSize}
						// textWrap
						bottom={row === 0 ? scaleY(targetRect.top(), scale) : undefined}
						top={row === 1 ? scaleY(targetRect.bottom(), scale) : undefined}
						fontWeight={250}
						fill={WGTheme.bubbleBg}
						opacity={1 - row * 0.6}
					/>
				);
			})}
		</Layout>,
	);

	yield* waitFor(0.25);
	for (let i = 0, n = effects.length; i < n; ++i) {
		const [effect, args] = effects[i];
		// TODO(bret): fix this later
		// @ts-expect-error
		yield* rectLayouts[i % rectLayouts.length][effect](...args).all();

		if ((i + 1) % rectLayouts.length === 0) {
			const row = Math.floor((i + 1) / rectLayouts.length);
			yield* waitFor(0.3);
			yield* sequence(
				0.2,
				...range(5).map((index) => {
					const fadeIn = (index + rectLayouts.length * row) % txtRefs.length;
					const fadeOut = (fadeIn + rectLayouts.length) % txtRefs.length;
					return all(
						txtRefs[fadeIn].opacity(1, 0.5),
						txtRefs[fadeOut].opacity(0.4, 0.5),
					);
				}),
			);
			yield* waitFor(0.3);
		}
	}
});
