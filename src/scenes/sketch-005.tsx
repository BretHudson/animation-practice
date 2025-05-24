// NOTE(bret): Continued from sketch-004

import {
	Img,
	Layout,
	LayoutProps,
	makeScene2D,
	Node,
	nodeName,
	NodeProps,
	Rect,
	signal,
	Txt,
} from '@motion-canvas/2d';
import { Background } from '../components/Background';
import {
	allMap,
	createGradient,
	getViewportData,
	positionItemInRow,
	repeat,
} from '../util';
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
	SignalValue,
	SimpleSignal,
} from '@motion-canvas/core';

import enemyFrame1 from '../assets/kenney_jumper-pack/PNG/Enemies/wingMan1.png';
import enemyFrame2 from '../assets/kenney_jumper-pack/PNG/Enemies/wingMan2.png';
import enemyFrame3 from '../assets/kenney_jumper-pack/PNG/Enemies/wingMan3.png';
import enemyFrame4 from '../assets/kenney_jumper-pack/PNG/Enemies/wingMan4.png';
import enemyFrame5 from '../assets/kenney_jumper-pack/PNG/Enemies/wingMan5.png';
import { Credits } from '../components/Credits';

const waitDur = 0.3;

interface FrameProps extends LayoutProps {
	src?: SignalValue<string | null>;
	outlineOpacity?: SignalValue<number | null>;
}

@nodeName('Frame')
class Frame extends Layout {
	@signal()
	public declare readonly src: SimpleSignal<string, this>;

	@signal()
	public declare readonly outlineOpacity: SimpleSignal<number, this>;

	public img = createRef<Img>();

	public constructor(props: FrameProps) {
		super(props);

		this.outlineOpacity(0);

		const img = <Img ref={this.img} src={this.src} />;

		this.add(
			<Layout>
				<Rect width={this.img().width} height={this.img().height} fill="#888" />
				{img}
			</Layout>,
		);
		this.add(
			<Rect
				width={this.img().width}
				height={this.img().height}
				stroke="white"
				lineWidth={5}
				opacity={this.outlineOpacity}
				strokeFirst
				zIndex={1}
			/>,
		);
	}

	protected override applyFlex() {
		super.applyFlex();
	}
}

export default makeScene2D(function* (view) {
	const { portrait, viewW, viewH, byOrientation } = getViewportData(view);

	const bg = createRef<Background>();

	let titleStr = 'Animating Spritesheets';
	if (portrait) {
		titleStr = titleStr.toUpperCase();
	}

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

	const getPosition = (
		i: number,
		count: number,
		size: number,
		padding: number,
		crossPos = 0,
	) => {
		const pos = positionItemInRow(i, count, size, padding);
		const [x, y] = [pos, crossPos];
		return { x, y };
	};

	const enemyFrames = [
		enemyFrame1,
		enemyFrame2,
		enemyFrame3,
		enemyFrame4,
		enemyFrame5,
	].slice(0, byOrientation(5, 3));

	const frames: Frame[] = [];
	const size = 256;
	const padding = 0;

	const container = createRef<Layout>();

	const preview = createRef<Frame>();

	view.add(
		<Layout ref={container}>
			{range(enemyFrames.length).map((index) => {
				const curSize = size;
				const sizeProps = { width: curSize, height: curSize };
				const pos = getPosition(index, enemyFrames.length, curSize, padding);
				return (
					<Frame
						{...pos}
						{...sizeProps}
						src={enemyFrames[index]}
						ref={makeRef(frames, index)}
						zIndex={Math.abs((index - 1) * 2)}
					/>
				);
			})}
		</Layout>,
	);

	view.add(
		<Frame
			ref={preview}
			width={size}
			height={size}
			src={enemyFrame1}
			opacity={0}
		/>,
	);

	function* reset() {
		yield* allMap([container, preview], (item) => {
			return item().opacity(0, 0.5, easeOutQuad);
		});

		yield* waitFor(waitDur);

		frames.forEach((frame, index) => {
			container().position(0);
			container().scale(1);
			const pos = getPosition(index, enemyFrames.length, size, padding);
			frame.position(pos);
			frame.outlineOpacity(0);
			frame.opacity(1);
		});

		yield* container().opacity(1, 0.5, easeOutQuad);
	}

	function* highlightFrame(index?: number, duration = 0.08) {
		const unfocus = index !== undefined ? 0.5 : 1;
		preview().src(enemyFrames[index ?? 0]);
		yield* allMap(frames, (frame, i) => {
			const newV = +(index === i) || unfocus;
			return frame.opacity(newV, duration);
		});
	}

	// actual animation begins here
	yield* waitFor(waitDur);

	yield* sequence(
		0.1,
		allMap(frames, (frame) => frame.outlineOpacity(1, 0.3, easeInQuad)),
	);

	yield* waitFor(waitDur);

	yield* allMap(range(enemyFrames.length), (index) => {
		const splitIntoFrames = tween(0.4, (value) => {
			const t = easeInOutQuad(value);
			const pos = getPosition(index, enemyFrames.length, size, map(0, 32, t));
			frames[index].position(pos);
		});

		const transitionToTop = all(
			container().scale(0.5, 0.6, easeInOutCubic),
			container().position.y(-300, 0.6, easeInOutCubic),
		);

		return chain(splitIntoFrames, waitFor(waitDur), transitionToTop);
	});

	yield* waitFor(waitDur);

	yield* all(highlightFrame(0, 0.3), preview().opacity(1, 0.3));

	yield* waitFor(waitDur);

	const n = frames.length - 1;
	const animationFrames = [...range(n), ...range(n).map((i) => n - i)];
	function* animate(iterations: number, delay: number) {
		yield* repeat(iterations, () =>
			sequence(delay, ...animationFrames.map((index) => highlightFrame(index))),
		);
	}

	yield* chain(animate(1, 0.5), animate(1, 0.25), animate(3, 0.1));

	yield* highlightFrame(0);

	yield* chain(waitFor(waitDur), reset(), waitFor(waitDur));
});
