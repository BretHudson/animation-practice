import {
	Circle,
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
	createRef,
	createSignal,
	easeInQuad,
	easeOutCubic,
	easeOutQuad,
	EPSILON,
	linear,
	loop,
	makeRef,
	map,
	Reference,
	sequence,
	tween,
	waitFor,
} from '@motion-canvas/core';
import { useViewport } from '~/hooks/useViewport';
import { positionItemInRow } from '~/util';

import { TxtPlus, WordProps } from '~/components/TxtPlus';
import { useWeek5 } from '~/hooks/useWeek5';

function* gameBoyAnim(text: TxtPlus, mask: Layout) {
	const { letters } = text;

	mask.opacity(0);

	mask.x(-Math.abs(mask.x()));

	const txts = letters.map((l) => l.childAs<Txt>(0));

	letters.forEach((l, i) => {
		const x = positionItemInRow(i, letters.length, 250);
		if (true) {
			l.x(-x);
			l.opacity(0);
			l.scale(5);
		}
		// l.y(300);
	});

	const tScale = 1 / 1.3;

	const blue = new Color('#5E63FF').hsv();

	const getHSV = (shift: number) => {
		shift = Math.floor(shift / 16) * 16;
		const hsv = [...blue];
		hsv[0] += shift;
		hsv[0] %= 360;
		return hsv;
	};

	yield* sequence(
		0.1 * tScale,
		...letters.map((l, i) => {
			const time = createSignal(0);
			const y = createSignal(() => {
				const t = time();
				let c = t * 3;
				let amp = 300;
				let cos = Math.cos(c * Math.PI * 0.5);
				if (t > 1) {
					cos = -Math.abs(cos);
					const _t = (t - 1) / 2;
					amp = map(100, 20, easeOutQuad(_t));
				}
				return cos * amp;
				// return map(300, 0, time());
			});
			const fill = createSignal(() => {
				const t = Math.min(1, time());
				const offset = easeInQuad(t) * 360;
				const hsv = getHSV(offset);
				// hsv[0] = 130;
				// @ts-expect-error - this is valid
				return new Color(...hsv, 'hsv');
			});
			l.y(y);
			txts[i].fill(fill);
			return all(
				l.scale(1, 0.9 * tScale, linear),
				chain(time(2.33333, 2.33333 * tScale, linear)),
				l.x(0, 1.8 * tScale, easeOutCubic),

				l.opacity(1, 0.4 * tScale, linear),
				// chain(waitFor(0.4), txts[i].letterSpacing(1.8, 0.4)),
			);
		}),
	);

	yield* waitFor(0.3);

	mask.opacity(1);

	{
		const tScale = 1.5;

		const endX = -mask.x();
		const maskAnim = chain(
			waitFor(0.05 * tScale),
			mask.x(endX, 0.7 * tScale, linear),
		);
		const hueShifts = sequence(
			0.08 * tScale,
			...txts.map((txt) => {
				return tween(
					0.5 * tScale,
					(v) => {
						const shift = 70 * Math.sin(v * Math.PI);
						// @ts-expect-error - this is valid
						txt.fill(new Color(...getHSV(shift), 'hsv'));
					},
					// linear,
				);
			}),
		);
		yield* all(maskAnim, hueShifts);
	}

	// yield* lineSlideIn(text, time);
	// yield* italicizeWord(words.at(-1), 0.4);
	// yield* waitFor(0.5);
	// yield* lineSlideOut(text, time * 0.8);
}

export default makeScene2D(function* (view) {
	const { byOrientation, portrait } = useViewport();

	const { shared } = useWeek5(
		{ h: 0.1565, v: 0.99, c: 1.7 },
		'Text Fade-In Animations 4',
		'Gameboy Advance Startup Screen',
		'#111a',
	);
	// @ts-expect-error - this is a number in our case
	const lineWidth = shared.lineWidth * 1.5;
	let textScale = 2;
	if (portrait) {
		// textScale *= 0.5625;
	}
	const fontSize = 96 * textScale;
	const letterSpacing = -6 * textScale;
	const overrides: TxtProps = {
		fontFamily: 'Hind Siliguri',
		letterSpacing,
		lineWidth: 0,
		fontWeight: 700,
		fontSize,
		fontStyle: 'italic',
	};
	if (portrait) {
		overrides.fontWeight = 600;
	}
	Object.assign(shared, overrides);

	const effects: Array<{
		text: string;
		func: typeof gameBoyAnim;
		mask?: Reference<Rect>;
		wordProps?: WordProps;
		initialProps?: TxtProps;
	}> = [
		{
			text: 'GAMEBOY',
			func: gameBoyAnim,
		},
		// {
		// 	text: 'GAMEBOY',
		// 	func: gameBoyAnim,
		// },
	];

	const txtParent = <Node />;
	view.add(txtParent);

	const texts: TxtPlus[] = [];
	const maskRef = createRef<Layout>();
	txtParent.add(
		effects.map((e, i) => {
			const txtProps = { ...shared, ...e.initialProps };

			const x = 0;
			const y = 0;

			return (
				<Node cache zIndex={1001}>
					<TxtPlus
						ref={makeRef(texts, i)}
						x={x}
						y={y}
						text={e.text}
						wordProps={e.wordProps}
						txtProps={txtProps}
						compositeOperation={e.mask ? 'source-in' : 'source-over'}
						shadowBlur={5 * textScale}
						shadowColor={'#1117'}
					/>
					<Layout
						ref={maskRef}
						x={-300 * textScale}
						y={-20 * textScale}
						compositeOperation={'source-atop'}
					>
						<Circle size={fontSize * 0.8} fill="#ee39fd" />
						<Circle size={fontSize * 0.55} fill="#ee92fe" />
					</Layout>
				</Node>
			);
		}),
	);
	const mask = maskRef();

	// kerning
	const kern = (amount: number) => letterSpacing + amount * textScale;
	const [G, A, M, E, B, O, Y] = texts[0].letters.map((l) => l.childAs<Txt>(0));
	G.letterSpacing(kern(-4.5));
	A.letterSpacing(kern(-4));
	M.letterSpacing(kern(-5));
	E.letterSpacing(kern(16));
	B.letterSpacing(kern(0));
	O.letterSpacing(kern(-5.5));
	Y.letterSpacing(kern(0));

	// yield* waitFor(0.5);

	yield* loop(byOrientation(1, 2), function* () {
		texts.forEach((txt, i) => txt.opacity(effects[i].mask ? EPSILON : 0));

		const animations = effects.map(function* (effect, i) {
			const text = texts[i];
			text.opacity(1);
			yield* effect.func(text, mask);
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
