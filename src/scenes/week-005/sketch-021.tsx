import {
	Layout,
	makeScene2D,
	Node,
	Rect,
	Txt,
	TxtProps,
} from '@motion-canvas/2d';
import {
	all,
	chain,
	Color,
	createEffect,
	createRef,
	createSignal,
	easeInOutQuad,
	easeInQuad,
	easeOutCirc,
	easeOutQuad,
	EPSILON,
	linear,
	loop,
	makeRef,
	PossibleVector2,
	Reference,
	sequence,
	spawn,
	Vector2,
	waitFor,
	waitUntil,
} from '@motion-canvas/core';
import { SafeArea } from '~/components/SafeArea';
import { Week5Credits } from '~/components/week/week-005/Credits';
import { Week5Title } from '~/components/week/week-005/Title';
import { useViewport } from '~/hooks/useViewport';
import { allMap, positionItemInRow } from '~/util';

import scriptRaw from '~/assets/audio/script-020.txt';
const script = await fetch(scriptRaw).then((res) => res.text());

import labelsRaw from '~/assets/audio/script-020-timestamps.txt';
import { TxtPlus, WordProps } from '~/components/TxtPlus';
import { WGTheme } from '~/util/themes';
const timestamps = (await fetch(labelsRaw).then((res) => res.text()))
	.split('\n')
	.map((line) => +line.split('\t')[0]);

const subtitles = script
	.split('\n')
	.map((s) => s.trim())
	.map((s) => (s.endsWith('.') ? s.substring(0, s.length - 1) : s))
	.filter((s) => Boolean(s) && !s.startsWith('##'));

export default makeScene2D(function* (view) {
	const { landscape, byOrientation, viewW, viewH } = useViewport();

	view.fontFamily('Outfit');

	const getOffset = (cellSize: number, fillSize: number) => {
		const total = Math.ceil(fillSize / cellSize) * cellSize;
		return (total - fillSize) / 2;
	};

	{
		const cellSize = 240;
		const xOffset = -viewW / 2 - getOffset(cellSize, viewW);
		const yOffset = -viewH / 2 - getOffset(cellSize, viewH);
		for (let y = 0; y <= viewH; y += cellSize) {
			for (let x = 0; x <= viewW; x += cellSize) {
				const xx = x / cellSize;
				const yy = y / cellSize;
				if ((xx + yy) % 2) continue;
				view.add(
					<Rect
						x={x + xOffset}
						y={y + yOffset}
						offset={[-1, -1]}
						width={cellSize}
						height={cellSize}
						fill="rgb(229,164,247)"
					/>,
				);
			}
		}
	}

	view.add(<SafeArea />);

	view.add(
		<>
			<Week5Title
				y={-650 * 0.5 - 110}
				title="Text Fade-In Animations"
				subtitle="Letter-By-Letter"
			/>
			<Week5Credits />
		</>,
	);

	function* scaleUp(text: TxtPlus) {
		const { letters } = text;
		const txts = letters.map((l) => l.childAs<Txt>(0));
		txts.forEach((l) => {
			l.scale(0);
			l.opacity(0.3);
		});
		yield* sequence(
			0.05,
			...txts.map((l) => {
				return all(l.scale(1, 0.7), l.opacity(1, 0.35));
			}),
		);
	}

	function* fadeIn(text: TxtPlus) {
		const { letters } = text;
		letters.forEach((l) => {
			l.opacity(0);
		});
		yield* sequence(0.1, ...letters.map((l) => l.opacity(1, 0.5)));
	}

	function* typewriter(text: TxtPlus) {
		const { letters } = text;
		const progress = createSignal(0);
		const txts = letters.map((l) => l.childAs<Txt>(0));
		let w = 0;
		txts.forEach((txt) => {
			w += txt.width();
			const x = w;
			txt.opacity(createSignal(() => (progress() >= x ? 1 : 0)));
		});
		yield* progress(w, 1.2, linear);
	}

	function* slideDown(text: TxtPlus) {
		const { letters } = text;
		const txts = letters.map((l) => l.childAs<Txt>(0));
		const h = Math.max(...txts.map((l) => l.height()));
		letters.forEach((l) => l.y(-h));
		yield* sequence(0.1, ...letters.map((l) => l.y(0, 0.5)));
	}

	function* slideUp(text: TxtPlus) {
		const { letters } = text;
		const txts = letters.map((l) => l.childAs<Txt>(0));
		const h = Math.max(...txts.map((l) => l.height()));
		letters.forEach((l) => l.y(h));
		yield* sequence(0.1, ...letters.map((l) => l.y(0, 0.5)));
	}

	function* rotateIn(text: TxtPlus) {
		const { letters } = text;
		const txts = letters.map((l) => l.childAs<Txt>(0));
		txts.forEach((l) => {
			l.scale(0.3), l.rotation(0);
			l.opacity(0);
		});
		yield* sequence(
			0.05,
			...txts.map((l) => {
				return all(
					l.scale(1, 0.5),
					l.rotation(360, 0.5, easeOutQuad),
					l.opacity(1, 0.25),
				);
			}),
		);
	}

	const impactTStep = (t: number) => Math.round(easeOutCirc(t));
	const impactT = (t: number) => {
		const scale = 2;
		return Math.min(1, t * scale - (scale - 1) + 0.5);
	};

	function* impact(text: TxtPlus) {
		const { letters } = text;
		const progress = createSignal(-EPSILON);
		const txts = letters.map((l) => l.childAs<Txt>(0));
		txts.forEach((txt, i) => {
			txt.opacity(createSignal(() => (progress() >= i ? 1 : 0)));
			let spawned = false;
			createEffect(() => {
				if (spawned) return;
				const o = txt.opacity();
				if (o === 1) {
					spawned = true;
					const start = txt.fill();
					const stroke = txt.stroke();
					spawn(() => {
						return all(
							txt.fill('white').fill(start, 0.2, (t: number) => {
								const scale = 2;
								return Math.min(1, t * scale - (scale - 1) + 0.5);
							}),
							txt.stroke('white').stroke(stroke, 0.2, impactT),
							txt.scale(1.2).scale(1, 0.3, (t: number) => {
								const scale = 2;
								return Math.min(1, t * scale - (scale - 1));
							}),
						);
					});
				}
			});
		});
		const dur = 0.15 * letters.length;
		yield* chain(waitFor(0.2), progress(txts.length - 1, dur, linear));
	}

	function* scaleOut(text: TxtPlus) {
		const { letters } = text;
		const txts = letters.map((l) => l.childAs<Txt>(0));
		txts.forEach((l) => {
			l.scale(2);
			l.opacity(0);
		});
		yield* sequence(
			0.07,
			...txts.map(function* (l) {
				yield* all(l.scale(1, 0.5), l.opacity(1, 0.5));
			}),
		);
	}

	const shared: TxtProps = {
		fill: WGTheme.darkBlue,
		stroke: WGTheme.bubbleBg,
		fontSize: 96,
		lineWidth: 10,
		letterSpacing: 4,
		fontFamily: 'Chewy',
		strokeFirst: true,
	};

	const effects: Array<{
		text: string;
		func: typeof scaleUp;
		mask?: Reference<Rect>;
		wordProps?: WordProps;
		initialProps?: TxtProps;
	}> = [
		{
			text: 'Scale Up',
			func: scaleUp,
		},
		{
			text: 'Fade In',
			func: fadeIn,
		},
		{
			text: 'Typist',
			func: typewriter,
		},
		{
			text: 'Slide Down',
			func: slideDown,
			mask: createRef<Rect>(),
		},
		//
		{
			text: 'Scale Out',
			func: scaleOut,
		},
		{
			text: 'Rotate In',
			func: rotateIn,
		},
		{
			text: 'Impact',
			func: impact,
		},
		{
			text: 'Slide Up',
			func: slideUp,
			mask: createRef<Rect>(),
		},
	];

	const colW = 400;
	const colGap = 50;
	const rowH = 200;
	const rowGap = 60;

	const txtParent = <Node />;
	view.add(txtParent);

	const texts: TxtPlus[] = [];
	txtParent.add(
		effects.map((e, i, arr) => {
			const maxPerRow = byOrientation(4, 2);
			const rows = Math.ceil(arr.length / maxPerRow);
			const lastRow = Math.floor(i / maxPerRow) === rows - 1;
			const n = lastRow ? arr.length % maxPerRow || maxPerRow : maxPerRow;
			const txtProps = { ...shared, ...e.initialProps };
			return (
				<Node cache={Boolean(e.mask)}>
					{e.mask ? <Rect ref={e.mask} fill="#ffffff" /> : null}
					<TxtPlus
						ref={makeRef(texts, i)}
						x={positionItemInRow(i % maxPerRow, n, colW, colGap)}
						y={positionItemInRow(Math.floor(i / maxPerRow), rows, rowH, rowGap)}
						text={e.text}
						wordProps={e.wordProps}
						txtProps={txtProps}
						compositeOperation={e.mask ? 'source-in' : 'source-over'}
					/>
				</Node>
			);
		}),
	);

	const position = (targetFunc: typeof slideUp) => {
		const slideUpIndex = effects.findIndex(({ func }) => func === targetFunc);
		const slideUpLayout = texts[slideUpIndex];
		const { mask } = effects[slideUpIndex];
		if (mask) {
			mask().x(slideUpLayout.x());
			mask().y(slideUpLayout.y());
			mask().width(slideUpLayout.width() * 1.1);
			mask().height(slideUpLayout.height() * 1.1);
			mask().offset(slideUpLayout.offset());
		}
	};

	position(slideUp);
	position(slideDown);

	yield* loop(2, function* () {
		txtParent.opacity(1);

		texts.forEach((txt, i) => {
			txt.opacity(effects[i].mask ? EPSILON : 0);
		});

		const animations = effects.map(function* (effect, i) {
			const text = texts[i];
			text.opacity(1);
			yield* effect.func(text);
		});

		if (landscape) yield* sequence(0.3, ...animations);
		else yield* chain(...animations);

		yield* waitFor(1);

		yield* sequence(
			byOrientation(0.07, 0.1),
			...texts.map((txt, i) =>
				txt.opacity(effects[i].mask ? EPSILON : 0, byOrientation(0.5, 0.7)),
			),
		);
		yield* waitFor(0.5);
	});
});
