import {
	Camera,
	Layout,
	makeScene2D,
	Node,
	Rect,
	Txt,
	TxtProps,
} from '@motion-canvas/2d';
import {
	all,
	cancel,
	chain,
	Color,
	createRef,
	createSignal,
	easeInCubic,
	easeInOutQuad,
	easeOutBack,
	easeOutBounce,
	easeOutCubic,
	easeOutElastic,
	linear,
	sequence,
	useRandom,
	Vector2,
	waitFor,
} from '@motion-canvas/core';
import { getViewportData } from '~/util';

import { TxtPlus } from '~/components/TxtPlus';
import { useWeek7 } from '~/hooks/useWeek7';
import { WGTheme } from '~/util/themes';

const textColor = new Color(WGTheme.bubbleBg);

export default makeScene2D(function* (view) {
	const { byOrientation, viewW, viewH, portrait, primaryAxis } =
		getViewportData(view);

	const viewSize = new Vector2(viewW, viewH);

	const { bg, credits } = useWeek7('viola he @v10101a', '#111', 5);

	// bg().fill('#f3f6ff');

	credits().sketchTxt().fill(textColor);
	[credits().authorTxt(), credits().coauthorTxt()].forEach((txt) => {
		txt.fill(textColor);
		txt.stroke('#111');
		txt.lineWidth(5);
		txt.strokeFirst(true);
	});

	const size = 200;
	const halfSize = size / 2;
	const rect = createRef<Rect>();
	const dvd = createRef<Txt>();
	view.add(
		<Rect ref={rect} size={size} fill="limegreen">
			<Txt
				ref={dvd}
				fontFamily="Literata"
				text="dvd"
				fontSize={100}
				fill={WGTheme.bubbleBg}
				opacity={0.5}
				compositeOperation={'xor'}
			/>
		</Rect>,
	);

	const baseVel = Vector2.right.rotate(byOrientation(45, 135));
	const maxDist = viewH - size;

	const edge = viewSize.sub(size).scale(0.5);
	const startPos = new Vector2(-edge.x, -edge.y);
	startPos[primaryAxis] = 500;
	let curPos = startPos;

	rect().position(startPos);

	const colors = [
		new Color('rgba(64, 0, 149, 1)'),
		new Color('rgba(64, 255, 0, 1)'),
		new Color('rgba(64, 60, 255, 1)'),
		new Color('rgba(64, 244, 248, 1)'),
	];

	const positions = [];

	for (let i = 0; i < 100; ++i) {
		const vX = Math.sign(baseVel.x);
		const vY = Math.sign(baseVel.y);

		const targetEdges = new Vector2(edge.x * vX, edge.y * vY);
		const delta = targetEdges.sub(curPos);
		const dist = Math.min(Math.abs(delta.x), Math.abs(delta.y));
		if (dist === delta.x) baseVel.x *= -1;
		if (dist === delta.y) baseVel.y *= -1;

		const toMove = new Vector2(vX, vY).scale(dist);
		curPos = curPos.add(toMove);
		if (toMove.magnitude > 0) positions.push(curPos);

		if (
			Math.abs(curPos.x) === Math.abs(edge.x) &&
			Math.abs(curPos.y) === Math.abs(edge.y)
		) {
			break;
		}
	}

	let last;
	while (positions.length > 21) {
		last = positions.shift();
	}
	rect().position(Vector2.lerp(last, positions[0], 0.5));

	// console.table(positions.map((p) => [p.x, p.y].join(',')));

	yield* chain(
		...positions.map(function* (p, i) {
			const cIndex = i % colors.length;
			console.log(p, cIndex);
			const color = colors[cIndex];
			colors[cIndex] = Color.lerp(color, new Color('red'), 0);
			rect().fill(color);

			const toMove = p.sub(rect().position());
			yield* rect().position(p, toMove.magnitude / maxDist, linear);
		}),
	);

	const txt = createRef<Txt>();

	view.add(
		<>
			<Txt
				ref={txt}
				fontFamily="Galada"
				text="hell yeah"
				fontSize={byOrientation(50, 35)}
				fill={WGTheme.bubbleBg}
				opacity={0}
			/>
		</>,
	);

	rect().offset([-1, -1]);
	rect().position(rect().position().sub(halfSize));
	const dur = 3;
	const sizeAnims = all(
		//
		dvd().scale(
			byOrientation(viewH / rect().height(), viewW / rect().width()),
			dur,
			easeOutBounce,
		),
		rect().width(viewW, dur, easeOutBounce),
		rect().height(viewH, dur, easeOutBounce),
	);
	const txtAnims = all(
		//
		txt().opacity(1, 0.5),
		chain(
			waitFor(0.2),
			all(
				txt().fontSize(byOrientation(300, 200), 1.3, easeOutElastic),
				txt().skew([0, -14], 1, easeOutCubic),
				txt().letterSpacing(byOrientation(40, 30), 1),
			),
		),
	);
	yield* sequence(2, sizeAnims, txtAnims);

	yield* waitFor(0.3);
});
