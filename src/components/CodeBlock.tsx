import {
	canvasStyleSignal,
	CanvasStyleSignal,
	Code,
	codeSignal,
	CodeSignal,
	compound,
	defaultStyle,
	initial,
	LayoutMode,
	nodeName,
	PossibleCodeScope,
	Rect,
	RectProps,
	signal,
	vector2Signal,
	wrapper,
} from '@motion-canvas/2d';
import {
	createRef,
	createSignal,
	PossibleSpacing,
	ReferenceReceiver,
	SignalValue,
	SimpleSignal,
	Spacing,
	SpacingSignal,
	Vector2Signal,
} from '@motion-canvas/core';

// NOTE(bret): Motion Canvas doesn't export this - is that intentional?
export function spacingSignal(prefix?: string): PropertyDecorator {
	return (target, key) => {
		compound({
			top: prefix ? `${prefix}Top` : 'top',
			right: prefix ? `${prefix}Right` : 'right',
			bottom: prefix ? `${prefix}Bottom` : 'bottom',
			left: prefix ? `${prefix}Left` : 'left',
		})(target, key);
		wrapper(Spacing)(target, key);
	};
}

export interface CodeBlockProps extends RectProps {
	codeRef?: ReferenceReceiver<Code>;
	codeFontSize?: SignalValue<number>;
	code?: SignalValue<PossibleCodeScope>;
}

@nodeName('CodeBlock')
export class CodeBlock extends Rect {
	@initial('#1a1a1a')
	@canvasStyleSignal()
	public declare readonly fill: CanvasStyleSignal<this>;

	@initial('#889')
	@canvasStyleSignal()
	public declare readonly stroke: CanvasStyleSignal<this>;

	public static initialPadding: PossibleSpacing = [24, 24];
	@initial(CodeBlock.initialPadding)
	@spacingSignal('padding')
	public declare readonly padding: SpacingSignal<this>;

	@initial(8)
	@spacingSignal('radius')
	public declare readonly radius: SpacingSignal<this>;

	@initial(2)
	@signal()
	public declare readonly lineWidth: SimpleSignal<number, this>;

	@initial([0, -1])
	@vector2Signal('offset')
	public declare readonly offset: Vector2Signal<this>;

	@initial(true)
	@signal()
	public declare readonly layout: SimpleSignal<LayoutMode, this>;

	// @ts-ignore -- this is copy/pasted from Motion Canvas source
	@defaultStyle('font-size', parseFloat)
	@signal()
	public declare readonly codeFontSize: SimpleSignal<number, this>;

	@codeSignal()
	public declare readonly code: CodeSignal<this>;

	constructor(props: CodeBlockProps) {
		super(props);

		this.add(
			<Code
				ref={props.codeRef}
				fontSize={props.codeFontSize}
				code={this.code}
			/>,
		);
	}
}

export const createCodeBlock = (
	width: number,
	codeFontSize?: SimpleSignal<number> | number,
) => {
	const code = createRef<Code>();
	if (typeof codeFontSize === 'number') {
		const fontSize = codeFontSize;
		codeFontSize = createSignal(() => fontSize);
	}
	const codeBlock = (
		<CodeBlock codeRef={code} width={width} codeFontSize={codeFontSize} />
	) as CodeBlock;

	return { codeBlock, code };
};
