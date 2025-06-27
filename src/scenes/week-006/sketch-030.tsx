import {
	Camera,
	Img,
	Layout,
	Node,
	Rect,
	RectProps,
	Txt,
} from '@motion-canvas/2d';
import {
	all,
	Color,
	createRef,
	createSignal,
	Direction,
	easeInCubic,
	easeInOutQuad,
	easeInQuart,
	easeInQuint,
	easeOutCubic,
	easeOutQuint,
	fadeTransition,
	range,
	sequence,
	slideTransition,
	ThreadGenerator,
	useRandom,
	useScene,
	useTransition,
	Vector2,
	waitFor,
} from '@motion-canvas/core';
import { Week6Credits } from '~/components/week/week-006/Credits';
import { Week6Title } from '~/components/week/week-006/Title';

import face1 from '~/assets/sketch-030/face-1.png';
import face2 from '~/assets/sketch-030/face-2.png';

import { useWeek6 } from '~/hooks/useWeek6';
import { makeParametrizedScene, positionItemInRow } from '~/util';

// Pulled from Kyle Pulver's Otter2d
// https://github.com/kylepulver/Otter/blob/master/Otter/Utility/Util.cs
function scaleClamp(
	value: number,
	min: number,
	max: number,
	min2: number,
	max2: number,
) {
	value = min2 + ((value - min) / (max - min)) * (max2 - min2);
	if (max2 > min2) {
		value = value < max2 ? value : max2;
		return value > min2 ? value : min2;
	}
	value = value < min2 ? value : min2;
	return value > max2 ? value : max2;
}

const wallColor = '#335';

export function* fadeColorTransition(duration = 1.2) {
	const size = useScene().getRealSize();
	const fadeOut = createSignal(0);
	const fadeIn = createSignal(0);
	const endTransition = useTransition((ctx) => {
		ctx.globalAlpha = fadeOut();
		ctx.fillStyle = wallColor;
		ctx.fillRect(0, 0, size.x, size.y);
		ctx.globalAlpha = fadeIn();
	});
	yield* fadeOut(1, duration / 2, easeOutCubic);
	yield* fadeIn(1, duration / 2, easeInCubic);
	endTransition();
}

export function* switchRooms(
	direction: Direction = Direction.Top,
	duration = 0.5,
): ThreadGenerator {
	const size = useScene().getRealSize();
	const position = size.getOriginOffset(direction).scale(2);
	const previousPosition = Vector2.createSignal();
	const currentPosition = Vector2.createSignal(position);

	const rectX = createSignal(0);
	const rectY = createSignal(0);

	let fromX = 0,
		fromY = 0;
	let toX = 0,
		toY = 0;
	switch (direction) {
		case Direction.Right:
			fromX = size.width;
			break;
		case Direction.Bottom:
			fromY = size.height;
			break;
		case Direction.Left:
			toX = size.width;
			break;
		case Direction.Top:
			toY = size.height;
			break;
	}

	rectX(fromX);
	rectY(fromY);

	const endTransition = useTransition((ctx) => {
		let xx = rectX();
		let yy = rectY();
		let ww = size.width;
		let hh = size.height;
		let invX = false;
		let invY = false;

		ctx.fillStyle = wallColor;
		switch (direction) {
			case Direction.Left:
				ww = -size.width - previousPosition.x();
				invX = true;
				break;
			case Direction.Right:
				ww += previousPosition.x();
				break;
			case Direction.Top:
				hh = -size.height + previousPosition.y();
				invY = true;
				break;
			case Direction.Bottom:
				hh += previousPosition.y();
				break;
		}
		ctx.fillRect(xx, yy, ww, hh);

		ctx.beginPath();
		let xxx = rectX() + ww * Math.abs(Math.sign(toX - fromX));
		if (invX) xxx -= size.height;
		let yyy = rectY() + hh * Math.abs(Math.sign(toY - fromY));
		if (invY) yyy -= size.height;
		ctx.rect(xxx, yyy, size.width, size.height);
		ctx.clip();
	});

	// perform animations
	yield* all(
		previousPosition(position.scale(-1), duration),
		currentPosition(Vector2.zero, duration),
		rectX(toX, duration * 0.5),
		rectY(toY, duration * 0.5),
	);

	// finish the transition
	endTransition();
}

export interface Sketch30SceneProps {
	bitmask: number;
	target: Direction;
	from: Direction;
	first?: boolean;
	last?: boolean;
	goal?: boolean;
	_debugColor?: string;
}

export default makeParametrizedScene(function* (
	view,
	props: Sketch30SceneProps,
) {
	const size = useScene().getRealSize();

	const { bitmask, target, from, first, last, goal } = props;

	view.fill('#88a');
	// if (props._debugColor) view.fill(props._debugColor);

	const wallWidth = 200;

	const maskProps: RectProps = {
		fill: 'white',
		compositeOperation: 'destination-out',
	};

	const blockSize = [wallWidth * 2, wallWidth] as [number, number];
	const inlineSize = blockSize.toReversed() as [number, number];
	const playerWidth = wallWidth * 0.6;
	const player = createRef<Rect>();
	const face = createRef<Img>();
	const camera = createRef<Camera>();

	const maxZoom = 3.4;
	const faceOpacity = createSignal(() => {
		return easeInCubic((camera().zoom() - 1) / (maxZoom - 1));
	});

	const n = 10;
	const stripH = size.y / (n * 2);
	view.add(
		<Camera ref={camera} x={size.x * 0.5} y={size.y * 0.5}>
			<Layout x={size.x * 0.5} y={size.y * 0.5}>
				{range(n).map((i) => {
					return (
						<Rect
							fill="#fff3"
							y={positionItemInRow(i, n, stripH, stripH)}
							width={size.x}
							height={stripH}
						/>
					);
				})}
				<Node cache>
					<Rect fill={wallColor} size={size} />
					<Rect size={size.sub(wallWidth)} {...maskProps} />
					{bitmask & Direction.Left ? (
						<Rect x={-size.x * 0.5} size={inlineSize} {...maskProps} />
					) : null}
					{bitmask & Direction.Right ? (
						<Rect x={size.x * 0.5} size={inlineSize} {...maskProps} />
					) : null}
					{bitmask & Direction.Top ? (
						<Rect y={-size.y * 0.5} size={blockSize} {...maskProps} />
					) : null}
					{bitmask & Direction.Bottom ? (
						<Rect y={size.y * 0.5} size={blockSize} {...maskProps} />
					) : null}
				</Node>
				<Rect ref={player} fill="white" size={playerWidth}>
					<Img
						ref={face}
						opacity={faceOpacity}
						src={face1}
						x={3}
						rotation={3}
						size={playerWidth * 1.1}
					/>
				</Rect>
			</Layout>
		</Camera>,
	);

	useWeek6('Transitions 5', 'Room Transitions');

	const week6Title = view.childAs<Week6Title>(3);
	const week6Credits = view.childAs<Week6Credits>(4);
	week6Title.y(0);
	week6Title.childAs<Txt>(0).fontSize(128);

	week6Title.zIndex(0);
	week6Credits.zIndex(1);
	week6Credits.opacity(week6Title.opacity);
	week6Credits.y(week6Title.y);

	let start;
	let end;
	switch (from) {
		case Direction.Bottom:
			start = view.top();
			break;
		case Direction.Left:
			start = view.right();
			break;
		case Direction.Top:
			start = view.bottom();
			break;
		case Direction.Right:
			start = view.left();
			break;
		default:
			start = Vector2.zero;
			break;
	}

	switch (target) {
		case Direction.Bottom:
			end = view.bottom();
			break;
		case Direction.Left:
			end = view.left();
			break;
		case Direction.Top:
			end = view.top();
			break;
		case Direction.Right:
			end = view.right();
			break;
		default:
			end = Vector2.zero;
			break;
	}

	const cameraOffset = size.scale(0.5);
	start = start.sub(cameraOffset);
	end = end.sub(cameraOffset);

	player().position(start);

	if (last) {
		player().opacity(0);
	}

	// transition if we're not the first scene
	if (!first) {
		week6Title.opacity(0);
		if (last) yield* fadeColorTransition();
		else yield* switchRooms(from);
		yield* waitFor(0.05);
	}

	const titleYMove = 25;

	const inDur = player().position().magnitude / 1200;
	const moveToCenter = player().position(0, inDur, easeOutCubic);

	// first scene needs to fade out text before animating
	let rot = 0;
	if (first) {
		const y = player().y();
		player().y(y + Math.sign(y) * playerWidth);

		yield* waitFor(0.3);
		yield* sequence(
			0.1,
			all(week6Title.opacity(0, 0.4), week6Title.y(titleYMove, 0.4)),
			all(player().rotation(350, 1, easeOutCubic), moveToCenter),
		);

		rot = 360;

		yield* camera().zoom(maxZoom, 1.2);
		yield* waitFor(0.7);
		face().src(face2);
		yield* waitFor(0.9);
		yield* camera().zoom(1, 0.7);
	} else {
		yield* moveToCenter;
	}

	// wait in center of screen
	yield* waitFor(0.3);

	// if (goal) {
	// 	yield* player().opacity(0, 0.3);
	// 	yield* waitFor(0.3);
	// }

	if (!last && target) {
		const dur = end.magnitude / 1200;
		yield* all(
			player().rotation(rot, dur),
			player().position(end, dur, easeInQuart),
		);
	}

	// last scene needs to prepare the first sceen for looping
	if (last) {
		player().opacity(0);

		// fade out
		// fade in

		yield* all(week6Title.opacity(1, 0.4), week6Title.y(titleYMove).y(0, 0.4));
		yield* waitFor(0.3);
	}

	yield* waitFor(0.1);
});
//
