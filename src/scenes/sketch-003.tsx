import { Layout, makeScene2D, Rect, Txt } from '@motion-canvas/2d';
import { Background } from '../components/Background';
import { createGradient, positionItemInRow, tToRadians } from '../util';
import {
	all,
	createRef,
	easeInOutCubic,
	easeOutCubic,
	makeRef,
	map,
	range,
	tween,
	waitFor,
} from '@motion-canvas/core';

const waitDur = 0.3;

export default makeScene2D(function* (view) {
	const [viewW, viewH] = [view.width(), view.height()];

	const landscape = viewW > viewH;
	const axisX = 'x' as const;
	const axisY = 'y' as const;
	const [axis1, axis2] = landscape ? [axisX, axisY] : [axisY, axisX];

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

	const getPosition = (
		i: number,
		count: number,
		size: number,
		padding: number,
	) => {
		const pos = positionItemInRow(i, count, size, padding);
		const [x, y] = landscape ? [pos, 0] : [0, pos];
		return { x, y };
	};

	view.add(
		<Txt
			text="Sketch 003"
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
					zIndex={Math.abs((index - 1) * 2)}
				/>
			))}
		</Layout>,
	);

	boxes[0].fill('#ffe6e6');
	boxes[0].zIndex(1);
	boxes[1].fill('#e6ffe6');
	boxes[2].fill('#e6e6ff');

	// yield* waitFor(waitDur);

	function animatePair(dir: number) {
		return (index: number, i: number) => {
			const [startPos, endPos] = [i * 2, (1 - i) * 2].map((v) => {
				return getPosition(v, numBoxes, size, padding)[axis1];
			});

			return tween(1, (value) => {
				const mainT = easeInOutCubic(value);
				const sign = dir * (i * 2 - 1);

				boxes[index].position[axis1](map(startPos, endPos, mainT));

				const range = endPos - startPos;
				const t2 = (boxes[index].position[axis1]() - startPos) / range;

				const _t2 = Math.sin(tToRadians(t2 / 2));
				boxes[index].position[axis2](map(0, 200 * sign, _t2));
				boxes[index].rotation(map(0, dir * 90 * 3, mainT));
				// boxes[index].filters.blur(map(0, 5, secondaryT));
			});
		};
	}

	function animateCenter(dir: number) {
		return tween(0.5, (value) => {
			const rotT = easeOutCubic(value);
			const posT = Math.sin(tToRadians(value / 2)) ** 2;
			boxes[1].position.y(map(0, -100, posT));
			boxes[1].rotation(map(0, dir * 90, rotT));
		});
	}

	const pair = [0, 2];

	const dir = landscape ? 1 : -1;

	yield* waitFor(waitDur);
	yield* all(...pair.map(animatePair(dir)));
	yield* waitFor(waitDur);
	yield* animateCenter(1);
	yield* waitFor(waitDur);
	yield* all(...pair.reverse().map(animatePair(-dir)));
	yield* waitFor(waitDur);
	yield* animateCenter(-1);
	yield* waitFor(waitDur);
});
