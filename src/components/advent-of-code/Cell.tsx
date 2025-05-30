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
	Color,
	createRef,
	createSignal,
	DEFAULT,
	SignalValue,
	SimpleSignal,
	tween,
} from '@motion-canvas/core';
import { AoCTheme } from '~/util/themes';

export interface CellProps extends RectProps {
	size: SignalValue<number>;
	value: SignalValue<string>;
	speed?: SignalValue<number | null>;
	initialValue?: number;
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

	public value: SimpleSignal<number>;

	@initial(AoCTheme.gray)
	@canvasStyleSignal()
	public declare readonly textFill: CanvasStyleSignal<this>;

	@initial('')
	@signal()
	public declare readonly text: SimpleSignal<string, this>;

	public initialValue: number;

	public constructor(props: CellProps) {
		super(props);

		this.initialValue = props.initialValue;

		this.value = createSignal<number>(() => {
			const txt = this.txt().text();
			if (txt === '∞') return this.initialValue;
			if (txt === '-∞') return this.initialValue;
			if (txt) return +txt;
			return this.initialValue;
		});

		this.width(props.size);
		this.height(props.size);

		this.radius(2);

		this.text(props.value);

		// handy for this.clone();
		this.removeChildren();

		this.add(
			<Txt
				alignContent="center"
				textAlign="center"
				width={props.size}
				height={props.size}
				ref={this.txt}
				text={this.text}
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

	public *selectText(dur = this.dur) {
		const curFill = new Color(this.fill() as unknown as string);
		yield* all(
			this.fill(DEFAULT, dur),
			// this.textFill(AoCTheme.white, dur),
			this.opacity(1, dur),
			tween(dur, (value) => {
				const scale = value * Math.PI;
				const sin = Math.sin(scale) * 0.3;
				// this.scale(1 + 0.2 * sin);
				this.fill(Color.lerp(curFill, AoCTheme.white, sin));
			}),
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
			this.lineWidth(DEFAULT, dur),
			this.fill(DEFAULT, dur),
			this.stroke(DEFAULT, dur),
			this.opacity(1, dur),
			this.textFill(DEFAULT, dur),
		);
	}

	public updateValue(value: number) {
		let txt = value.toString();
		if (value === Infinity) txt = '∞';
		if (value === -Infinity) txt = '-∞';
		this.text(txt);
	}

	public *updateValueWithTransition(value: number, dur = 0.3) {
		yield* this.txt().opacity(0, dur);
		yield* this.updateValueYield(value);
		yield* this.txt().opacity(1, dur);
	}

	public *updateValueYield(value: number) {
		let txt = value.toString();
		if (value === Infinity) txt = '∞';
		if (value === -Infinity) txt = '-∞';
		yield* this.text(txt, 0);
	}
}
