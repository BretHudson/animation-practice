import {
	Layout,
	makeScene2D,
	Node,
	Rect,
	RectProps,
	Txt,
	TxtProps,
} from '@motion-canvas/2d';
import {
	all,
	Color,
	createRef,
	createSignal,
	easeInSine,
	easeOutElastic,
	easeOutSine,
	loop,
	Vector2,
	waitFor,
} from '@motion-canvas/core';

import { TxtPlus, TxtPlusProps } from '~/components/TxtPlus';

import { useViewport } from '~/hooks/useViewport';
import { useWeek7 } from '~/hooks/useWeek7';

import { WGTheme } from '~/util/themes';

export default makeScene2D(function* (view) {
	const { byOrientation, viewW, viewH } = useViewport();

	const { bg, credits } = useWeek7(undefined, '#111f', 10);
	credits().authorTxt().fill(WGTheme.bubbleBg);

	bg().fill('#222');

	const txtFillColor = new Color('#deb881');
	const fill = createSignal(txtFillColor);

	const initialFontSize = 256 * byOrientation(1.3, 0.7);
	const secondFontSize = 200 * byOrientation(1, 0.5);
	const fontSize = createSignal(initialFontSize);

	const initialScale = 0.5;
	// const initialScale = 1;
	const scale = createSignal(initialScale);

	const initialGap = 80;
	const gap = createSignal(initialGap);

	const initialLetterSpacing = -0.05;
	const letterSpacingAmount = createSignal(initialLetterSpacing);
	const letterSpacing = createSignal(() => fontSize() * letterSpacingAmount());

	const initialRadius = 50;
	const radius = createSignal(initialRadius);

	const txtGold = createRef<Txt>();
	const txtIn = createRef<Txt>();
	const txtColor = createRef<Txt>();
	const txtCombinations = createRef<Txt>();

	const txtGoldMask = createRef<Rect>();
	const txtInMask = createRef<Rect>();
	const txtColorMask = createRef<Rect>();
	const txtCombinationsMask = createRef<Rect>();

	const props: TxtProps = {
		text: '---',
		fontFamily: 'Sharpin',
		// fontWeight: 700,
		fill: 'white',
		fontSize,
		letterSpacing,
	};

	const maskProps: RectProps = {
		fill,
		radius,
		compositeOperation: 'source-in',
	};

	view.add(
		<>
			<Layout
				gap={gap}
				layout
				y={createSignal(() => -0.48 * fontSize())}
				scaleX={scale}
			>
				<Node cache>
					<Txt ref={txtGold} {...props} text="gold" />
					<Layout layout={false}>
						<Rect ref={txtGoldMask} {...maskProps} />
					</Layout>
				</Node>
				<Node cache>
					<Txt ref={txtIn} {...props} text="in" />

					<Layout layout={false}>
						<Rect ref={txtInMask} {...maskProps} />
					</Layout>
				</Node>
				<Node cache>
					<Txt ref={txtColor} {...props} text="color" />

					<Layout layout={false}>
						<Rect ref={txtColorMask} {...maskProps} />
					</Layout>
				</Node>
			</Layout>
			<Node cache y={createSignal(() => 0.48 * fontSize())}>
				<Txt
					ref={txtCombinations}
					{...props}
					text="combinations"
					scaleX={scale}
				/>
				<Rect ref={txtCombinationsMask} {...maskProps} />
			</Node>
		</>,
	);

	const yOff = -0.073;
	const heightPerc = 0.7325;

	const propSignal = (
		txt: Txt,
		property: 'width' | 'height',
		func: (v: number) => number,
	) => {
		return createSignal(() => func(txt[property]()));
	};

	// txtGoldMask().absolutePosition(txtGold().absolutePosition);
	// txtGoldMask().width(txtGold().width);

	const adjustMask = (
		txt: Txt,
		mask: Rect,
		xOff: number,
		widthPerc: number,
		useScale = false,
	) => {
		mask.absolutePosition(
			createSignal(() => {
				return txt.absolutePosition().addX(txt.width() * xOff);
			}),
		);
		// mask.x(propSignal(txt, 'width', (v) => v * xOff));
		mask.width(
			propSignal(txt, 'width', (v) => {
				return v * widthPerc * (useScale ? scale() : 1);
			}),
		);
		mask.y(propSignal(txt, 'height', (v) => v * yOff));
		mask.height(propSignal(txt, 'height', (v) => v * heightPerc));
	};

	adjustMask(txtGold(), txtGoldMask(), -0.003, 0.978);
	adjustMask(txtIn(), txtInMask(), -0.0155, 0.938);
	adjustMask(txtColor(), txtColorMask(), -0.0042, 0.983);
	adjustMask(txtCombinations(), txtCombinationsMask(), -0.0018, 0.992, true);

	yield* loop(2, function* () {
		const dur = 1;
		yield* waitFor(0.5);
		yield* all(
			scale(1, dur),
			gap(30, dur),
			fontSize(secondFontSize, dur),
			fill(new Color('white'), dur),
			letterSpacingAmount(0, dur),
			radius(0, dur),
		);
		yield* waitFor(0.5);
		yield* gap(initialGap, 0.6, easeOutElastic);
		yield* waitFor(0.5);
		yield* scale(initialScale, 0.8, easeOutElastic);
		yield* waitFor(0.5);
		yield* fontSize(initialFontSize, 0.8, easeOutElastic);
		yield* waitFor(0.5);
		yield* letterSpacingAmount(initialLetterSpacing, 0.5, easeOutElastic);
		yield* waitFor(0.5);
		yield* radius(initialRadius, 0.6);
		yield* waitFor(0.5);
		yield* fill(new Color('#222'), 0.4, easeInSine);
		yield* fill(txtFillColor, 0.4, easeOutSine);
		yield* waitFor(0.5);
	});
});
