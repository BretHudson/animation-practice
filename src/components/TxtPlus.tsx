import {
	initial,
	Layout,
	LayoutProps,
	Node,
	nodeName,
	NodeProps,
	signal,
	Txt,
	TxtProps,
} from '@motion-canvas/2d';
import {
	createRef,
	makeRef,
	SignalValue,
	SimpleSignal,
} from '@motion-canvas/core';

function getSpaceWidth(textProps: TxtProps) {
	const textRef = createRef<Txt>();
	const noSpaceRef = createRef<Txt>();
	<Txt ref={textRef} text="1 1" {...textProps} />;
	<Txt ref={noSpaceRef} text="11" {...textProps} />;
	return textRef().size().x - noSpaceRef().size().x;
}

export interface WordProps extends NodeProps {
	text: SignalValue<string>;
	txtProps?: TxtProps;
}

@nodeName('Word')
export class Word extends Node {
	@initial('')
	@signal()
	public declare readonly text: SimpleSignal<string, this>;

	public letters: Letter[] = [];

	constructor(props: WordProps) {
		super(props);

		const { txtProps } = props;

		const letters = this.text().split('');
		this.add(
			<Layout>
				{letters.map((c, i) => (
					<Letter ref={makeRef(this.letters, i)} text={c} txtProps={txtProps} />
				))}
			</Layout>,
		);
	}
}

export interface LetterProps extends NodeProps {
	text: SignalValue<string>;
	txtProps?: TxtProps;
}

@nodeName('Letter')
export class Letter extends Node {
	constructor(props: LetterProps) {
		super(props);

		const { text, txtProps } = props;

		let width: number | undefined = undefined;
		if (text === ' ') {
			width = getSpaceWidth({});
		}
		this.add(<Txt text={text} width={width} {...txtProps} />);
	}
}

export interface TxtPlusProps extends LayoutProps {
	text: SignalValue<string>;
	wordProps?: WordProps;
	txtProps?: TxtProps;
}

// TODO(bret): We're going to want to do two sets of letters somehow
// one for the stroke, one for the fill
// because right now, each letter overlaps the next, instead of stroking together
// wonder if there's a way to do this in the canvas api...
@nodeName('TxtPlus')
export class TxtPlus extends Layout {
	@initial('')
	@signal()
	public declare readonly text: SimpleSignal<string, this>;

	public words: Word[] = [];
	public spaces: Letter[] = [];
	public get letters(): Letter[] {
		return this.words
			.flatMap((w, i) => [...w.letters, this.spaces[i]])
			.filter(Boolean);
	}

	constructor(props: TxtPlusProps) {
		super(props);

		const { txtProps, wordProps } = props;

		const words = this.text().split(' ');

		this.layout(true);
		// this.offset([0, -1]);

		this.add(
			<Layout>
				{...words.map((word, i, arr) => {
					const elem = (
						<Word
							// layout
							// alignItems={'center'}
							ref={makeRef(this.words, i)}
							{...wordProps}
							txtProps={txtProps}
							text={word}
						/>
					);
					if (i === arr.length - 1) return elem;
					return [
						elem,
						<Letter
							text=" "
							ref={makeRef(this.spaces, i)}
							txtProps={txtProps}
						/>,
					];
				})}
			</Layout>,
		);
	}
}
