import {
	ComponentChildren,
	initial,
	Layout,
	LayoutProps,
	Node,
	nodeName,
	signal,
} from '@motion-canvas/2d';
import {
	all,
	chain,
	createSignal,
	easeInOutCubic,
	easeInOutQuad,
	map,
	sequence,
	SignalValue,
	SimpleSignal,
	ThreadGenerator,
	tween,
	waitFor,
} from '@motion-canvas/core';
import type { Frame } from './Frame';
import { allMap, positionItemInRow } from '../../../util';

interface FramesLayoutProps extends LayoutProps {
	frameSize: SignalValue<number>;
}

@nodeName('FramesLayout')
export class FramesLayout extends Layout {
	@signal()
	public declare readonly frameSize: SimpleSignal<number, this>;

	@initial(0)
	@signal()
	public declare readonly spacing: SimpleSignal<number, this>;

	public get frames() {
		return this.childrenAs<Frame>();
	}

	public constructor(props: FramesLayoutProps) {
		super(props);
	}

	public getPosition(index: number) {
		return positionItemInRow(
			index,
			this.frames.length,
			this.frameSize(),
			this.spacing(),
		);
	}

	public animateFrames(callback: (frame: Frame) => ThreadGenerator) {
		return this.frames.map(callback);
	}

	public showOutlines() {
		return sequence(0.1, ...this.animateFrames((frame) => frame.showOutline()));
	}

	public splitFrames() {
		return this.spacing(32, 0.4, easeInOutQuad);
	}

	public *transitionToTop() {
		yield* all(
			this.scale(0.5, 0.6, easeInOutCubic),
			this.position.y(-300, 0.6, easeInOutCubic),
		);
	}

	public *highlightFrame(index?: number, duration?: number) {
		yield* allMap(this.frames, (frame) => frame.highlight(index, duration));
	}
}
