import {
	Img,
	initial,
	Layout,
	LayoutProps,
	nodeName,
	Rect,
	signal,
} from '@motion-canvas/2d';
import {
	createRef,
	easeInQuad,
	SignalValue,
	SimpleSignal,
} from '@motion-canvas/core';

interface FrameProps extends LayoutProps {
	src?: SignalValue<string | null>;
	outlineOpacity?: SignalValue<number | null>;
}

@nodeName('Frame')
export class Frame extends Layout {
	public static initialSize = 256;

	@signal()
	public declare readonly src: SimpleSignal<string, this>;

	@initial(0)
	@signal()
	public declare readonly outlineOpacity: SimpleSignal<number, this>;

	public img = createRef<Img>();

	public constructor(props: FrameProps) {
		super(props);

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

	public *showOutline() {
		console.log();
		yield* this.outlineOpacity(1, 0.3, easeInQuad);
	}

	get siblings() {
		return this.parent().children();
	}

	get index() {
		return this.siblings.indexOf(this);
	}

	public highlight(curIndex: number, duration: number) {
		const unfocus = curIndex !== undefined ? 0.5 : 1;
		const newV = +(this.index === curIndex) || unfocus;
		return this.opacity(newV, duration);
	}
}
