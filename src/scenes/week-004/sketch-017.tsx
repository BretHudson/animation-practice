import {
	Code,
	Layout,
	lines,
	makeScene2D,
	nodeName,
	Ray,
	Rect,
	RectProps,
	Txt,
} from '@motion-canvas/2d';
import {
	all,
	createRef,
	createSignal,
	DEFAULT,
	easeInQuad,
	makeRef,
	map,
	range,
	Reference,
	ReferenceReceiver,
	sequence,
	SimpleSignal,
	Vector2,
	waitFor,
} from '@motion-canvas/core';
import { SafeArea } from '~/components/SafeArea';
import { Week4Credits } from '~/components/week/week-004/Credits';
import { Week4Title } from '~/components/week/week-004/Title';
import { useViewport } from '~/hooks/useViewport';
import { allMap } from '~/util';

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
			<Code ref={code} fontSize={36} code=" " />
		</Rect>
	);
	return { rect, code };
};

interface ArraySlotProps extends RectProps {
	itemSize: number;
	startSmall?: boolean;
}

const emptyStr = '[empty]';
@nodeName('ArraySlot')
class ArraySlot extends Rect {
	txt: Reference<Txt>;

	constructor(props: ArraySlotProps) {
		super(props);

		const { itemSize } = props;

		if (!props.startSmall) this.size(itemSize);

		this.justifyContent('center');
		this.alignItems('center');

		const t = createSignal(() => this.height() / itemSize);

		const opacity = props.startSmall ? createSignal(() => map(0, 1, t())) : 1;
		this.opacity(opacity);

		const scale = props.startSmall
			? createSignal(() => map(0.25, 1, easeInQuad(t())))
			: 1;

		const txt = createRef<Txt>();
		const fontSize = createSignal(() => {
			return txt().text() === emptyStr ? 32 : 48;
		});
		this.add(
			<Txt
				ref={txt}
				fontFamily={'monospace'}
				textAlign={'center'}
				text={emptyStr}
				fill="lightgray"
				scale={scale}
				fontSize={fontSize}
				opacity={0.5}
			/>,
		);
		this.txt = txt;
	}

	_text(str: string) {
		if (Number.isNaN(parseInt(str)) && str !== emptyStr) {
			str = `'${str}'`.replaceAll("''", "'");
		}
		const targetOpacity = str !== emptyStr ? 1 : 0.5;
		return {
			str,
			targetOpacity,
		};
	}

	setText(str: string) {
		const { str: _str, targetOpacity } = this._text(str);
		this.txt().text(_str);
		this.txt().opacity(targetOpacity);
	}

	*updateText(str: string) {
		const { str: _str, targetOpacity } = this._text(str);
		yield* all(this.txt().opacity(0, 0.3), this.fill('#ffffff66', 0.4));
		this.txt().text(_str);
		yield* all(this.txt().opacity(targetOpacity, 0.3), this.fill(DEFAULT, 0.4));
	}
}

let arrLength = 3;
function push<T>(arr: T[], item: T) {
	arr[arrLength] = item;
	arrLength++;
}

function insert<T>(arr: T[], index: number, item: T) {
	for (let i = arrLength; i > index; i--) {
		arr[i] = arr[i - 1];
	}
	arr[index] = item;
	arrLength++;
}

export default makeScene2D(function* (view) {
	const { byOrientation } = useViewport();

	view.fontFamily('Outfit');

	view.add(<SafeArea />);

	view.add(
		<>
			<Week4Title
				y={-650 * 0.5 - 110}
				view={view}
				title="Arrays"
				subtitle="Inserting Elements"
			/>
			<Week4Credits view={view} />
		</>,
	);

	const itemSize = byOrientation(140, 140);
	const arrLen = 6;
	const { code, rect } = createCodeBlock(byOrientation(1200, itemSize * 7));

	const count = createSignal(arrLen);
	const container = createRef<Layout>();

	const slots: ArraySlot[] = [];
	view.add(
		<Layout
			layout
			direction="column"
			gap={32}
			justifyContent={'center'}
			alignItems={'center'}
			y={100}
		>
			<Layout
				minHeight={itemSize * 0.2}
				alignItems={'center'}
				ref={container}
				layout
			>
				{range(count()).map((index) => (
					<ArraySlot
						ref={makeRef(slots, index)}
						stroke={'white'}
						lineWidth={3}
						itemSize={itemSize}
					/>
				))}
			</Layout>
			{rect}
		</Layout>,
	);

	const vOffset = new Vector2(0, 50);
	const pointAt = createSignal(1);
	const getPosition = createSignal(() => {
		const xx = 0;
		const yy = container().top().y + itemSize * 0.5;
		return new Vector2(xx, yy);
	});

	function* insertSwap(show: boolean) {
		const opacity = show ? 1 : 0;
		yield* allMap(arrows, (a) => a.opacity(opacity, 0.3));
	}
	function* insertIndex(show: boolean) {
		const opacity = show ? 1 : 0;
		yield* allMap([indexArrow()], (a) => a.opacity(opacity, 0.3));
	}

	function createArrow(
		x: SimpleSignal<number>,
		text: string,
		ref: ReferenceReceiver<Layout>,
	) {
		return (
			<Layout
				ref={ref}
				opacity={0}
				x={x}
				y={createSignal(() => container().top().y + itemSize * 0.25)}
				layout
				direction={'column'}
				justifyContent={'center'}
				alignItems={'center'}
			>
				<Txt text={text} fill="white" fontFamily={'monospace'} />
				<Ray
					from={createSignal(() => getPosition().sub(vOffset))}
					to={getPosition}
					stroke={'white'}
					lineWidth={3}
					endArrow
					arrowSize={18}
				/>
			</Layout>
		);
	}

	const arrows: Layout[] = [];
	view.add(
		[0, -1].map((offset, index) => {
			const text = offset ? `i${offset < 0 ? offset : `+${offset}`}` : 'i';
			const x = createSignal(() => {
				const index = pointAt() + offset;
				const a = Math.floor(index);
				const b = Math.ceil(index);
				if (a === b) return slots[index].x();
				return map(slots[Math.max(0, a)].x(), slots[b].x(), index % 1);
			});
			return createArrow(x, text, makeRef(arrows, index));
		}),
	);

	const indexArrow = createRef<Layout>();
	const pointAtIndex = createSignal(1);
	view.add(
		createArrow(
			createSignal(() => slots[pointAtIndex()].x()),
			'index',
			indexArrow,
		),
	);

	// push example
	const createCode = (str: string) => str.replaceAll(/\t/g, ' '.repeat(4));

	const pushCode = createCode(`\
const arr = ['a', 'b', 'c', null, null, null];
let arrLength = 3;
${push.toString()}`);

	const insertCode = createCode(`\
${insert.toString()}`);

	code().code(pushCode);

	slots[0].setText('a');
	slots[1].setText('b');
	slots[2].setText('c');

	function* pushToArr(index: number, value: number | string) {
		const v = typeof value === 'string' ? `'${value}'` : value;
		yield* code().code.append(`\npush(${v});`, 0.3);
		yield* waitFor(0.3);
		yield* slots[index].updateText(value.toString());
		yield* waitFor(1);
	}

	yield* waitFor(1);

	yield* pushToArr(3, 'x');
	yield* pushToArr(4, 'y');

	yield* waitFor(1);

	yield* all(
		code().code(insertCode, 0.5),
		slots[3].updateText(emptyStr),
		slots[4].updateText(emptyStr),
	);

	// insert example
	yield* waitFor(1);

	const _arrLength = createSignal(
		() => slots.filter((s) => s.txt().text() !== emptyStr).length,
	);

	let lineCount = 6;
	function* insertToArr(index: number, value: number | string) {
		const v = typeof value === 'string' ? `'${value}'` : value;
		const newStr = `insert(${index}, ${v});`;
		yield* code().code.append(`\n${newStr}`, 0.3);
		yield* code().selection(lines(++lineCount), 0.3);

		const arrLength = _arrLength();
		yield* waitFor(0.5);
		pointAt(arrLength);
		yield* all(insertSwap(true), code().selection(lines(1, 3), 0.3));
		yield* waitFor(0.5);
		for (let i = arrLength; i > index; --i) {
			const temp = slots[i - 1].txt().text();
			if (pointAt() !== i) yield* pointAt(i, 0.3);
			yield* sequence(
				0.2,
				slots[i - 1].updateText(emptyStr),
				slots[i].updateText(temp),
			);
		}
		yield* insertSwap(false);

		yield* code().selection(lines(4), 0.3);
		pointAtIndex(index);
		yield* insertIndex(true);
		yield* slots[index].updateText(value.toString());
		yield* insertIndex(false);
		yield* waitFor(1);

		yield* code().selection(DEFAULT, 0.3);
	}

	yield* insertToArr(0, 'x');
	yield* insertToArr(3, 'y');

	yield* waitFor(1);

	yield* all(
		code().code(pushCode, 0.5),
		slots[0].updateText('a'),
		slots[1].updateText('b'),
		slots[2].updateText('c'),
		slots[3].updateText(emptyStr),
		slots[4].updateText(emptyStr),
	);

	yield* waitFor(1);
});
