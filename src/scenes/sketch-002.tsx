import { Layout, makeScene2D, Rect, Txt } from '@motion-canvas/2d';
import {
	all,
	createRef,
	easeInCubic,
	easeInOutCubic,
	easeOutCubic,
	makeRef,
	map,
	range,
	sequence,
	tween,
	waitFor,
} from '@motion-canvas/core';
import { Background } from '~/components/Background';
import { createGradient, positionItemInRow } from '~/util';

const waitDur = 0.3;
const stepDur = 0.5;

interface BoxState {
	scale: number;
	opacity: number;
}

const focus: BoxState = { scale: 1.2, opacity: 1 };
const unfocus: BoxState = { scale: 0.8, opacity: 0.5 };
const reset: BoxState = { scale: 1, opacity: 1 };

function* transitionBox(box: Rect, { scale, opacity }: BoxState) {
	const initScale = box.scale().x;
	const initOpacity = box.opacity();
	yield* tween(stepDur, (value) => {
		box.scale(map(initScale, scale, easeInOutCubic(value)));
		box.opacity(map(initOpacity, opacity, value));
	});
}

function* updateBoxes(boxes: Rect[], index: number) {
	let _focused = index < boxes.length ? focus : reset;
	let _unfocused = index < boxes.length ? unfocus : reset;
	yield* all(
		...boxes.map((box, i) => {
			return transitionBox(box, i === index ? _focused : _unfocused);
		}),
	);
}

export default makeScene2D(function* (view) {
	const [viewW, viewH] = [view.width(), view.height()];

	const landscape = viewW > viewH;

	const bg = createRef<Background>();
	view.add(
		<Background
			ref={bg}
			view={view}
			fill={createGradient(viewW, viewH)}
			opacity={0.17}
		/>,
	);

	const boxes: Rect[] = [];
	const numBoxes = 3;
	const size = 240;
	const padding = 120;

	const offscreenX = -(viewW + size) * 0.5;
	const offscreenY = (viewH + size) * 0.5;

	const getPosition = (
		i: number,
		count: number,
		size: number,
		padding: number,
	) => {
		const x = landscape
			? positionItemInRow(i, count, size, padding)
			: offscreenX;
		const y = landscape
			? offscreenY
			: positionItemInRow(i, count, size, padding);
		return { x, y };
	};

	view.add(
		<Txt
			text="Sketch 002"
			bottomRight={bg().bottomRight}
			padding={[12, 20]}
			fill="#efefef"
		/>,
	);

	view.add(
		<Layout>
			{range(numBoxes).map((index) => (
				<Rect
					ref={makeRef(boxes, index)}
					{...getPosition(index, numBoxes, size, padding)}
					width={size}
					height={size}
					fill={'white'}
					radius={size * 0.1}
				/>
			))}
		</Layout>,
	);

	yield* waitFor(waitDur);

	// Slide rectangles up
	yield* sequence(
		0.15,
		...range(numBoxes).map((index) => {
			return tween(1, (value) => {
				const t = easeOutCubic(value);
				if (landscape) boxes[index].position.y(map(offscreenY, 0, t));
				else boxes[index].position.x(map(offscreenX, 0, t));
			});
		}),
	);

	yield* waitFor(waitDur);

	// Highlight one at a time
	// yield* tween(stepDur, (value) => {
	// 	boxes[0].scale(map(1, 1.2, value));
	// });
	yield* updateBoxes(boxes, 0);
	yield* waitFor(0.6);
	yield* updateBoxes(boxes, 1);
	yield* waitFor(0.6);
	yield* updateBoxes(boxes, 2);
	yield* waitFor(0.6);
	yield* updateBoxes(boxes, 3);
	// focus on each

	yield* waitFor(waitDur);

	// Slide rectangles down
	yield* sequence(
		0.15,
		...range(numBoxes).map((index) => {
			return tween(0.75, (value) => {
				const t = easeInCubic(value);
				if (landscape) boxes[index].position.y(map(0, offscreenY, t));
				else boxes[index].position.x(map(0, -offscreenX, t));
			});
		}),
	);

	yield* waitFor(waitDur);
});
