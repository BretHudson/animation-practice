import {
	CanvasStyleSignal,
	canvasStyleSignal,
	initial,
	Layout,
	LayoutProps,
	PossibleCanvasStyle,
	Ray,
	Txt,
} from '@motion-canvas/2d';
import { SignalValue } from '@motion-canvas/core';

export interface LabelledRayProps extends LayoutProps {
	label: SignalValue<string>;
	flipped?: SignalValue<boolean>;
	lineColor?: SignalValue<PossibleCanvasStyle>;
	textColor?: SignalValue<PossibleCanvasStyle>;
}

export class LabelledRay extends Layout {
	@initial('#bbc')
	@canvasStyleSignal()
	public declare readonly lineColor: CanvasStyleSignal<this>;

	@initial('#bbc')
	@canvasStyleSignal()
	public declare readonly textColor: CanvasStyleSignal<this>;

	constructor(props: LabelledRayProps) {
		super(props);

		const { label, flipped } = props;

		const dir = flipped ? -1 : 1;
		const height = 96 * dir;

		this.add(
			<>
				<Ray
					from={[0, height]}
					stroke={this.lineColor}
					lineWidth={3}
					endOffset={12}
					endArrow
				/>
				<Txt text={label} y={height} fill={this.textColor} offset={[0, -dir]} />
			</>,
		);
	}
}
