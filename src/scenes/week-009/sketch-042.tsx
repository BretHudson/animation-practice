import {
	Img,
	Layout,
	makeScene2D,
	Rect,
	Txt,
	TxtProps,
} from '@motion-canvas/2d';
import { ShaderConfig } from '@motion-canvas/2d/lib/partials/ShaderConfig';
import {
	all,
	Color,
	createEaseOutBack,
	createEffect,
	createRef,
	createSignal,
	easeOutBounce,
	sequence,
	Vector2,
	waitFor,
} from '@motion-canvas/core';

// @ts-expect-error -- no types :(
import calcSdf from 'bitmap-sdf';
import { TxtPlus, TxtPlusProps } from '~/components/TxtPlus';

import { useViewport } from '~/hooks/useViewport';
import { useWeek7 } from '~/hooks/useWeek7';

import glslExplodeBorder from '~/shaders/shader-042-explode-border.glsl';
import glslExplode from '~/shaders/shader-042-explode.glsl';
import shader from '~/shaders/shader-042.glsl';
import { allMap } from '~/util';
import { WGTheme } from '~/util/themes';

const canvas = document.createElement('canvas');

const configureCanvas = (shape: Layout) => {
	const [width, height] = [shape.width(), shape.height()].map(Math.ceil);
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, width, height);
};

const generateSDF = (radius: number, cutoff = 0.01) => {
	const { width, height } = canvas;

	const ctx = canvas.getContext('2d');

	const dist = calcSdf(canvas, {
		cutoff,
		radius,
		channel: 3,
	});

	let imgArr = new Uint8ClampedArray(width * height * 4);
	for (let i = 0; i < width; i++) {
		for (let j = 0; j < height; j++) {
			const d = dist[j * width + i];
			const jj = j * width * 4 + i * 4;
			imgArr[jj + 0] = d * 255;
			imgArr[jj + 1] = d * 255;
			imgArr[jj + 2] = d * 255;
			imgArr[jj + 3] = 255;
		}
	}
	var data = new ImageData(imgArr, width, height);
	ctx.putImageData(data, 0, 0);

	return { src: canvas.toDataURL(), width: width, height: height };
};

export default makeScene2D(function* (view) {
	const { byOrientation, viewW, viewH } = useViewport();

	const { bg, credits } = useWeek7(undefined, '#111f', 10);

	// credits().authorTxt().fill(WGTheme.bubbleBg);

	bg().fill('#f7e9de');

	// const bgFill = bg().fill();
	const bgFillColor = new Color('rgb(24, 16, 18)');
	if (!(bgFillColor instanceof Color)) {
		throw new Error('Not a color for some reason');
	}
	const txtFillColor = new Color('#a3dfe8');
	// const txtFillColor = new Color('rgb(114, 159, 172)');
	if (!(txtFillColor instanceof Color)) {
		throw new Error('Not a color for some reason');
	}
	const txtShadowColor = new Color('#ffde1d');
	if (!(txtShadowColor instanceof Color)) {
		throw new Error('Not a color for some reason');
	}

	const bgColor = createSignal(() => {
		return bgFillColor._rgb._unclipped.map((v, i) => (i === 3 ? v : v / 255));
	});

	const txtColor = createSignal(() => {
		return txtFillColor._rgb._unclipped.map((v, i) => (i === 3 ? v : v / 255));
	});

	const shadowColor = createSignal(() => {
		return txtShadowColor._rgb._unclipped.map((v, i) =>
			i === 3 ? v : v / 255,
		);
	});

	const shadowT = createSignal(1);
	const holeSize = createSignal(1);

	const fontSize = createSignal(256 * 1.5);
	const letterSpacing = createSignal(() => fontSize() * -0.09);

	const offset = createSignal(() => new Vector2(1, 1).scale(fontSize() / 32));
	const position = createSignal(() => offset().scale(-0.75 * shadowT()));

	const buffer = createSignal(0.9);
	const gamma = createSignal(0.1);

	const shadowShader: ShaderConfig = {
		fragment: shader,
		uniforms: {
			axis: byOrientation(0, 0),
			bgColor, //: [0, 0.5, 0.5],
			txtColor,
			shadowColor,
			holeSize,
			gamma,
			buffer,
		},
	};
	const borderShader: ShaderConfig = {
		fragment: shader,
		uniforms: {
			...shadowShader.uniforms,
			shadowColor: txtColor,
		},
	};
	const explodeBorderShader: ShaderConfig = {
		fragment: glslExplodeBorder,
		uniforms: {
			...shadowShader.uniforms,
			shadowColor: [1, 1, 0, 0],
			// bgColor: [1, 0, 1, 0.6],
		},
	};

	const shaderExplode: ShaderConfig = {
		fragment: glslExplode,
	};
	const explodeRef = createRef<Rect>();
	view.add(
		<Rect
			ref={explodeRef}
			// padding={100}
			width={1000}
			height={1000}
			fill="white"
			shaders={[shaderExplode]}
		/>,
	);

	const explodeImg = createRef<Img>();
	view.add(<Img ref={explodeImg} src={''} />);
	explodeImg().shaders(explodeBorderShader);

	{
		// explodeRef().offset([-1, -1]);
		configureCanvas(explodeRef());
		explodeRef().scale(0.99);
		const ctx = canvas.getContext('2d');
		ctx.translate(explodeRef().width() / 2, explodeRef().height() / 2);
		explodeRef().render(ctx);
		const imgProps = generateSDF(100, 0.005);
		explodeRef().scale(1);

		explodeImg().src(imgProps.src);
		explodeImg().width(imgProps.width);
		explodeImg().height(imgProps.height);
	}
	// return;

	const radius = 100;
	const props: TxtPlusProps = {
		fontFamily: 'Literata',
		position,
		// fontWeight: 700,
		text: 'Yeah!',
		fontSize,
		letterSpacing,
		padding: radius,
	};
	//return;

	const txtFill = createRef<TxtPlus>();
	const txtStroke = createRef<Txt>();
	// view.add(
	// 	<>
	// 		<Txt {...props} fill={WGTheme.bubbleBg} position={shadow2Offset} />
	// 		<Txt {...props} fill={bg().fill} position={shadow1Offset} />
	// 		<Txt
	// 			ref={txtStroke}
	// 			{...props}
	// 			fill={bg().fill}
	// 			stroke={WGTheme.bubbleBg}
	// 			lineWidth={lineWidth}
	// 		/>
	// 		<Txt ref={txtFill} {...props} fill={WGTheme.bubbleBg} />
	// 	</>,
	// );

	// txtFill().shaders(shaderConfig);

	// console.time('all');

	const shadowImg = createRef<Img>();
	view.add(<Img ref={shadowImg} src={''} />);
	shadowImg().shaders(shadowShader);
	const borderImg = createRef<Img>();
	view.add(<Img ref={borderImg} src={''} />);
	borderImg().shaders(borderShader);

	const shadowLength = createSignal(70);

	const rot = Array.from({ length: 5 }, () => createSignal(1));

	const letterProps: TxtProps[] = [
		{
			x: 30,
			y: 10,
			rotation: 10,
			fontWeight: 700,
		},
		{
			x: -10,
			y: 20,
			rotation: 8,
			fontWeight: 700,
		},
		{
			rotation: 5,
			x: 10,
			y: 10,
			fontStyle: 'italic',
			fontWeight: 700,
		},
		{
			rotation: -10,
			x: -5,
			y: 20,
			fontWeight: 700,
		},
		{
			rotation: 5,
			y: -10,
			fontWeight: 700,
		},
	];

	const updateLetters = (txt: TxtPlus) => {
		txt.letters.forEach((l, i) => {
			const p = letterProps[i];
			l.x(
				createSignal(() => {
					return ((p.x as number) ?? 0) * rot[i]();
				}),
			);
			l.y(
				createSignal(() => {
					return ((p.y as number) ?? 0) * rot[i]();
				}),
			);
			l.childAs<Txt>(0).fontStyle(p.fontStyle);
			l.childAs<Txt>(0).rotation(
				createSignal(() => {
					return ((p.rotation as number) ?? 0) * rot[i]();
				}),
			);
		});
	};

	const shadowVec = new Vector2(1, 0).rotate(50);
	createEffect(() => {
		const offscreenTxt = createRef<TxtPlus>();
		<TxtPlus
			ref={offscreenTxt}
			{...props}
			txtProps={{ fill: 'white' }}
			offset={[-1, -1]}
		/>;
		updateLetters(offscreenTxt());

		const length = shadowLength();
		const half = Math.round(length / 2);

		{
			configureCanvas(offscreenTxt());
			offscreenTxt().x(-half * shadowVec.x);
			offscreenTxt().y(-half * shadowVec.y);
			offscreenTxt().render(canvas.getContext('2d'));
			const imgProps = generateSDF(radius * 2);

			borderImg().src(imgProps.src);
			borderImg().width(imgProps.width);
			borderImg().height(imgProps.height);
		}

		configureCanvas(offscreenTxt());
		// console.time('render');
		for (let x = -half; x <= half; ++x) {
			offscreenTxt().x(x * shadowVec.x);
			offscreenTxt().y(x * shadowVec.y);
			offscreenTxt().render(canvas.getContext('2d'));
		}
		// console.timeEnd('render');

		const imgProps = generateSDF(radius * 2);
		offscreenTxt().x(-half * shadowVec.x);
		offscreenTxt().y(-half * shadowVec.y);

		shadowImg().src(imgProps.src);
		shadowImg().width(imgProps.width);
		shadowImg().height(imgProps.height);
	});
	// txtFill().opacity(0);
	// view.add(txtFill());
	// txtFill().fill(bgFillColor);
	// img().opacity(0);
	const pos = createSignal(() => {
		const length = shadowLength();
		const half = Math.round(length / 2);
		return shadowVec.scale(-half);
	});
	view.add(
		<TxtPlus
			ref={txtFill}
			{...props}
			position={pos}
			txtProps={{
				fill: txtFillColor,
			}}
		/>,
	);

	updateLetters(txtFill());

	// yield* waitFor(1);
	// console.warn('done');

	const ls = letterSpacing();
	yield* waitFor(0.3);
	yield* all(
		shadowLength(0, 0.5),
		allMap(rot, (r) => r(0, 0.5)),
		letterSpacing(0, 0.5),
	);

	yield* waitFor(0.3);
	yield* letterSpacing(ls, 0.6, createEaseOutBack(1.70158 * 3));
	yield* waitFor(0.3);
	yield* sequence(0.05, ...rot.map((r) => r(1, 0.5, easeOutBounce)));

	yield* waitFor(0.3);
	yield* shadowLength(70, 0.5, createEaseOutBack(1.70158 * 2.5));
	yield* waitFor(0.3);
});
