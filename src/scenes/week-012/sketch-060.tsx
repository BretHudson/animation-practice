import { Img, Layout, makeScene2D, Node, Rect, Txt } from '@motion-canvas/2d';
import {
	all,
	chain,
	Color,
	createEffect,
	createRef,
	createSignal,
	easeOutBack,
	easeOutQuad,
	makeRef,
	map,
	spawn,
	useRandom,
	Vector2,
	waitFor,
} from '@motion-canvas/core';
import { getViewportData, positionItemInRow } from '~/util';

import { useWeek7 } from '~/hooks/useWeek7';
import { WGTheme } from '~/util/themes';

import thumbnail from '../../assets/sketch-060/thumbnail.png';

// These are YouTube Shorts URLs
const thumbnails = [
	'vhHzzil4A6g',
	'EmrtdPftfJ8',
	'OjT8l29iBtg',
	'1cEB27KV5Vg',
	'nkG-4k86Wuc',
	'88HmgLOEUaw',
	'TuWoeKLyYq0',
	'JMmLXFJOn08',
	'X7Cciwwud74',
	'CIfctHm253Q',
	'WKbJumWdOok',
	'FWCXjZwfvKM',
	'KI6gOjxluE8',
	'DX766nN4PVE',
	'B2jLkbXHyJA',
	'unj_0z-UNHo',
	'5GWJc45hwbU',
	'PPYoVqRxNKI',
	'SYpbjdN6-mc',
	'eiva7obxnT8',
	'cvI2x0DlHbY',
	'gvVezGkpneA',
	'Qr-qkgjDY5E',
	'88aIPB1B0ew',
	'MAdA-RYbFV0',
	'fBLqCGDYlGA',
	'zcJ-GBbYF3w',
	'mMud8eu3bCU',
	'd9q4Yf06uj0',
	'NYQYRzNBf7I',
	'RRXHUNAJkJo',
	'g4MkassrKZY',
	'oN3QTNd6xjo',
	'J5r76iOg7mw',
	'SE3dwlzSJoA',
	'cw-QEPkipPo',
	'--2wr_iPfmM',
	'cHopvRRIzfo',
	'H1W3PEPcUfE',
	'oL6vDSJYgIk',
	'r_AHNQjR9nc',
	'0EjfH6nEkfc',
	'vg5FHe8QHo8',
	'OrvcruusPNs',
	'6YmtASe7UGo',
	'7vlgmRt5Odo',
	'0ei5mDykNbE',
	'D57f6YfJuRg',
	'n5DHzJaK4ZM',
	'Cc7lflm10MU',
	't5RM5EYBLr4',
	'LjMEYAkvlV4',
	'ebf6kmla7ys',
	'gREoq1sE1hg',
	'N9ElmQpbewc',
	'KPcxufyiAO0',
	'o2BXdqX5AVk',
	'jA61uX9uJB0',
	'HgxVzSmJdv8',
]
	.map((id) => `https://i.ytimg.com/vi/${id}/oar2.jpg`)
	.reverse()
	.concat([thumbnail]);

export default makeScene2D(function* (view) {
	const { portrait } = getViewportData(view);

	const random = useRandom();

	const { bg } = useWeek7();

	const color1 = new Color('#231a36ff');
	const color2 = new Color('#553766ff');

	const dayRaw = createSignal(0);
	const day = createSignal(() => {
		return Math.round(dayRaw() + 0.2);
	});
	const scale = createSignal(() => {
		const d = dayRaw();
		const fract = d - Math.floor(d);
		const f = Math.max(0, map(-1, 1, fract));
		const s = map(0 * Math.PI, 1 * Math.PI, f);
		return 1 + Math.sin(s) * 0.15;
	});

	bg().fill(() => {
		const t = dayRaw() / 60;
		return Color.lerp(color1, color2, t);
	});

	const cols = 12;
	const rows = 5;
	const cellW = 120;
	const cellH = 120;
	const cellSize = new Vector2(cellW, cellH);
	const pad = 25;

	const grid = createRef<Layout>();
	view.add(<Layout ref={grid} />);

	let i = 0;
	const borders: Rect[] = [];
	const rects: Rect[] = [];
	const imgs: Rect[] = [];
	for (let col = 0; col < cols; ++col) {
		for (let row = 0; row < rows; ++row) {
			let x = positionItemInRow(col, cols, cellW, pad);
			let y = positionItemInRow(row, rows, cellH, pad);
			if (portrait) [x, y] = [y, x];

			const id = i++;
			grid().add(
				<>
					<Rect
						ref={makeRef(borders, id)}
						x={x}
						y={y}
						radius={15}
						size={cellSize}
						stroke="white"
						lineWidth={5}
						opacity={random.nextFloat(0.4, 0.55)}
						zIndex={99}
					/>
					<Node cache x={x} y={y}>
						<Img
							ref={makeRef(imgs, id)}
							src={thumbnails[id]}
							width={cellSize.y}
						/>
						<Rect
							ref={makeRef(rects, id)}
							radius={15}
							size={cellSize}
							fill="white"
							compositeOperation={'destination-in'}
						/>
					</Node>
				</>,
			);
		}
	}

	const txt = createRef<Txt>();
	view.add(
		<Txt
			ref={txt}
			text={() => day().toString()}
			fontSize={600}
			fill="white"
			stroke={bg().fill()}
			lineWidth={pad * 1.5}
			strokeFirst
			// fontFamily="Outfit"
			fontFamily="Courier Prime"
			fontWeight={700}
			letterSpacing={-40}
			paddingRight={40}
			y={40}
			scale={scale}
			opacity={0.7}
		/>,
	);

	for (let i = 0; i < 60; ++i) {
		borders[i].scale(() => map(0, 1, Math.max(0.8, rects[i].scale().x)));
		borders[i].rotation(() => {
			const r = rects[i].rotation();
			return Math.sign(r) * Math.min(3, Math.abs(r));
		});
	}

	rects.forEach((r) => r.opacity(0));
	imgs.forEach((r) => r.opacity(0));

	createEffect(() => {
		const getDay = day();
		if (getDay.toString() === txt().text()) return;

		if (day() > 0) {
			const id = day() - 1;
			const rect = rects[id];
			const img = imgs[id];
			let angle = random.nextInt(30, 40);
			if (random.nextFloat(0, 1) > 0.5) angle *= -1;
			img.rotation(rect.rotation);
			img.scale(rect.scale);
			img.opacity(rect.opacity);
			spawn(
				all(
					rect.rotation(angle).rotation(0, 0.5, easeOutBack),
					rect.scale(0).scale(1, 0.5, easeOutBack),
					rect.opacity(1, 0.1),
				),
			);
		}
	});

	yield* waitFor(0.5);
	yield* dayRaw(60, 6, easeOutQuad);
	yield* waitFor(1);
	const zoomDur = 0.5;
	yield* all(
		txt().scale(1.75, zoomDur * 1.2),
		txt().opacity(0, zoomDur * 1.2),
		grid().scale(1.5, zoomDur),
		grid().opacity(0, zoomDur),
		bg().fill(color1, zoomDur * 1.4),
	);
	yield* waitFor(1);

	day(0);
	rects.forEach((r) => r.opacity(0));
	imgs.forEach((r) => r.opacity(0));

	yield* all(
		txt().scale(0.75).scale(1, zoomDur),
		txt().opacity(1, zoomDur),
		chain(
			waitFor(0.1),
			all(
				grid()
					.scale(0.8)
					.scale(1, zoomDur * 1.1),
				grid().opacity(1, zoomDur * 1.1),
			),
		),
	);
	yield* waitFor(0.5);
});
