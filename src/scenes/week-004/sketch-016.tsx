import {
	Circle,
	Code,
	Layout,
	makeScene2D,
	nodeName,
	Rect,
	RectProps,
	Txt,
} from '@motion-canvas/2d';
import {
	all,
	createEffect,
	createRef,
	createSignal,
	easeInCubic,
	easeInQuad,
	easeOutCubic,
	easeOutQuad,
	linear,
	makeRef,
	map,
	range,
	Reference,
	sequence,
	spawn,
	waitFor,
} from '@motion-canvas/core';
import { SafeArea } from '~/components/SafeArea';
import { Week4Credits } from '~/components/week/week-004/Credits';
import { Week4Title } from '~/components/week/week-004/Title';
import { getSketchId, getViewportData } from '~/util';

const createCodeBlock = (width: number) => {
	const code = createRef<Code>();
	const rect = (
		<Rect
			fill="#1a1a1a"
			layout
			padding={24}
			radius={8}
			stroke="#889"
			width={width}
			lineWidth={2}
			offset={[0, -1]}
		>
			<Code ref={code} code=" " />
		</Rect>
	);
	return { rect, code };
};

interface ArraySlotProps extends RectProps {
	itemSize: number;
}

const emptyStr = '[empty]';
@nodeName('ArraySlot')
class ArraySlot extends Rect {
	txt: Reference<Txt>;

	constructor(props: ArraySlotProps) {
		super(props);

		const { itemSize } = props;

		this.justifyContent('center');
		this.alignItems('center');

		const t = createSignal(() => this.height() / itemSize);

		const opacity = createSignal(() => map(0, 1, t()));
		this.opacity(opacity);

		const scale = createSignal(() => map(0.25, 1, easeInQuad(t())));

		const txt = createRef<Txt>();
		this.add(
			<Txt
				ref={txt}
				fontFamily={'monospace'}
				textAlign={'center'}
				text={emptyStr}
				fill="lightgray"
				scale={scale}
				fontSize={Math.floor(itemSize / 4.5)}
				// lineHeight={this.height}
				opacity={0.5}
			/>,
		);
		this.txt = txt;
	}

	*updateText(str: string) {
		yield* this.txt().opacity(0, 0.3);
		this.txt().text(str);
		const target = str !== emptyStr ? 1 : 0.5;
		yield* this.txt().opacity(target, 0.3);
	}
}

export default makeScene2D(function* (view) {
	const { byOrientation } = getViewportData(view);

	view.fontFamily('Outfit');
	// view.fontFamily('Chewy');

	view.add(<SafeArea />);

	view.add(
		<>
			<Week4Title y={-650 * 0.5 - 110} view={view} title="Arrays" subtitle="" />
			<Week4Credits view={view} sketchId={getSketchId(import.meta.url)} />
		</>,
	);

	const itemSize = byOrientation(220, 180);
	const arrLen = 5;
	const { code, rect } = createCodeBlock(byOrientation(1200, itemSize * 5));

	// yield* code()
	// 	.code(`const arr = new Array(${arrLen});`, 0.3)
	// 	// .wait(0.5)
	// 	.back(0.5)
	// 	.wait(0.5);
	// yield* code().code('const arr = [1, 2, 3];\nconsole.log("frick")', 0.3);

	const count = createSignal(0);
	const container = createRef<Layout>();
	view.add(
		<Layout
			layout
			direction="column"
			gap={70}
			justifyContent={'center'}
			alignItems={'center'}
		>
			<Layout
				minHeight={itemSize * 0.2}
				alignItems={'center'}
				ref={container}
				layout
			/>
			{rect}
		</Layout>,
	);

	const fontSize: number | undefined = undefined;

	const slots: ArraySlot[] = [];

	createEffect(() => {
		const targetCount = Math.round(count());
		let i = slots.length;
		// add any missing circles
		for (; i < targetCount; i++) {
			const parent = createRef<ArraySlot>();
			const slot = (
				<ArraySlot
					ref={parent}
					stroke={'white'}
					lineWidth={3}
					itemSize={itemSize}
				/>
			) as ArraySlot;
			slots.push(slot);
			container().add(slot);
			spawn(slot.size(0).size(itemSize, 0.5));
		}
		// remove any extra circles
		for (; i > targetCount; i--) {
			const circle = slots.shift()!;
			spawn(circle.size(0, 0.5).do(() => circle.remove()));
		}
	});

	const initialCode = `const arr = new Array(${arrLen});`;
	code().code(initialCode);

	code().code.save();

	yield* count(arrLen, 0.5, easeOutQuad);
	yield* waitFor(1);

	function* updateArr(index: number, value: number) {
		yield* code().code.append(`\narr[${index}] = ${value};`, 0.3);
		yield* waitFor(0.3);
		yield* slots[index].updateText(value.toString());
	}

	yield* updateArr(0, 1);
	yield* waitFor(1);
	yield* updateArr(2, 30);
	yield* waitFor(1);
	yield* updateArr(0, 2);

	yield* waitFor(2);

	yield* count(0, 0.5, easeInQuad);
	yield* code().code(initialCode, 0.5);
	yield* waitFor(1);
});
