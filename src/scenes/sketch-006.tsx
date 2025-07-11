import {
	Code,
	Layout,
	makeScene2D,
	nodeName,
	Txt,
	signal,
	LayoutProps,
	initial,
} from '@motion-canvas/2d';
import {
	allMap,
	getSketchId,
	getViewportData,
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
	SimpleSignal,
	SignalValue,
} from '@motion-canvas/core';

import { addBgCredits } from '~/components/advent-of-code/AoCLayout';
import { Cell } from '~/components/advent-of-code/Cell';
import { AoCTheme } from '~/util/themes';

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

const valueToString = (value: number) => (value > -1 ? value.toString() : '-');

@nodeName('ValueDisplay')
export class ValueDisplay extends Layout {
	@signal()
	public declare readonly value: SimpleSignal<number, this>;

	@initial(1)
	@signal()
	public declare readonly speed: SimpleSignal<number, this>;

	private codeRef = createRef<Code>();
	private n = 0;

	public constructor(props: ValueDisplayProps) {
		super(props);

		this.gap(22);

		this.add(
			<>
				<Txt text={`${props.label}:`} fill={AoCTheme.gray} />
				<Code ref={this.codeRef} code={valueToString(this.value())} />
			</>,
		);
	}

	public *set(value: number) {
		this.value(value);

		yield* this.codeRef().code(
			'​'.repeat(++this.n) + valueToString(this.value()),
			0.5 / this.speed(),
		);
	}

	public *increment(inc: number) {
		yield* this.set(this.value() + inc);
	}
}

export default makeScene2D(function* (view) {
	const { landscape } = getViewportData(view);

	view.fontFamily(AoCTheme.fontFamily);

	addBgCredits(view, {
		sketchId: getSketchId(import.meta.url),
		year: 2017,
		day: 1,
		part: 1,
	});

	const yGap = 120;

	const curExample = createSignal(0);
	const y = createSignal(() => curExample() * -yGap);

	const examples = part1Examples.map((e) => {
		if (landscape) return e;
		const shortened = e
			.join('')
			.replace('91212129', '912129')
			.split('')
			.map(Number);
		return shortened;
	});

	const xPos = examples.map(() => createSignal(0));

	const cells = examples.map(() => [] as Cell[]);

	const speed = createSignal(1);

	function* waitFor(value: number) {
		yield* _waitFor(value / speed());
	}

	view.add(
		<Layout y={y}>
			{examples.map((input, index) => (
				<Layout
					x={xPos[index]}
					y={index * yGap}
					opacity={createSignal(() => 1 - Math.abs(index - curExample()))}
				>
					{input.map((digit, i) => (
						<Cell
							ref={makeRef(cells[index], i)}
							speed={speed}
							x={positionItemInRow(i, input.length, 100, 50)}
							value={digit.toString()}
							size={100}
						/>
					))}
				</Layout>
			))}
		</Layout>,
	);

	const sumDisplay = createRef<ValueDisplay>();
	const curDisplay = createRef<ValueDisplay>();
	const nextDisplay = createRef<ValueDisplay>();

	view.add(
		<Layout
			layout
			direction="column"
			alignContent={'center'}
			justifyContent={'center'}
			alignItems={'center'}
			y={7}
			gap={130}
		>
			<Layout layout gap={70}>
				<ValueDisplay ref={curDisplay} label="Cur" value={-1} speed={speed} />
				<ValueDisplay ref={nextDisplay} label="Next" value={-1} speed={speed} />
			</Layout>
			<ValueDisplay ref={sumDisplay} label="Sum" value={-1} speed={speed} />
		</Layout>,
	);

	function* addResult(valid: boolean, value: number) {
		if (!valid) return;

		yield* sumDisplay().increment(value);

		yield* waitFor(waitDur * 2);
	}

	const numExamples = examples.length;
	for (let i = 0; i < numExamples; ++i) {
		const e = curExample();

		yield* sumDisplay().set(0);

		const input = examples[e];
		const n = input.length;
		for (let i = 0; i < n; ++i) {
			const next = (i + 1) % n;
			const valid = input[i] === input[next];
			yield* allMap(cells[e], (cell, index) => {
				if (!(index === i || index === next))
					return chain(waitFor(0.3), cell.deselect());
				return chain(
					// blah
					all(
						//blah
						chain(
							waitFor(0.3),
							all(curDisplay().set(input[i]), nextDisplay().set(input[next])),
						),
						cell.select(),
					),
					waitFor(0.2),
					cell.validate(valid),
				);
			});
			if (valid) {
				yield* waitFor(waitDur);
				yield* addResult(valid, input[i]);
			} else {
				yield* waitFor(waitDur * 3 + 0.2);
			}
			yield* waitFor(waitDur);
		}

		yield* all(
			allMap(cells[e], (cell) => cell.deselect()),
			chain(waitFor(0.1), all(curDisplay().set(-1), nextDisplay().set(-1))),
		);
		yield* waitFor(waitDur * 3);

		yield* all(
			chain(waitFor(0.1), sumDisplay().set(-1)),
			curExample((i + 1) % numExamples, 0.5, easeInOutQuad),
		);
		yield* waitFor(waitDur);

		speed(3);
	}
});
