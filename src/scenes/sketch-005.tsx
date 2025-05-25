// NOTE(bret): Continued from sketch-004

import { makeScene2D, Txt, View2D } from '@motion-canvas/2d';
import { Background } from '../components/Background';
import {
	allMap,
	chainWithWait,
	createGradient,
	getViewportData,
	repeat,
} from '../util';
import {
	all,
	chain,
	createRef,
	easeInOutQuad,
	easeOutQuad,
	makeRef,
	map,
	range,
	sequence,
	tween,
	waitFor,
	easeInOutCubic,
	ThreadGenerator,
	createSignal,
	DEFAULT,
} from '@motion-canvas/core';

import enemyFrame1 from '../assets/kenney_jumper-pack/PNG/Enemies/wingMan1.png';
import enemyFrame2 from '../assets/kenney_jumper-pack/PNG/Enemies/wingMan2.png';
import enemyFrame3 from '../assets/kenney_jumper-pack/PNG/Enemies/wingMan3.png';
import enemyFrame4 from '../assets/kenney_jumper-pack/PNG/Enemies/wingMan4.png';
import enemyFrame5 from '../assets/kenney_jumper-pack/PNG/Enemies/wingMan5.png';
import { Credits } from '../components/Credits';
import { Frame } from '../components/sketch/005/Frame';
import { FramesLayout } from '../components/sketch/005/FramesLayout';

const waitDur = 0.3;

function addBgCredits(view: View2D, title: string) {
	const { portrait, viewW, viewH, byOrientation } = getViewportData(view);

	const bg = createRef<Background>();

	let titleStr = title;
	if (portrait) titleStr = titleStr.toUpperCase();

	view.add(
		<>
			<Background
				ref={bg}
				view={view}
				fill={createGradient(viewW, viewH)}
				opacity={0.17}
			/>
			<Txt
				text={titleStr}
				fill="#eeb"
				y={byOrientation(240, -500)}
				fontSize={byOrientation(64, 54)}
				fontStyle={byOrientation('italic', undefined)}
				fontWeight={byOrientation(400, 700)}
			/>
			<Credits
				title="Sprites"
				author="Kenney (kenney.nl)"
				textAlign="left"
				bottomLeft={bg().bottomLeft}
			/>
			<Credits
				title="Sketch 005"
				author="Bret Hudson"
				textAlign="right"
				bottomRight={bg().bottomRight}
			/>
		</>,
	);
}

export default makeScene2D(function* (view) {
	const { byOrientation } = getViewportData(view);

	addBgCredits(view, 'Animating Spritesheets');

	const enemyFrames = [
		enemyFrame1,
		enemyFrame2,
		enemyFrame3,
		enemyFrame4,
		enemyFrame5,
	].slice(0, byOrientation(5, 3));

	const n = enemyFrames.length - 1;
	const animationFrames = [...range(n), ...range(n).map((i) => n - i)];

	const frames: Frame[] = [];

	const container = createRef<FramesLayout>();
	const preview = createRef<Frame>();

	const curFrame = createSignal(0);
	const curFrameSrc = createSignal(() => enemyFrames[curFrame()]);

	view.add(
		<FramesLayout ref={container} frameSize={Frame.initialSize}>
			{range(enemyFrames.length).map((index) => (
				<Frame
					x={createSignal(() => container().getPosition(index))}
					src={enemyFrames[index]}
					ref={makeRef(frames, index)}
					zIndex={Math.abs((index - 1) * 2)}
				/>
			))}
		</FramesLayout>,
	);

	view.add(
		<Frame
			ref={preview}
			width={Frame.initialSize}
			height={Frame.initialSize}
			src={curFrameSrc}
			opacity={0}
		/>,
	);

	function* fadeOut() {
		yield* allMap([container, preview], (item) => {
			return item().opacity(0, 0.5, easeOutQuad);
		});
	}

	function* reset() {
		container().position(DEFAULT);
		container().scale(DEFAULT);
		container().spacing(DEFAULT);
		frames.forEach((frame) => {
			frame.outlineOpacity(DEFAULT);
			frame.opacity(DEFAULT);
		});
	}

	function* fadeIn() {
		yield* container().opacity(1, 0.5, easeOutQuad);
	}

	function* highlightFrame(index?: number, duration = 0.08) {
		curFrame(index || 0);
		yield* container().highlightFrame(index, duration);
	}

	function* animate(iterations: number, delay: number) {
		yield* repeat(iterations, () =>
			sequence(delay, ...animationFrames.map((index) => highlightFrame(index))),
		);
	}

	yield* chainWithWait(
		waitDur,
		container().showOutlines(),
		container().splitFrames(),
		container().transitionToTop(),
		all(highlightFrame(0, 0.3), preview().opacity(1, 0.3)),
		chain(
			animate(1, 0.5),
			animate(1, 0.25),
			animate(3, 0.1),
			highlightFrame(0),
		),
		chain(fadeOut(), reset()),
		fadeIn(),
	);
});
