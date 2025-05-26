import { Img, Layout, makeScene2D, Rect } from '@motion-canvas/2d';
import {
	all,
	chain,
	createRef,
	easeInQuad,
	easeInOutQuad,
	easeOutQuad,
	makeRef,
	map,
	range,
	sequence,
	tween,
	waitFor,
	easeInOutCubic,
} from '@motion-canvas/core';
import { Background } from '~/components/Background';
import { Credits } from '~/components/Credits';
import { createGradient, getViewportData, positionItemInRow } from '~/util';

import enemyFrame1 from '~/assets/kenney_jumper-pack/PNG/Enemies/wingMan1.png';
import enemyFrame2 from '~/assets/kenney_jumper-pack/PNG/Enemies/wingMan2.png';
import enemyFrame3 from '~/assets/kenney_jumper-pack/PNG/Enemies/wingMan3.png';
import enemyFrame4 from '~/assets/kenney_jumper-pack/PNG/Enemies/wingMan4.png';
import enemyFrame5 from '~/assets/kenney_jumper-pack/PNG/Enemies/wingMan5.png';

const waitDur = 0.3;

export default makeScene2D(function* (view) {
	const { landscape, viewW, viewH } = getViewportData(view);

	const bg = createRef<Background>();
	view.add(
		<>
			<Background
				ref={bg}
				view={view}
				fill={createGradient(viewW, viewH)}
				opacity={0.17}
			/>
			<Credits
				title="Sprites"
				author="Kenney (kenney.nl)"
				textAlign="left"
				bottomLeft={bg().bottomLeft}
			/>
			<Credits
				title="Sketch 004"
				author="Bret Hudson"
				textAlign="right"
				bottomRight={bg().bottomRight}
			/>
		</>,
	);

	const frameScale: [number, number] = [1, 0.5];
	const frameTop = landscape ? -300 : -600;

	const getPosition = (
		i: number,
		count: number,
		size: number,
		padding: number,
		crossPos = 0,
	) => {
		const pos = positionItemInRow(i, count, size, padding);
		// const [x, y] = landscape ? [pos, crossPos] : [crossPos, pos];
		const [x, y] = [pos, crossPos];
		return { x, y };
	};

	const enemyFrames = [
		enemyFrame1,
		enemyFrame2,
		enemyFrame3,
		enemyFrame4,
		enemyFrame5,
	].slice(0, landscape ? 5 : 3);

	const frames: Layout[] = [];
	const size = 256;
	const padding = 0;

	const container = createRef<Layout>();
	const outlines: Rect[] = [];

	view.add(
		<Layout ref={container} scale={frameScale[0]}>
			{range(enemyFrames.length).map((index) => {
				const curSize = size;
				const sizeProps = { width: curSize, height: curSize };
				const pos = getPosition(index, enemyFrames.length, curSize, padding);
				return (
					<>
						<Layout ref={makeRef(frames, index)} {...pos}>
							<Rect {...sizeProps} fill="#888" />
							<Img
								src={enemyFrames[index]}
								{...sizeProps}
								zIndex={Math.abs((index - 1) * 2)}
							/>
						</Layout>

						<Rect
							ref={makeRef(outlines, index)}
							{...pos}
							{...sizeProps}
							stroke="white"
							lineWidth={5}
							opacity={0}
							strokeFirst
							zIndex={1}
						/>
					</>
				);
			})}
		</Layout>,
	);

	yield* waitFor(waitDur);

	yield* sequence(
		0.1,
		...outlines.map((outline) => {
			return tween(0.3, (value) => {
				const t = easeInQuad(value);
				outline.opacity(t);
			});
		}),
	);

	yield* waitFor(waitDur);

	yield* all(
		...range(enemyFrames.length).map((index) => {
			const one = tween(0.4, (value) => {
				const t = easeInOutQuad(value);
				const pos = getPosition(index, enemyFrames.length, size, map(0, 32, t));
				frames[index].position(pos);
				outlines[index].position(pos);
			});

			const two = tween(0.6, (value) => {
				// const t = easeInOutQuad(value);
				// const pos = getPosition(index, enemyFrames.length, size, map(0, 32, t));
				// frames[index].position(pos);
				// outlines[index].position(pos);
				const t = easeInOutCubic(value);
				const y = map(0, frameTop, t);
				const scale = map(...frameScale, Math.min(1, t * 1.05));
				container().scale(scale);
				container().position.y(y);
			});

			return chain(one, two);
		}),
	);

	yield* waitFor(waitDur);

	yield* tween(0.5, (value) => {
		const t = easeOutQuad(value);
		container().opacity(1 - t);
	});

	yield* waitFor(waitDur);

	frames.forEach((frame, index) => {
		container().position(0);
		container().scale(frameScale[0]);
		const pos = getPosition(index, enemyFrames.length, size, padding);
		frame.position(pos);
		outlines[index].position(pos);
		outlines[index].opacity(0);
	});

	yield* tween(0.5, (value) => {
		const t = easeOutQuad(value);
		container().opacity(t);
	});

	yield* waitFor(waitDur);
});
