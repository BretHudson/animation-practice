import {
	Layout,
	makeScene2D,
	Txt,
	LayoutProps,
	Line,
	Ray,
} from '@motion-canvas/2d';
import { allMap, getViewportData, positionItemInRow } from '~/util';
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
	range,
	DEFAULT,
} from '@motion-canvas/core';

import { addBgCredits } from '~/components/advent-of-code/AoCLayout';
import { Cell } from '~/components/advent-of-code/Cell';
import { AoCTheme } from '~/util/themes';
import { Credits } from '~/components/Credits';

const waitDur = 0.3;

const parseExamples = (...examples: string[]) => {
	return examples.map((v) => v.split('').map(Number));
};

const part1Examples = parseExamples('1122', '1111', '1234', '91212129');
const part2Examples = parseExamples(
	'1212',
	'1221',
	'123425',
	'123123',
	'12131415',
);

export interface ValueDisplayProps extends LayoutProps {
	label: string;
	value: SignalValue<number>;
	speed?: SignalValue<number | null>;
}

export default makeScene2D(function* (view) {
	const { landscape, byOrientation } = getViewportData(view);

	const bg = addBgCredits(view, 2017, 1, 2);

	const base = 1.5;
	const speed = createSignal(base);
	const speedStr = createSignal(() => `Speed: ${(speed() / base).toFixed(1)}x`);

	view.add(
		<Credits.AoC
			author={speedStr}
			textAlign="left"
			bottomLeft={bg().bottomLeft}
			view={view}
		/>,
	);

	const yGap = 120;

	const examples = part2Examples
		.slice(0, landscape ? undefined : -1)
		.map((e) => {
			if (landscape) return e;
			const shortened = e
				.join('')
				.replace('91212129', '912129')
				.split('')
				.map(Number);
			return shortened;
		});

	const cells = examples.map(() => [] as Cell[]);

	function* waitFor(value: number) {
		yield* _waitFor(value / speed());
	}

	const curExample = createSignal(0);
	const curExampleInt = createSignal(() => Math.round(curExample()));
	const y = createSignal(() => curExample() * -yGap);

	const mainLayout = createRef<Layout>();
	const sumLayout = createRef<Layout>();
	const sequenceLayout = createRef<Layout>();

	const cellSize = 100;
	const cellPad = 50;

	const layoutYOffset = byOrientation(0, 20);
	view.add(<Layout ref={mainLayout} y={layoutYOffset} />);
	mainLayout().add(
		<Layout
			y={-180}
			ref={sumLayout}
			layout
			gap={cellPad}
			alignItems="center"
		/>,
	);
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
	const nextIndex = createSignal(() => {
		const n = examples[curExampleInt()].length;
		return (curIndex() + n / 2) % n;
	});
	const curCell = createSignal(() => cells[curExampleInt()][curIndex()]);
	const nextCell = createSignal(() => cells[curExampleInt()][nextIndex()]);

	const curArrow = createRef<Ray>();
	const nextArrow = createRef<Line>();
	const points = createSignal(() => {
		const start = curCell().top();
		const end = nextCell().top();
		return [start, [start.x, start.y - 80], [end.x, end.y - 80], end] as [
			number,
			number,
		][];
	});
	sequenceLayout().add(
		<Line
			points={points}
			radius={4}
			lineDash={[10, 10]}
			ref={nextArrow}
			lineWidth={3}
			endArrow
			stroke={AoCTheme.white}
			end={0}
			endOffset={12}
			arrowSize={18}
		/>,
	);

	const pointAtCurPos = createSignal(() => {
		const _cells = cells[curExampleInt()];
		const i = _curIndex();
		const a = Math.floor(i) % _cells.length;
		const b = Math.ceil(i) % _cells.length;
		return Vector2.lerp(
			_cells[a].bottom(),
			_cells[b].bottom(),
			easeInOutQuad(i % 1),
		);
	});

	const curArrowOpacity = createSignal(() => {
		return 1 - Math.abs(curArrow().parent().x() - curCell().x()) / 150;
	});
	const highlightArrow = 1;
	const deselectArrow = 0.5;
	const arrowLength = 150;
	sequenceLayout().add(
		<Layout top={pointAtCurPos} opacity={curArrowOpacity}>
			<Ray
				ref={curArrow}
				lineWidth={3}
				endArrow
				stroke={AoCTheme.white}
				end={1}
				arrowSize={18}
				from={[0, arrowLength]}
				endOffset={32}
				opacity={highlightArrow}
			/>
			<Txt
				text="Cur"
				fill={AoCTheme.white}
				y={arrowLength + 32}
				fontFamily={AoCTheme.fontFamily}
				fontSize={42}
				opacity={curArrow().opacity}
			/>
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
				yield* _curIndex(i, 0.7 / speed(), easeInOutCubic);
			}

			const next = (i + h) % n;
			const valid = input[i] === input[next];

			nextArrow().stroke(AoCTheme.white).opacity(1);

			yield* sequence(
				0.5 / speed(),
				curCell().select(),
				nextArrow()
					.end(0)
					.end(1, 0.8 / speed(), easeInOutCubic),
				all(
					...range(n).map((index) => {
						if (index !== curIndex() && index !== nextIndex()) {
							return cells[e][index].deselect();
						}
					}),
					chain(nextCell().softSelect()),
				),
			);

			yield* waitFor(waitDur);
			yield* all(
				curCell().validate(valid),
				nextCell().validate(valid),
				nextArrow().opacity(0, 0.5 / speed()),
			);

			if (valid) {
				yield* waitFor(waitDur);

				const dup = curCell().clone();
				mainLayout().add(dup);
				dup.position(
					curCell()
						.position()
						.transformAsPoint(sequenceLayout().localToParent()),
				);
				curCell().opacity(0);

				const dummyCell = createRef<Cell>();
				sumLayout().add(<Cell ref={dummyCell} size={0} value="" opacity={0} />);
				let pos = dummyCell()
					.position()
					.transformAsPoint(sumLayout().localToParent());
				const prevX = sumLayout().x();
				sumLayout().x(prevX + cellPad / 2);
				curCell().fill(DEFAULT);
				yield* all(
					// increase dummy cell size
					dummyCell().size(cellSize, 0.5 / speed(), easeInOutQuad),
					// move the duplicate
					dup.position(pos, 0.5 / speed(), easeInOutQuad),
					// move the sum layout over
					sumLayout().x(prevX, 0.45 / speed(), easeInOutQuad),
					// deselect the cells
					curCell().deselect(),
					nextCell().deselect(),
				);

				dummyCell().remove();
				dup.reparent(sumLayout());
			}

			yield* all(
				nextArrow().opacity(0, 0.3 / speed()),
				...range(n).map((index) => cells[e][index].reset()),
			);

			yield* waitFor(waitDur * 2);
		}

		const sumCells = sumLayout().childrenAs<Cell>();
		const sum = sumCells.reduce(
			(acc, cell) => acc + +cell.childrenAs<Txt>()[0].text(),
			0,
		);

		yield* sumCells.map((child, i, arr) => {
			const x = positionItemInRow(i, arr.length, cellSize, cellPad);
			child.reparent(sumLayout().parent());
			child.position.x(x);
			return sequence(
				0.2 / speed(),
				child.position.x(0, 0.3 / speed()),
				child.childrenAs<Txt>()[0].text(sum.toString(), 0.1 / speed()),
			);
		});

		yield* waitFor(waitDur * 2);

		yield* all(
			allMap(sumCells, (child) => {
				return child.opacity(0, 0.3);
			}),
			curArrow().opacity(0, 0.3),
		);

		sumCells.forEach((child) => child.remove());
		_curIndex(0);

		yield* curExample((i + 1) % numExamples, 0.5, easeInOutQuad);
		yield* curArrow().opacity(1, 0.4);

		speed(Math.min(6, (i + 1) * 3));
	}
});
