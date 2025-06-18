import { makeScene2D, Node, Rect, Txt, TxtProps } from '@motion-canvas/2d';
import {
	all,
	chain,
	easeInCubic,
	easeInOutCubic,
	easeOutCubic,
	easeOutQuad,
	loop,
	makeRef,
	Reference,
	sequence,
	waitFor,
} from '@motion-canvas/core';
import { useViewport } from '~/hooks/useViewport';
import { allMap } from '~/util';

import { TxtPlus, Word, WordProps } from '~/components/TxtPlus';
import { useWeek5 } from '~/hooks/useWeek5';

// easing functions
const f = (t: number, x1 = 0, x2 = 1) => {
	const cos = Math.cos(((t - x1) / (x2 - x1)) * Math.PI);
	return (cos - 1) * 0.5 * (x1 - x2) + x1;
};

const halfHalf = (t: number) => {
	const tt = t < 0.5 ? f(t, 0, 0.5) : f(t, 0.5, 1);
	return tt;
};

// animations
function* slideInLine(
	text: TxtPlus,
	time: number,
	timingFunction = easeOutQuad,
) {
	yield* text.offset([-1, 0]).offset([0, 0], time, timingFunction);
}

function* slideOutLine(
	text: TxtPlus,
	time: number,
	timingFunction = easeInCubic,
) {
	yield* text.offset([0, 0]).offset([1, 0], time, timingFunction);
}

function* fadeInWord(
	word: Word,
	time: number,
	timingFunction = easeInOutCubic,
) {
	yield* word.opacity(0).opacity(1, time, timingFunction);
}

function* fadeOutWord(
	word: Word,
	time: number,
	timingFunction = easeInOutCubic,
) {
	yield* word.opacity(0, time, timingFunction);
}

function* italicizeWord(
	word: Word,
	time: number,
	timingFunction = easeOutCubic,
) {
	const letters = word.letters.map((l) => l.childAs<Txt>(0));
	yield* allMap(letters, (l) => {
		const scale = l.fontSize() / 96;
		return all(
			l.skew([-20, 0], time, timingFunction),
			l.parent().position([13 * scale, 0], time, timingFunction),
		);
	});
}

function* lineSlideIn(text: TxtPlus, time: number) {
	const { words } = text;

	const moveLineIn = slideInLine(text, time * 1.4);

	const anims = words.map((w) => {
		return all(w.x(0, 0.2, easeInOutCubic), fadeInWord(w, 0.3));
	});

	const animSequences = sequence((time * 0.5) / (words.length - 1), ...anims);

	yield* all(moveLineIn, animSequences);
}

function* lineSlideIn2(text: TxtPlus, time: number) {
	const { words } = text;

	const moveLineIn = slideInLine(text, time * 1.4);

	const animSequences = [0, 1].map((_, i) => {
		const ii = i * 3;
		const subWords = words.slice(ii, ii + 3);

		const anims = subWords.map((w) => {
			return all(w.x(0, 0.2, easeInOutCubic), fadeInWord(w, 0.3));
		});

		return sequence((time * 0.5) / (subWords.length - 1), ...anims);
	});

	const moveLineIn1 = text
		.offset([-1, 0])
		.offset([-0.2, 0], time, easeOutCubic);
	const moveLineIn2 = text.offset([0, 0], time, easeOutCubic);

	yield* all(moveLineIn1, animSequences[0]);
	yield* waitFor(0.2);
	yield* all(moveLineIn2, animSequences[1]);
}

function* lineSlideOut(text: TxtPlus, time: number) {
	const { words } = text;

	const moveLineOut = slideOutLine(text, time * 1.2);
	const animOut = sequence(
		time / (words.length - 1),
		...words.map((w) => fadeOutWord(w, 0.3)),
	);
	yield* all(moveLineOut, animOut);
}

function prepare(text: TxtPlus) {
	text.words.forEach((w) => {
		w.opacity(0);
		const letters = w.letters.map((l) => l.childAs<Txt>(0));
		letters.forEach((l) => l.skew(0));
	});
}

function* simpleTextAnim(text: TxtPlus) {
	const time = 1;

	const { words } = text;
	words.forEach((w) => w.x(50));

	yield* lineSlideIn(text, time);
	yield* italicizeWord(words.at(-1), 0.4);
	yield* waitFor(0.5);
	yield* lineSlideOut(text, time * 0.8);
}

function* commaTextAnim(text: TxtPlus) {
	const time = 1;

	const { words } = text;
	words.forEach((w) => w.x(50));

	yield* lineSlideIn2(text, time);
	yield* waitFor(0.5);
	yield* lineSlideOut(text, time * 0.8);
}

export default makeScene2D(function* (view) {
	const { byOrientation, portrait } = useViewport();

	const { shared } = useWeek5(
		0.3765,
		'Text Fade-In Animations 3',
		'Inspired by Stephan Zammit',
		'#1115',
	);
	// @ts-expect-error - this is a number in our case
	const lineWidth = shared.lineWidth * 1.5;
	const overrides: TxtProps = {
		fontFamily: 'Outfit',
		letterSpacing: -1.8,
		lineWidth: 0,
		fontWeight: 350,
	};
	if (portrait) {
		overrides.fontSize = 54;
		overrides.fontWeight = 600;
	}
	Object.assign(shared, overrides);

	const effects: Array<{
		text: string;
		func: typeof simpleTextAnim;
		mask?: Reference<Rect>;
		wordProps?: WordProps;
		initialProps?: TxtProps;
	}> = [
		{
			text: 'Text animation is simple',
			func: simpleTextAnim,
		},
		{
			text: 'We will pause, then resume animating',
			func: commaTextAnim,
		},
	];

	const txtParent = <Node />;
	view.add(txtParent);

	const texts: TxtPlus[] = [];
	txtParent.add(
		effects.map((e, i) => {
			const txtProps = { ...shared, ...e.initialProps };

			const x = 0;
			const y = 0;

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

	yield* loop(byOrientation(1, 2), function* () {
		texts.forEach(prepare);

		const animations = effects.map(function* (effect, i) {
			const text = texts[i];
			text.opacity(1);
			yield* effect.func(text);
		});

		yield* chain(...animations);
	});
});
