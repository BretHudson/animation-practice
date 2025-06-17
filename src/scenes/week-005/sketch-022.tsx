import {
	Layout,
	makeScene2D,
	Node,
	PossibleCanvasStyle,
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
	waitFor,
} from '@motion-canvas/core';
import { useViewport } from '~/hooks/useViewport';
import { positionItemInRow } from '~/util';

import { TxtPlus, WordProps } from '~/components/TxtPlus';
import { useWeek5 } from '~/hooks/useWeek5';

function* scaleUp(text: TxtPlus) {
	const { words } = text;
	const wordInners = words.map((w) => w.childAs(0));
	wordInners.forEach((w) => {
		w.scale(0);
		w.opacity(0.3);
	});
	yield* sequence(
		0.3,
		...wordInners.map((w) => {
			return all(w.scale(1, 0.7), w.opacity(1, 0.35));
		}),
	);
}

function* fadeIn(text: TxtPlus) {
	const { words } = text;
	words.forEach((w) => {
		w.opacity(0);
	});
	yield* sequence(0.25, ...words.map((w) => w.opacity(1, 0.6)));
}

function* typewriter(text: TxtPlus) {
	const { words } = text;
	const progress = createSignal(-EPSILON);
	const wordInners = words.map((w) => w.childAs<Layout>(0));
	wordInners.forEach((word, i) => {
		word.opacity(createSignal(() => (progress() >= i ? 1 : 0)));
	});
	const dur = 0.3 * words.length;
	yield* chain(waitFor(0.2), progress(wordInners.length - 1, dur, linear));
}

function* slideDown(text: TxtPlus) {
	const { words } = text;
	const txts = words
		.flatMap((w) => w.childAs(0).children())
		.map((c) => c.childAs<Txt>(0));
	const h = Math.max(...txts.map((w) => w.height()));
	words.forEach((w) => w.y(-h * 1.2)); // NOTE(bret): descenders
	yield* sequence(0.2, ...words.map((w) => w.y(0, 0.5)));
}

function* slideUp(text: TxtPlus) {
	const { words } = text;
	const txts = words
		.flatMap((w) => w.childAs(0).children())
		.map((c) => c.childAs<Txt>(0));
	const h = Math.max(...txts.map((w) => w.height()));
	words.forEach((w) => w.y(h * 1.2));
	yield* sequence(0.2, ...words.map((w) => w.y(0, 0.5)));
}

function* rotateIn(text: TxtPlus) {
	const { words } = text;
	const wordInners = words.map((w) => w.childAs(0));
	wordInners.forEach((w) => {
		w.scale(0.3), w.rotation(0);
		w.opacity(0);
	});
	yield* sequence(
		0.2,
		...wordInners.map((w) => {
			return all(
				w.scale(1, 0.5),
				w.rotation(360, 0.5, easeOutQuad),
				w.opacity(1, 0.25),
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
	const { words } = text;
	const progress = createSignal(-EPSILON);
	const wordInners = words.map((w) => w.childAs<Layout>(0));
	wordInners.forEach((word, i) => {
		word.opacity(createSignal(() => (progress() >= i ? 1 : 0)));
		let spawned = false;
		createEffect(() => {
			if (spawned) return;
			const o = word.opacity();
			if (o === 1) {
				const t = word.childAs(0).childAs<Txt>(0);
				const _fill = t.fill();
				const _stroke = t.stroke();

				const fill = createSignal<PossibleCanvasStyle>(new Color('white'));
				const stroke = createSignal<PossibleCanvasStyle>(new Color('white'));
				const scale = createSignal<PossibleVector2>(1.2);

				const letters = word.children().flatMap((c) => c.childrenAs<Txt>());

				letters.forEach((l) => {
					l.fill(fill);
					l.stroke(stroke);
					l.scale(scale);
				});

				spawned = true;

				spawn(() => {
					return all(
						fill(_fill, 0.2, (t: number) => {
							const scale = 2;
							return Math.min(1, t * scale - (scale - 1) + 0.5);
						}),
						stroke(_stroke, 0.2, impactT),
						scale(1, 0.3, (t: number) => {
							const scale = 2;
							return Math.min(1, t * scale - (scale - 1));
						}),
					);
				});
			}
		});
	});
	const dur = 0.3 * words.length;
	yield* chain(waitFor(0.2), progress(wordInners.length - 1, dur, linear));
}

function* scaleOut(text: TxtPlus) {
	const { words } = text;
	const wordInners = words.map((w) => w.childAs(0));
	wordInners.forEach((w) => {
		w.scale(2);
		w.opacity(0);
	});
	yield* sequence(
		0.07,
		...wordInners.map(function* (w) {
			yield* all(w.scale(1, 0.5), w.opacity(1, 0.5));
		}),
	);
}

export default makeScene2D(function* (view) {
	const { byOrientation } = useViewport();

	const { shared } = useWeek5(
		0.6065,
		'Text Fade-In Animations',
		'Word-By-Word',
	);

	const effects: Array<{
		text: string;
		func: typeof scaleUp;
		mask?: Reference<Rect>;
		wordProps?: WordProps;
		initialProps?: TxtProps;
	}> = [
		{
			text: 'Scale Up & Up',
			func: scaleUp,
		},
		{
			text: 'Fade Each Word',
			func: fadeIn,
		},
		{
			text: 'Word Do Be Appear',
			func: typewriter,
		},
		{
			text: 'Slide Words Down',
			func: slideDown,
			mask: createRef<Rect>(),
		},
		//
		{
			text: 'Scale Out & Out',
			func: scaleOut,
		},
		{
			text: 'Rotate Each Word',
			func: rotateIn,
		},
		{
			text: '!!! Impact !!!',
			func: impact,
		},
		{
			text: 'Slide Words Up',
			func: slideUp,
			mask: createRef<Rect>(),
		},
	];

	const colW = 740;
	const colGap = byOrientation(100, -500);
	const rowH = 200;
	const rowGap = byOrientation(-20, 80);

	const txtParent = <Node />;
	view.add(txtParent);

	const texts: TxtPlus[] = [];
	txtParent.add(
		effects.map((e, i, arr) => {
			const maxPerRow = byOrientation(2, 2);
			const rows = Math.ceil(arr.length / maxPerRow);
			const lastRow = Math.floor(i / maxPerRow) === rows - 1;
			const n = lastRow ? arr.length % maxPerRow || maxPerRow : maxPerRow;
			const txtProps = { ...shared, ...e.initialProps };

			const offset = i % 2 ? 0.25 : -0.25;
			const x = positionItemInRow(i % maxPerRow, n, colW, colGap);
			const y = positionItemInRow(
				Math.floor(i / maxPerRow) + byOrientation(0.25, offset),
				rows,
				rowH,
				rowGap,
			);

			return (
				<Node cache={Boolean(e.mask)}>
					{e.mask ? <Rect ref={e.mask} fill="#ffffff" /> : null}
					<TxtPlus
						ref={makeRef(texts, i)}
						x={x}
						y={y}
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

	slideUp && position(slideUp);
	slideDown && position(slideDown);

	yield* loop(byOrientation(1, 2), function* () {
		texts.forEach((txt, i) => txt.opacity(effects[i].mask ? EPSILON : 0));

		const animations = effects.map(function* (effect, i) {
			const text = texts[i];
			text.opacity(1);
			yield* effect.func(text);
		});

		yield* chain(...animations);

		yield* waitFor(1);

		yield* sequence(
			0.1,
			...texts.map((txt, i) => txt.opacity(effects[i].mask ? EPSILON : 0, 0.7)),
		);
		yield* waitFor(0.5);
	});
});
