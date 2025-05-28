import { Layout, makeScene2D, Txt, LayoutProps, Ray } from '@motion-canvas/2d';
import {
	getSketchId,
	getViewportData,
	initSpeed,
	positionItemInRow,
} from '~/util';
import {
	all,
	makeRef,
	createSignal,
	easeInOutQuad,
	waitFor as _waitFor,
	chain,
	createRef,
	SignalValue,
	sequence,
	Vector2,
	easeInOutCubic,
	easeInOutQuint,
} from '@motion-canvas/core';

import { addBgCredits } from '~/components/advent-of-code/AoCLayout';
import { Cell } from '~/components/advent-of-code/Cell';
import { AoCTheme } from '~/util/themes';

const waitDur = 0.3;

const parseDay2Examples = (...examples: string[]) => {
	return examples.map((v) => v.split(' ').map(Number));
};

const part1Examples = parseDay2Examples('5 1 9 5', '7 5 3', '2 4 6 8');

export interface ValueDisplayProps extends LayoutProps {
	label: string;
	value: SignalValue<number>;
	speed?: SignalValue<number | null>;
}

export default makeScene2D(function* (view) {
	const { byOrientation } = getViewportData(view);

	view.fontFamily(AoCTheme.fontFamily);

	const bg = addBgCredits(view, {
		sketchId: getSketchId(import.meta.url),
		year: 2017,
		day: 2,
		// TODO(bret): highlight which part we're doing :)
		part: 1,
		wip: true,
	});

	// TODO(bret): useSpeed() hook
	const { speed, adjust, waitFor } = initSpeed(view, bg());

	const yGap = 120;

	const examples = part1Examples;

	const cells = examples.map(() => [] as Cell[]);

	const curExample = createSignal(0);
	const curExampleInt = createSignal(() => Math.round(curExample()));
	const y = createSignal(() => curExample() * -yGap);

	const mainLayout = createRef<Layout>();
	const sequenceLayout = createRef<Layout>();

	const cellSize = 100;
	const cellPad = 50;

	const layoutYOffset = byOrientation(0, 20);
	view.add(<Layout ref={mainLayout} y={layoutYOffset} />);
	mainLayout().add(<Layout y={100} ref={sequenceLayout} />);

	sequenceLayout().add(
		<Layout y={y}>
			{examples.map((input, index) => (
				<Layout
					y={index * yGap}
					opacity={createSignal(() => 1 - Math.abs(index - curExample()))}
				>
					{input.map((digit, i) => (
						<Cell
							ref={makeRef(cells[index], i)}
							speed={speed}
							x={positionItemInRow(i, input.length, cellSize, cellPad)}
							value={digit.toString()}
							size={100}
						/>
					))}
				</Layout>
			))}
		</Layout>,
	);
	const _curIndex = createSignal(0);
	const curIndex = createSignal(() => Math.round(_curIndex()));
	const curCells = createSignal(() => cells[curExampleInt()]);
	const prevCell = createSignal(() => curCells()[curIndex() - 1]);
	const curCell = createSignal(() => curCells()[curIndex()]);

	const maxCell = createRef<Cell>();
	const minCell = createRef<Cell>();

	const maxArrow = createRef<Ray>();
	const minArrow = createRef<Ray>();

	const pointAtIndex = createSignal(-1);
	const pointAtX = createSignal(() => {
		return positionItemInRow(
			pointAtIndex(),
			curCells().length,
			cellSize,
			cellPad,
		);
	});

	const rays = [
		//
		{
			topAnchor: 'top' as const,
			text: 'Max',
			rayRef: maxArrow,
			cellRef: maxCell,
			color: AoCTheme.green,
			dir: -1,
		},
		{
			topAnchor: 'bottom' as const,
			text: 'Min',
			rayRef: minArrow,
			cellRef: minCell,
			color: AoCTheme.red,
			dir: 1,
		},
	] as const;

	const arrowLength = 100;
	sequenceLayout().add(
		<Layout x={pointAtX}>
			{rays.map(({ topAnchor, text, rayRef, cellRef, color, dir }) => (
				<Layout
					top={createSignal(() => new Vector2(0, curCells()[0][topAnchor]().y))}
				>
					<Cell
						ref={cellRef}
						stroke={color}
						size={cellSize}
						value={dir > 0 ? '∞' : '-∞'}
						y={dir * (arrowLength + cellSize * 0.5)}
						initialValue={dir * Infinity}
					/>
					<Ray
						ref={rayRef}
						lineWidth={5}
						endArrow
						stroke={color}
						end={1}
						arrowSize={18}
						from={[0, dir * arrowLength]}
						endOffset={10}
						opacity={cellRef().opacity}
					/>
					<Txt
						text={text}
						fill={AoCTheme.white}
						y={dir * (arrowLength + cellSize + 16 + 32)}
						fontSize={42}
						opacity={cellRef().opacity}
						// lineWidth={3}
						// stroke={color}
						// strokeFirst
					/>
				</Layout>
			))}
		</Layout>,
	);

	yield* waitFor(waitDur);

	const numExamples = examples.length;
	for (let i = 0; i < numExamples; ++i) {
		const e = curExample();

		const input = examples[e];
		const n = input.length;
		const h = Math.floor(n / 2);
		for (let i = 0; i < n; ++i) {
			if (curIndex() !== i) {
				yield* _curIndex(i, adjust(0.7), easeInOutCubic);
			}

			yield* all(
				prevCell()?.reset(adjust(0.7)),
				pointAtIndex(i, adjust(0.7)),
				curCell().select(adjust(0.7)),
			);

			const curValue = curCell().value();
			const maxValue = maxCell().value();
			const minValue = minCell().value();
			if (curValue > maxValue) maxCell().updateValue(curValue);
			if (curValue < minValue) minCell().updateValue(curValue);

			yield* waitFor(waitDur);
		}

		yield* waitFor(waitDur);

		yield* all(
			curCell().reset(adjust(0.7)),
			pointAtIndex(curCells().length, adjust(0.7)),
		);

		_curIndex(0);

		yield* waitFor(0.3);
		yield* sequence(
			adjust(0.1),
			all(
				maxCell().opacity(0, adjust(0.3)),
				minCell().opacity(0, adjust(0.3)),
				pointAtIndex(-1, adjust(0.7), easeInOutQuint),
			),
			all(curExample((i + 1) % numExamples, adjust(0.5), easeInOutQuad)),
			chain(
				waitFor(0.2),
				all(
					maxCell().updateValueYield(-Infinity),
					minCell().updateValueYield(Infinity),
					maxCell().opacity(1, adjust(0.3)),
					minCell().opacity(1, adjust(0.3)),
				),
			),
		);
		yield* waitFor(0.3);
		speed(Math.min(2, (i + 1) * 2));
	}
});
