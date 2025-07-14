import { makeScene2D, Txt, TxtProps } from '@motion-canvas/2d';
import {
	all,
	Color,
	createRef,
	createSignal,
	easeOutBack,
	easeOutElastic,
	loop,
	Vector2,
	waitFor,
} from '@motion-canvas/core';

import { useViewport } from '~/hooks/useViewport';
import { useWeek7 } from '~/hooks/useWeek7';

import shader from '~/shaders/shader-041.glsl';
import { WGTheme } from '~/util/themes';

export default makeScene2D(function* (view) {
	const { byOrientation, viewW, viewH } = useViewport();

	const { bg, credits } = useWeek7(undefined, '#111f', 10);

	credits().authorTxt().fill(WGTheme.bubbleBg);

	bg().fill('#5b4452');

	const bgFill = bg().fill();
	if (!(bgFill instanceof Color)) {
		throw new Error('Not a color for some reason');
	}

	const bgColor = createSignal(() => {
		return bgFill._rgb._unclipped.map((v, i) => (i === 3 ? v : v / 255));
	});

	const shadowT = createSignal(1);
	const holeSize = createSignal(1);

	const fontSize = createSignal(256 * byOrientation(1.5, 1.05));
	const lineWidth = createSignal(() => fontSize() * 0.05);
	const letterSpacing = createSignal(() => fontSize() * 0.12);

	const offset = createSignal(() => new Vector2(1, 1).scale(fontSize() / 32));
	const position = createSignal(() => offset().scale(-0.75 * shadowT()));
	const shadow1Offset = createSignal(() => offset().scale(shadowT()));
	const shadow2Offset = createSignal(() => shadow1Offset().scale(2));

	const props: TxtProps = {
		fontFamily: 'Winky Rough',
		position,
		// fontWeight: 700,
		text: 'ENJOY',
		fontSize,
		letterSpacing,
	};

	const txtFill = createRef<Txt>();
	const txtStroke = createRef<Txt>();
	view.add(
		<>
			<Txt {...props} fill={WGTheme.bubbleBg} position={shadow2Offset} />
			<Txt {...props} fill={bg().fill} position={shadow1Offset} />
			<Txt
				ref={txtStroke}
				{...props}
				fill={bg().fill}
				stroke={WGTheme.bubbleBg}
				lineWidth={lineWidth}
			/>
			<Txt ref={txtFill} {...props} fill={WGTheme.bubbleBg} />
		</>,
	);
	txtFill().shaders({
		fragment: shader,
		uniforms: {
			axis: byOrientation(0, 0),
			bgColor, //: [0, 0.5, 0.5],
			holeSize,
		},
	});

	yield* loop(2, function* () {
		const pre = letterSpacing();
		yield* waitFor(0.3);
		yield* all(
			holeSize(0, 0.5),
			shadowT(0, 0.5),
			txtStroke().lineWidth(0, 0.5),
			letterSpacing(0, 0.5),
		);
		yield* waitFor(1);
		yield* letterSpacing(pre, 1, easeOutElastic);
		// yield* waitFor(0.5);
		yield* txtStroke().lineWidth(lineWidth, 0.5, easeOutBack);
		yield* waitFor(0.5);
		yield* holeSize(1, 0.5, easeOutBack);
		yield* waitFor(0.5);
		yield* shadowT(1, 1, easeOutElastic);
		yield* waitFor(0.2);
	});
});
