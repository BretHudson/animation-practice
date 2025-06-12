import { Layout, lines, makeScene2D, Ray, Rect, Txt } from '@motion-canvas/2d';
import {
	all,
	chain,
	createEffect,
	createRef,
	createSignal,
	DEFAULT,
	easeInCubic,
	makeRef,
	map,
	range,
	Reference,
	ReferenceReceiver,
	sequence,
	SimpleSignal,
	spawn,
	Vector2,
	waitFor,
} from '@motion-canvas/core';
import { createCodeBlock } from '~/components/CodeBlock';
import { SafeArea } from '~/components/SafeArea';
import { ArraySlot, emptyStr } from '~/components/week/week-004/ArraySlot';
import { Week4Credits } from '~/components/week/week-004/Credits';
import { TableRow } from '~/components/week/week-004/TableRow';
import { Week4Title } from '~/components/week/week-004/Title';
import { useViewport } from '~/hooks/useViewport';
import { allMap } from '~/util';
import { WGTheme } from '~/util/themes';

const codeFontSize = 36;

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

function remove<T>(arr: T[], index: number) {
	for (let i = index; i < arrLength; i++) {
		arr[i] = arr[i + 1];
	}
	arrLength--;
}

export default makeScene2D(function* (view) {
	const { landscape, byOrientation } = useViewport();

	view.fontFamily('Outfit');

	view.add(<SafeArea />);

	view.add(
		<>
			<Week4Title
				y={-650 * 0.5 - 110}
				view={view}
				title="Arrays"
				subtitle="Removing Elements"
			/>
			<Week4Credits view={view} />
		</>,
	);

	const itemSize = byOrientation(140, 140);
	const arrLen = 6;
	const { codeBlock, code } = createCodeBlock(
		byOrientation(itemSize * 7, itemSize * 7),
		codeFontSize,
	);

	const count = createSignal(arrLen);
	const container = createRef<Layout>();

	const outer = createRef<Layout>();

	const slots: ArraySlot[] = [];
	const _arrLength = createSignal(
		() => slots.filter((s) => s.txt().text() !== emptyStr).length,
	);
	view.add(
		<Layout ref={outer} zIndex={1}>
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
					gap={4}
				>
					{range(count()).map((index) => (
						<ArraySlot
							ref={makeRef(slots, index)}
							stroke={'#888888'}
							lineWidth={3}
							itemSize={itemSize}
						/>
					))}
				</Layout>
				{codeBlock}
			</Layout>
		</Layout>,
	);

	const vOffset = new Vector2(0, 50);
	const pointAt = createSignal(1);
	const getPosition = createSignal(() => {
		const xx = 0;
		const yy = container().top().y + itemSize * 0.5;
		return new Vector2(xx, yy);
	});

	function* removeSwap(show: boolean) {
		const opacity = show ? 1 : 0;
		yield* allMap(arrows, (a) => a.opacity(opacity, 0.3));
	}
	function* removeIndex(show: boolean) {
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
				<Txt text={text} fill={WGTheme.bubbleBg} fontFamily={'monospace'} />
				<Ray
					from={createSignal(() => getPosition().sub(vOffset))}
					to={getPosition}
					stroke={WGTheme.bubbleBg}
					lineWidth={3}
					endArrow
					arrowSize={18}
				/>
			</Layout>
		);
	}

	const arrows: Layout[] = [];
	outer().add(
		[0, 1].map((offset, index) => {
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
	outer().add(
		createArrow(
			createSignal(() => slots[pointAtIndex()].x()),
			'index',
			indexArrow,
		),
	);

	const table = createRef<Rect>();
	const tableStroke = '#888';
	const tableLineWidth = 3;
	const xOffset = 200;
	const yOffset = 180;
	const tableOpacity = createSignal(() => {
		return easeInCubic(
			landscape ? outer().x() / xOffset : outer().y() / yOffset,
		);
	});

	const ref = undefined as Reference<TableRow> | undefined;
	const watchArrLen = {
		ref,
		visible: true,
		label: 'arrLength',
		value: _arrLength,
	};
	const watchIndex = {
		ref,
		visible: false,
		label: 'index',
		value: pointAtIndex,
	};
	const watchI = { ref, visible: false, label: 'i', value: pointAt };
	const watchIPlus1 = {
		ref,
		visible: false,
		label: 'i+1',
		value: createSignal(() => pointAt() + 1),
		letterSpacing: 16,
	};

	const watch = createSignal([watchArrLen, watchIndex, watchI, watchIPlus1]);

	// const watchPanelPos = { x: -530, y: -150 };
	const watchPanelPos = byOrientation({ x: -530, y: -150 }, { x: 0, y: -500 });

	view.add(
		<Layout
			{...watchPanelPos}
			layout
			direction={'column'}
			gap={16}
			opacity={tableOpacity}
			alignItems={'center'}
			offset={[0, -1]}
			zIndex={100}
		>
			<Txt text="Current Values" fontSize={42} fontWeight={250} fill={'#ccc'} />
			<Rect
				ref={table}
				// radius={16}
				stroke={tableStroke}
				lineWidth={tableLineWidth}
				direction={'column'}
			/>
		</Layout>,
	);

	table().fontFamily('monospace');
	const fullWidth = (index: number) => {
		const rows = table().childrenAs<Layout>();
		const maxWidth = rows.reduce(
			(acc, row) => Math.max(acc, row.childAs<Txt>(index).width()),
			0,
		);
		rows.forEach((row) => row.childAs<Txt>(index).width(maxWidth));
	};
	fullWidth(0);
	fullWidth(1);

	const rows: TableRow[] = [];
	// NOTE(bret): this feels so hacky, gonna need a better way to handle this in the future
	createEffect(() => {
		const _watch = watch();
		const children = table().childrenAs<TableRow>();

		const show = _watch.filter(
			({ visible, ref }) => visible && ref === undefined,
		);
		const hide = _watch.filter(
			({ visible, ref }) => !visible && ref !== undefined,
		);
		show.forEach((rowData, i) => {
			rowData.ref = createRef<TableRow>();
			const row = (<TableRow ref={rowData.ref} {...rowData} />) as TableRow;
			rows.push(row);
			table().add(row);
			const h = row.height();
			spawn(
				chain(
					waitFor(i * 0.1),
					all(row.height(0).height(h, 0.5), row.opacity(0).opacity(1, 0.5)),
				),
			);
		});
		hide.forEach((rowData, i) => {
			const row = rowData.ref();
			spawn(
				chain(
					waitFor((hide.length - i - 1) * 0.1),
					all(
						row.opacity(0, 0.5),
						row.height(0, 0.5).do(() => row.remove()),
					),
				),
			);
			rowData.ref = undefined;
		});

		fullWidth(0);
		fullWidth(1);
	});

	// push example
	const createCode = (str: string) => str.replaceAll(/\t/g, ' '.repeat(4));

	const removeCode = createCode(`\
${remove.toString()}`);

	code().code(removeCode);

	const initialArr = ['a', 'b', 'c', 'd', 'e', emptyStr];
	initialArr.map((v, i) => slots[i].setText(v));

	yield* waitFor(1);

	if (landscape) {
		yield* outer().x(xOffset, 0.5);
	} else {
		yield* outer().y(yOffset, 0.5);
	}
	yield* waitFor(0.5);

	const codeFadeDur = 0.5;

	let lineCount = 5;
	function* removeFromArr(index: number) {
		const newStr = `remove(arr, ${index});`;

		yield* all(
			code().code.append(`\n${newStr}`, codeFadeDur),
			pointAtIndex(index, 0.3),
		);
		yield* waitFor(0.5);
		watchIndex.visible = true;
		watch([...watch()]);
		yield* code().selection(lines(++lineCount), codeFadeDur);

		const arrLength = _arrLength();
		yield* waitFor(0.5);
		pointAt(index);

		watchI.visible = true;
		watchIPlus1.visible = true;
		watch([...watch()]);

		yield* all(removeSwap(true), code().selection(lines(1, 3), codeFadeDur));

		yield* waitFor(0.5);
		for (let i = index; i < arrLength; ++i) {
			const temp = slots[i + 1].txt().text();
			if (pointAt() !== i) yield* pointAt(i, 0.3);
			yield* sequence(
				0.2,
				// slots[i + 1].updateText(emptyStr),
				slots[i].updateText(temp),
			);
		}
		yield* removeSwap(false);

		watchIndex.visible = false;
		watchI.visible = false;
		watchIPlus1.visible = false;
		yield* code().selection(DEFAULT, codeFadeDur);
		yield* waitFor(1);
		watch([...watch()]);
		yield* allMap(slots, (slot) => {
			return all(
				slot.txt().fill('lightgray', 0.3),
				slot.txt().opacity(slot._text().targetOpacity, 0.3),
			);
		});
	}

	yield* removeFromArr(2);
	yield* removeFromArr(0);

	yield* waitFor(1);

	yield* sequence(
		0.3,
		all(
			code().code(removeCode, codeFadeDur),
			...initialArr.map((v, i) => slots[i].updateText(v, 'lightgray')),
		),
		landscape ? outer().x(0, 0.5) : outer().y(0, 0.5),
	);

	yield* waitFor(0.5);

	yield* waitFor(1);
});
