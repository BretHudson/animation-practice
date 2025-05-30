import {
	Layout,
	makeScene2D,
	Txt,
	LayoutProps,
	Ray,
	Rect,
} from '@motion-canvas/2d';
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
	easeInOutCubic,
	easeInOutQuint,
	Reference,
	easeInOutQuart,
} from '@motion-canvas/core';

import { addBgCredits } from '~/components/advent-of-code/AoCLayout';
import { Cell } from '~/components/advent-of-code/Cell';
import { AoCTheme } from '~/util/themes';

const waitDur = 0.3;

const parseDay2Examples = (...examples: string[]) => {
	return examples.map((v) => v.split(' ').map(Number));
};

const part1Examples = parseDay2Examples('5 1 9 5', '7 5 3', '2 4 6 8').slice(
	0,
	1,
);

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
	});

	// TODO(bret): useSpeed() hook
	const {
		speed,
		adjust,
		waitFor,
		ref: speedRef,
	} = initSpeed(view, bg(), byOrientation(1, 2));
	speedRef().opacity(0);

	const yGap = 120;

	const examples = part1Examples;

	const cells = examples.map(() => [] as Cell[]);

	const curExample = createSignal(0);
	const curExampleInt = createSignal(() => Math.round(curExample()));
	const y = createSignal(() => curExample() * -yGap);

	const mainLayout = createRef<Layout>();
	const sequenceLayout = createRef<Layout>();
	const inputsLayout = createRef<Layout>();

	const cellSize = 100;
	const cellPad = 50;

	const layoutYOffset = byOrientation(0, 20);
	view.add(<Layout ref={mainLayout} y={layoutYOffset} />);
	mainLayout().add(<Layout y={100} ref={sequenceLayout} />);

	const checksumLayout = createRef<Layout>();
	const checksumMaxRef = createRef<Txt>();
	const checksumMinRef = createRef<Txt>();
	const checksumRef = createRef<Txt>();

	mainLayout().add(
		<Layout ref={checksumLayout} y={170} layout gap={20} opacity={0}>
			<Txt text="Checksum: " fill={AoCTheme.gray} fontSize={40} />
			<Txt ref={checksumMaxRef} text="" fill={AoCTheme.blue} fontSize={40} />
			<Txt text="-" fill={AoCTheme.gray} fontSize={40} />
			<Txt ref={checksumMinRef} text="" fill={AoCTheme.orange} fontSize={40} />
			<Txt text="=" fill={AoCTheme.gray} fontSize={40} />
			<Txt ref={checksumRef} text="" fill={AoCTheme.yellow} fontSize={40} />
		</Layout>,
	);

	sequenceLayout().add(
		<Layout y={y}>
			{examples.map((input, index) => (
				<Layout
					ref={inputsLayout}
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

	const maxLayout = createRef<Layout>();
	const minLayout = createRef<Layout>();

	const maxBorder = createRef<Rect>();
	const minBorder = createRef<Rect>();

	const maxCell = createRef<Cell>();
	const minCell = createRef<Cell>();

	const maxText = createRef<Layout>();
	const minText = createRef<Layout>();

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
			text: 'Max',
			layoutRef: maxLayout,
			borderRef: maxBorder,
			cellRef: maxCell,
			textRef: maxText,
			color: AoCTheme.blue,
			dir: -1,
		},
		{
			text: 'Min',
			layoutRef: minLayout,
			borderRef: minBorder,
			cellRef: minCell,
			textRef: minText,
			color: AoCTheme.orange,
			dir: 1,
		},
	] as const;

	const borderSizeNormal = cellSize + 32;
	const borderSizeWide = cellSize * 2 + 32 + cellPad - 20;

	const arrowsLayoutRef = createRef<Layout>();
	const arrowLength = 50;
	sequenceLayout().add(
		<Layout ref={arrowsLayoutRef} x={pointAtX}>
			{rays.map(
				({ textRef, text, layoutRef, borderRef, cellRef, color, dir }) => (
					<Layout ref={layoutRef} y={dir * (arrowLength + cellSize)}>
						<Rect
							ref={borderRef}
							width={borderSizeNormal}
							height={borderSizeNormal}
							stroke={color}
							opacity={0.7}
							lineWidth={5}
							radius={12}
						/>
						<Cell
							ref={cellRef}
							size={cellSize}
							value={dir > 0 ? '∞' : '-∞'}
							initialValue={dir * Infinity}
						/>
						<Txt
							ref={textRef}
							text={text}
							fill={AoCTheme.gray}
							y={dir * (cellSize + 16)}
							fontSize={42}
						/>
					</Layout>
				),
			)}
		</Layout>,
	);

	yield* waitFor(waitDur);

	function* duplicate(destCell: Cell, border: Rect) {
		const dup = curCell().clone();
		yield* curCell().reset(0.01);
		curCell().opacity(0);
		arrowsLayoutRef().add(dup);
		dup.reparent(destCell.parent());
		dup.position.x(0);
		const xOffset = 65;

		const ease = easeInOutCubic;

		yield* sequence(
			0.11,
			all(
				border.width(borderSizeWide, adjust(0.7), ease),
				destCell.x(-xOffset, adjust(0.7), ease),
				dup.reset(),
				dup.x(xOffset, adjust(0.7), ease),
				dup.y(destCell.y(), adjust(0.7), ease),
			),
			curCell().opacity(1, adjust(0.5)),
		);
		return dup;
	}

	function* merge(
		formerRef: Reference<Cell>,
		candidate: Cell,
		border: Rect,
		func: 'min' | 'max',
	) {
		const former = formerRef();
		const v1 = former.value();
		const v2 = candidate.value();
		const winningV = Math[func](v1, v2);

		const toYield = [];

		let loser: Cell = candidate;
		if (winningV === v1) toYield.push(former.selectText());
		else {
			// NOTE(bret): we do it this way since they can tie
			loser = former;
			formerRef(candidate);
		}

		if (winningV === v2) toYield.push(candidate.selectText());

		yield* all(...toYield);
		yield* waitFor(waitDur);

		// ensure the border renders above the cell leaving
		border.zIndex(100);

		const ease = easeInOutCubic;

		yield* all(
			loser.opacity(0, adjust(0.3)),
			loser.scale(0.6, adjust(0.4), ease),
			border.width(borderSizeNormal, adjust(0.4), ease),
			formerRef().x(0, adjust(0.4), ease),
			formerRef().reset(),
		);

		border.zIndex(0);

		// yield* maxCell().updateValueWithTransition(value);
	}

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
				pointAtIndex(i, adjust(0.7), easeInOutQuart),
				curCell().select(adjust(0.7)),
			);

			yield* waitFor(waitDur);

			const maxDup = yield* duplicate(maxCell(), maxBorder());
			yield* waitFor(waitDur);
			yield* merge(maxCell, maxDup, maxBorder(), 'max');

			const minDup = yield* duplicate(minCell(), minBorder());
			yield* waitFor(waitDur);
			yield* merge(minCell, minDup, minBorder(), 'min');

			yield* waitFor(waitDur);
		}

		yield* waitFor(waitDur);

		// move to end
		yield* all(
			curCell().reset(adjust(0.7)),
			pointAtIndex(curCells().length, adjust(0.7), easeInOutQuart),
		);

		yield* waitFor(waitDur * 2);

		// move to top
		{
			const maxY = maxLayout().y();
			const minY = minLayout().y();

			const maxTextY = maxText().y();
			const minTextY = minText().y();

			const targetY = -70;
			const x1 = positionItemInRow(0, 2, cellSize, cellPad * 2);
			const x2 = positionItemInRow(1, 2, cellSize, cellPad * 2);

			const xOffsetDur = adjust(0.6);
			const yDur = adjust(0.7);
			const pointAtDur = adjust(0.75);

			yield* all(
				maxLayout().x(x1, xOffsetDur, easeInOutCubic),
				minLayout().x(x2, xOffsetDur, easeInOutCubic),
				maxLayout().y(targetY, yDur, easeInOutCubic),
				minLayout().y(targetY, yDur, easeInOutCubic),
				pointAtIndex(1.5, pointAtDur, easeInOutQuad),
				minText().y(maxTextY, yDur),
				inputsLayout().opacity(0, xOffsetDur, easeInOutQuad),
			);

			yield* waitFor(waitDur);

			// do checksum
			checksumMaxRef().text(maxCell().text());
			checksumMinRef().text(minCell().text());
			checksumRef().text((maxCell().value() - minCell().value()).toString());
			yield* checksumLayout().opacity(1, adjust(0.3));

			yield* waitFor(waitDur * 4);

			// cleanup
			yield* sequence(
				adjust(0.1),
				checksumLayout().opacity(0, adjust(0.3)),
				all(
					maxLayout().x(0, xOffsetDur),
					minLayout().x(0, xOffsetDur),
					maxLayout().y(maxY, yDur, easeInOutQuad),
					minLayout().y(minY, yDur, easeInOutQuad),
					pointAtIndex(-1, pointAtDur, easeInOutQuad),
					minText().y(minTextY, yDur),
					inputsLayout().opacity(1, xOffsetDur, easeInOutQuad),
				),
			);
		}

		_curIndex(0);

		yield* waitFor(0.3);
		yield* sequence(
			adjust(0.1),
			all(
				maxCell().txt().opacity(0, adjust(0.3)),
				minCell().txt().opacity(0, adjust(0.3)),
				pointAtIndex(-1, adjust(0.7), easeInOutQuint),
			),
			all(curExample((i + 1) % numExamples, adjust(0.5), easeInOutQuad)),
			chain(
				waitFor(0.2),
				all(
					maxCell().updateValueYield(-Infinity),
					minCell().updateValueYield(Infinity),
					maxCell().txt().opacity(1, adjust(0.3)),
					minCell().txt().opacity(1, adjust(0.3)),
				),
			),
		);
		yield* waitFor(0.3);
		speed(Math.min(2, (i + 1) * 2));
	}
});
