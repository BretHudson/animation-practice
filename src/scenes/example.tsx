import {
	Node,
	Layout,
	makeScene2D,
	Rect,
	Txt,
	Gradient,
} from '@motion-canvas/2d';
import {
	all,
	Color,
	createRef,
	easeOutCubic,
	loop,
	makeRef,
	map,
	ThreadGenerator,
	tween,
	useRandom,
	Vector2,
} from '@motion-canvas/core';

const textProps = {
	fill: 'white',
	fontFamily: 'Rubik Puddles',
	fontSize: 140,
	lineHeight: 200,
	styles: {
		'font-variation-settings': '"EDPT" 200',
		fontVariationSettings: '"EDPT" 200',
	},
};

function getSpaceWidth() {
	const textRef = createRef<Txt>();
	const noSpaceRef = createRef<Txt>();
	<Txt ref={textRef} text="1 1" {...textProps} />;
	<Txt ref={noSpaceRef} text="11" {...textProps} />;
	return 2 * (textRef().size().x - noSpaceRef().size().x);
}

function createLetters(str: string, ref: Txt[]): Node[] {
	const spaceWidth = getSpaceWidth();
	return str.split('').map((c, i) => {
		const width = c === ' ' ? spaceWidth : undefined;
		return <Txt ref={makeRef(ref, i)} text={c} width={width} {...textProps} />;
	});
}

function positionLetters(letters: Txt[]): void {
	const spaceWidth = getSpaceWidth();
	const width = letters.reduce((a, c) => a + (c.width() || spaceWidth), 0);

	let curX = -0.5 * width;
	letters.forEach((letter) => {
		const w = letter.width();
		curX += w * 0.5;
		letter.position.x(curX);
		curX += w * 0.5;
	});
}

function tweenArray<T extends Node>(
	arr: T[],
	callback: (c: T, i: number, originalArr: typeof arr) => ThreadGenerator,
): ThreadGenerator {
	return all(...arr.map(callback));
}

function tToRadians(v: number) {
	return v * Math.PI * 2;
}

export default makeScene2D(function* (view) {
	const str = 'Recurse Day 1';
	const letters: Txt[] = [];

	const random = useRandom(20);

	const gradient = new Gradient({
		from: new Vector2(-540, -300),
		to: new Vector2(440, 300),
		stops: [
			{ offset: 0, color: '#ccddff' },
			{ offset: 1, color: '#000011' },
		],
	});
	view.add(<Rect width={1280} height={720} fill={gradient} opacity={0.17} />);
	view.add(createLetters(str, letters));
	positionLetters(letters);

	letters.forEach((letter) => {
		letter.rotation(random.nextFloat(-30, 30));
	});

	const duration = 1.7;
	const variance = 3.3;
	const amplitude = 12;
	const count = str.length;
	const repeat = 2;
	const from = new Color('#ffaa88');
	const to = new Color('#ffffff');
	yield* tweenArray(letters, (c, i) => {
		const o = (i / count) * 2 * variance;
		const posTween = loop(repeat, () =>
			tween(duration, (value) => {
				const t = Math.sin(o + tToRadians(value));
				c.position.y(map(0, amplitude, t));
			}),
		);
		const colorTween = tween(duration * repeat, (value) => {
			const t = Math.abs(Math.sin(o * 0.7 + -tToRadians(value)));
			c.fill(Color.lerp(from, to, easeOutCubic(t)));
		});
		return all(posTween, colorTween);
	});
});
