import { Layout, makeScene2D } from '@motion-canvas/2d';
import {
	createEffect,
	createRef,
	createSignal,
	easeInQuad,
	easeOutQuad,
	spawn,
	waitFor,
} from '@motion-canvas/core';
import { createCodeBlock } from '~/components/CodeBlock';
import { SafeArea } from '~/components/SafeArea';
import { ArraySlot } from '~/components/week/week-004/ArraySlot';
import { Week4Credits } from '~/components/week/week-004/Credits';
import { Week4Title } from '~/components/week/week-004/Title';
import { getViewportData } from '~/util';

export default makeScene2D(function* (view) {
	const { byOrientation } = getViewportData(view);

	view.fontFamily('Outfit');

	view.add(<SafeArea />);

	view.add(
		<>
			<Week4Title y={-650 * 0.5 - 110} title="Arrays" subtitle="" />
			<Week4Credits />
		</>,
	);

	const itemSize = byOrientation(220, 180);
	const arrLen = 5;
	const { codeBlock, code } = createCodeBlock(
		byOrientation(1200, itemSize * 5),
	);

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
			{codeBlock}
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
					startSmall
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
