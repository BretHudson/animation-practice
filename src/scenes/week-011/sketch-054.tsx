import {
	Camera,
	Grid,
	Img,
	Layout,
	makeScene2D,
	Rect,
	Txt,
} from '@motion-canvas/2d';
import {
	all,
	Color,
	createRef,
	createSignal,
	easeInBounce,
	easeInOutBounce,
	easeInOutCubic,
	easeInOutQuad,
	linear,
	useRandom,
	Vector2,
	waitFor,
} from '@motion-canvas/core';
import { TxtPlus } from '~/components/TxtPlus';

import { useWeek7 } from '~/hooks/useWeek7';
import { positionItemInRow, useDimensions } from '~/util';
import { WGTheme } from '~/util/themes';

const bgColor = new Color('#4411de');
const textColor = new Color(WGTheme.bubbleBg);

// const canvas = document.createElement('canvas');
// const ctx = canvas.getContext('2d');
// if (!ctx) throw new Error('bad day');

export default makeScene2D(function* (view) {
	const { viewW, viewH, portrait } = useDimensions();

	const { bg, credits } = useWeek7(undefined, '#111', 5);
	bg().fill(bgColor);

	credits().sketchTxt().fill(textColor);
	credits().authorTxt().fill(textColor);
	credits().authorTxt().stroke('#111');
	credits().authorTxt().lineWidth(5);
	credits().authorTxt().strokeFirst(true);

	const gridRaw = `\
################################
#.@.#........##....####........#
#...##....##.##.##....#.##.....#
#......##..#..#..#.##.#..###.###
#.#...##..########.#..........##
#.#######.....####.#......##...#
#.#...........#....#.###.##....#
#...####.####...#.#..#.#.......#
#.#....#....#####.#.##.....###.#
#.####.#.....#....#.####.......#
#...#..####..#.####....#.......#
#...#.##..####.#..##.#.#...##..#
#...#.#X.#...#.##.#....######..#
#.#...#..#.#.#....#.#.##..#.#..#
#...####...#.######...#...###..#
#...#...####......#####........#
##....#....#...##...........####
################################
`;

	const transpose = (arr: string[][]) =>
		arr[0].map((_, colIndex) => arr.map((row) => row[colIndex]));

	let grid = gridRaw
		.trim()
		.split('\n', Number.MAX_SAFE_INTEGER)
		.map((v) => v.split(''));
	let gridW = grid[0].length;
	let gridH = grid.length;
	if (portrait) {
		const _grid = gridRaw
			.trim()
			.split('\n', Number.MAX_SAFE_INTEGER)
			.map((v) => v.split('').toReversed());
		grid = transpose(_grid);
		gridW = grid[0].length;
		gridH = grid.length;
	}

	const gridContainer = createRef<Layout>();
	view.add(<Layout ref={gridContainer} />);

	const COLORS = {
		EMPTY: WGTheme.bubbleFg,
		WALL: WGTheme.bubbleBg,
		AGENT: WGTheme.blue,
		GOAL: '#de2244',
	};

	const cellW = viewW / gridW;
	const cellH = viewH / gridH;
	const pad = 0;

	const getGridPos = (x: number, y: number) => {
		return new Vector2(
			positionItemInRow(x, gridW, cellH, pad),
			positionItemInRow(y, gridH, cellH, pad),
		);
	};

	let start: Vector2;
	let end: Vector2;
	for (let y = 0; y < gridH; ++y) {
		for (let x = 0; x < gridW; ++x) {
			const val = grid[y][x];
			let color = COLORS.EMPTY;
			switch (val) {
				case '#':
					color = COLORS.WALL;
					break;
				case '@':
					start = new Vector2(x, y);
					break;
				case 'X':
					end = new Vector2(x, y);
					break;
			}

			gridContainer().add(
				<Rect position={getGridPos(x, y)} size={[cellW, cellH]} fill={color} />,
			);
		}
	}

	const gridStroke = new Color(WGTheme.bubbleBg).alpha(0.5);
	const cellSize = new Vector2(cellW, cellH);
	view.add(
		<Grid
			spacing={cellSize}
			width={'100%'}
			height={'100%'}
			stroke={gridStroke}
			start={0}
			end={1}
		/>,
	);

	view.add(
		<Rect
			position={getGridPos(start.x, start.y)}
			size={cellSize}
			fill={COLORS.AGENT}
			stroke={WGTheme.bubbleBg}
			lineWidth={5}
			zIndex={100}
		/>,
	);

	view.add(
		<Rect
			position={getGridPos(end.x, end.y)}
			size={cellSize}
			fill={COLORS.GOAL}
			stroke={WGTheme.bubbleBg}
			lineWidth={5}
			zIndex={100}
		/>,
	);

	const visited = new Set();
	type QueueItem = [Vector2, number];
	const queue: QueueItem[] = [];
	queue.push([start, 0]);

	const directions = [Vector2.left, Vector2.up, Vector2.right, Vector2.down];

	const baseColor = new Color(WGTheme.yellow);
	const hue = baseColor.get('lch.h');

	const random = useRandom();

	const curId = createSignal(0);
	const opacity = createSignal(1);
	const totalCells = 292; // this was computed manually
	let i = 0;
	while (queue.length) {
		const [cur, depth] = queue.shift();

		const color = new Color(WGTheme.yellow).set('lch.h', hue - depth);

		if (cur.equals(end)) break;

		const hash = `${cur.x},${cur.y}`;
		if (visited.has(hash)) continue;
		visited.add(hash);

		const id = i++;
		view.add(
			<Rect
				position={getGridPos(cur.x, cur.y)}
				size={cellSize}
				fill={color}
				opacity={() => opacity() * Math.min(1, Math.max(0, curId() - id))}
			/>,
		);

		const toEnqueue = directions
			.map((d) => cur.add(d))
			.filter((p) => {
				const { x, y } = p;
				if (x < 0 || y < 0 || x >= gridW || y >= gridH) {
					return false;
				}

				return grid[y][x] !== '#';
			});

		queue.push(...toEnqueue.map<QueueItem>((p) => [p, depth + 1]));
	}

	yield* waitFor(0.5);
	yield* curId(totalCells, 4, easeInOutQuad);
	yield* waitFor(1);
	yield* opacity(0, 0.7);
	yield* waitFor(0.5);
});
