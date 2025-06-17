import { makeScene2D, Node, Rect, Txt, TxtProps } from '@motion-canvas/2d';
import {
	all,
	chain,
	createEffect,
	createRef,
	createSignal,
	easeOutCirc,
	easeOutQuad,
	EPSILON,
	linear,
	loop,
	makeRef,
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

export default makeScene2D(function* (view) {
	const { landscape, byOrientation } = useViewport();

	const { shared } = useWeek5(
		0.7973,
		'Text Fade-In Animations',
		'Letter-By-Letter',
	);

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
