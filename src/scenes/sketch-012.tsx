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
	createRef,
	createSignal,
	DEG2RAD,
	easeInBack,
	easeOutBack,
	easeOutCubic,
	easeOutQuad,
	makeRef,
	range,
	sequence,
	SimpleSignal,
	Spacing,
	Thread,
	ThreadGenerator,
	tween,
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
	const radius = Math.floor(12 * scale);
	const spacing = Math.floor(20 * scale);
	const yOffset = Math.floor(30 * scale);
	const num = 5;

	view.add(
		<>
			<Week3Title y={-650 * 0.5 - 110} view={view} title="Fade-In Effects" />
			<Week3Credits view={view} sketchId={getSketchId(import.meta.url)} />
		</>,
	);

	// const rectLayout = createRef<AnimLayout>();
	const _rect = createRef<Rect>();
	view.add(
		<>
			{range(num).map((index) => {
				return (
					<AnimLayout
						x={positionItemInRow(index, num, size, spacing)}
						ref={makeRef(rectLayouts, index)}
						opacity={0}
					>
						<Rect
							ref={_rect}
							size={size}
							fill={WGTheme.yellow}
							radius={[radius * 6, radius]}
						/>
					</AnimLayout>
				);
			})}
			,
		</>,
	);

	yield* waitFor(0.25);

	{
		const layout = rectLayouts[0];
		yield* all(layout.opacity(1, 0.5, easeOutQuad));
	}

	{
		const layout = rectLayouts[3];
		layout.y(yOffset);
		yield* all(
			layout.y(0, 0.7, easeOutBack),
			layout.opacity(1, 0.5, easeOutQuad),
		);
	}

	{
		const layout = rectLayouts[1];
		layout.y(yOffset);
		const angle = createSignal(-180 * 2 * DEG2RAD);
		layout.scale.x(createSignal(() => Math.cos(angle())));
		yield* all(
			angle(0, 0.8, easeOutBack),
			layout.y(0, 0.7, easeOutBack),
			layout.opacity(1, 0.35, easeOutQuad),
		);
	}

	{
		const layout = rectLayouts[4];
		layout.y(-yOffset);
		yield* all(
			layout.y(0, 0.7, easeOutBack),
			layout.opacity(1, 0.5, easeOutQuad),
		);
	}

	{
		const layout = rectLayouts[2];
		layout.rotation(-35);
		layout.scale(0.8);
		yield* all(
			layout.rotation(0, 0.5, easeOutBack),
			layout.scale(1, 0.55, easeOutBack),
			layout.opacity(1, 0.3, easeOutCubic),
		);
	}

	yield* waitFor(0.25);

	yield* sequence(
		0.1,
		...rectLayouts.map((r) =>
			all(r.opacity(0, 0.7), r.y(yOffset, 0.5, easeInBack)),
		),
	);
	// allMap(rectLayouts, (r) => r.opacity(0, 0.5));

	yield* waitFor(0.25);

	// {
	// 	yield* waitFor(0.3);
	// 	yield* rectLayout().fadeIn().slideUp().all(1);
	// 	yield* waitFor(0.3);
	// 	yield* rectLayout().fadeOut().slideDown().all();
	// }
});
