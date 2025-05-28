import {
	CanvasStyleSignal,
	canvasStyleSignal,
	initial,
	nodeName,
	Rect,
	RectProps,
	signal,
	Txt,
} from '@motion-canvas/2d';
import {
	all,
	createRef,
	createSignal,
	DEFAULT,
	SignalValue,
	SimpleSignal,
} from '@motion-canvas/core';
import { AoCTheme } from '~/util/themes';

export interface CellProps extends RectProps {
	size: SignalValue<number>;
	value: SignalValue<string>;
	speed?: SignalValue<number | null>;
}

const defaultLineWidth = 5;

const dur = 0.5;

@nodeName('Cell')
export class Cell extends Rect {
	txt = createRef<Txt>();

	@initial(AoCTheme.codeBackground)
	@canvasStyleSignal()
	public declare readonly fill: CanvasStyleSignal<this>;

	@initial(AoCTheme.codeBorder)
	@canvasStyleSignal()
	public declare readonly stroke: CanvasStyleSignal<this>;

	@initial(5)
	@signal()
	public declare readonly lineWidth: SimpleSignal<number, this>;

	@initial(1)
	@signal()
	public declare readonly speed: SimpleSignal<number, this>;

	// @initial('')
	// @signal()
	// public declare readonly value: SimpleSignal<string, this>;

	@initial(AoCTheme.gray)
	@canvasStyleSignal()
	public declare readonly textFill: CanvasStyleSignal<this>;

	public constructor(props: CellProps) {
		super(props);

		this.width(props.size);
		this.height(props.size);

		this.radius(2);

		this.add(
			<Txt
				alignContent="center"
				textAlign="center"
				width={props.size}
				height={props.size}
				ref={this.txt}
				text={props.value}
				fill={this.textFill}
				fontFamily={AoCTheme.fontFamily}
			/>,
		);
	}

	get dur() {
		return dur / this.speed();
	}

	public *validate(valid: boolean) {
		const color = `${valid ? AoCTheme.green : AoCTheme.red}`;
		yield* all(this.stroke(color, this.dur), this.fill(color + '33', this.dur));
	}

	public *select(dur = this.dur) {
		yield* all(
			this.lineWidth(3, dur),
			this.fill(DEFAULT, dur),
			this.stroke(AoCTheme.white, dur),
			this.textFill(AoCTheme.white, dur),
			this.opacity(1, dur),
		);
	}

	public *softSelect(dur = this.dur) {
		yield* all(
			this.lineWidth(3, dur),
			this.fill(DEFAULT, dur),
			this.stroke(AoCTheme.white, dur),
			this.textFill(AoCTheme.white, dur),
			this.opacity(1, dur),
		);
	}

	public *deselect(dur = this.dur) {
		yield* all(
			this.fill(DEFAULT, dur),
			this.stroke(DEFAULT, dur),
			this.opacity(0.5, dur),
			this.textFill(DEFAULT, dur),
		);
		this.save();
	}

	public *reset(dur = this.dur) {
		yield* all(
			this.fill(DEFAULT, dur),
			this.stroke(DEFAULT, dur),
			this.opacity(1, dur),
			this.textFill(DEFAULT, dur),
		);
	}
}
