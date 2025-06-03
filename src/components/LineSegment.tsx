import {
	Circle,
	Ray,
	type RayProps,
	moveTo,
	lineTo,
	nodeName,
	resolveCanvasStyle,
	signal,
	initial,
	arc,
} from '@motion-canvas/2d';
import { SignalValue, SimpleSignal, Vector2 } from '@motion-canvas/core';

interface LineSegmentProps extends RayProps {
	startPoint?: SignalValue<boolean>;
	endPoint?: SignalValue<boolean>;
}

@nodeName('LineSegment')
export class LineSegment extends Ray {
	@initial(false)
	@signal()
	public declare readonly startPoint: SimpleSignal<boolean, this>;

	@initial(false)
	@signal()
	public declare readonly endPoint: SimpleSignal<boolean, this>;

	public constructor(props: LineSegmentProps) {
		super(props);
	}

	// below functions pulled from Curve
	protected override drawShape(context: CanvasRenderingContext2D) {
		super.drawShape(context);
		if (this.startPoint() || this.endPoint()) {
			this.drawPoints(context);
		}
	}

	private drawPoints(context: CanvasRenderingContext2D) {
		const { startPoint, startTangent, endPoint, endTangent, arrowSize } =
			this.curveDrawingInfo();
		if (arrowSize < 0.001) {
			return;
		}

		context.save();
		context.beginPath();
		if (this.endPoint()) {
			this.drawPoint(context, endPoint, arrowSize);
		}
		if (this.startPoint()) {
			this.drawPoint(context, startPoint, arrowSize);
		}
		context.fillStyle = resolveCanvasStyle(this.stroke(), context);
		context.closePath();
		context.fill();
		context.restore();
	}

	private drawPoint(
		context: CanvasRenderingContext2D | Path2D,
		center: Vector2,
		arrowSize: number,
	) {
		arc(context, center, arrowSize * 0.5);
		context.closePath();
	}
}
