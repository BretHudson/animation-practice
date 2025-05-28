import { createRef } from '@motion-canvas/core';
import { Background } from '../Background';
import { Layout, Shape, Txt, View2D } from '@motion-canvas/2d';
import { getViewportData } from '~/util';
import { Credits } from '../Credits';
import { AoCTheme } from '~/util/themes';

interface Options {
	sketchId: number;
	year: number;
	day: number;
	part: number;
	wip: boolean;
}

export function addBgCredits(
	view: View2D,
	{ sketchId, year, day, part, wip }: Options,
) {
	const { byOrientation, viewW, viewH } = getViewportData(view);

	const bg = createRef<Background>();

	const fontSize = 48;
	const x = 10;

	view.add(
		<>
			<Background ref={bg} view={view} fill={AoCTheme.background} />
			<Layout
				x={x}
				textAlign="center"
				width={viewW}
				height={viewH}
				layout
				direction="column"
				padding={byOrientation(30, 100)}
			>
				<Txt
					text={`Advent of Code ${year}`}
					fill={AoCTheme.gray}
					fontSize={fontSize}
				/>
				<Txt
					text={`Day ${day} Solution (Part ${part})`}
					fill={AoCTheme.yellow}
					fontSize={fontSize}
				/>
			</Layout>
			<Credits.AoC
				title={`Sketch ${sketchId.toString().padStart(3, '0')}`}
				author="Bret Hudson"
				textAlign="right"
				bottomRight={bg().bottomRight}
				view={view}
			/>
		</>,
	);

	if (wip) {
		view.add(
			<Txt
				text="*WIP*"
				fill={AoCTheme.orange}
				zIndex={100000}
				fontSize={100}
				rotation={byOrientation(-10, -7)}
				topLeft={bg().topLeft}
				padding={byOrientation([70, 30], [260, 0])}
			/>,
		);
	}

	return bg;
}
