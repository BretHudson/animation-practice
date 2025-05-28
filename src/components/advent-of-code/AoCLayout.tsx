import { createRef } from '@motion-canvas/core';
import { Background } from '../Background';
import { Layout, Shape, Txt, View2D } from '@motion-canvas/2d';
import { getViewportData } from '~/util';
import { Credits } from '../Credits';
import { AoCTheme } from '~/util/themes';

export function addBgCredits(
	view: View2D,
	year: number,
	day: number,
	part: number,
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
					fontFamily={AoCTheme.fontFamily}
					fontSize={fontSize}
				/>
				<Txt
					text={`Day ${day} Solution (Part ${part})`}
					fill={AoCTheme.yellow}
					fontFamily={AoCTheme.fontFamily}
					fontSize={fontSize}
				/>
			</Layout>
			<Credits.AoC
				title="Sketch 006"
				author="Bret Hudson"
				textAlign="right"
				bottomRight={bg().bottomRight}
				view={view}
			/>
		</>,
	);

	return bg;
}
