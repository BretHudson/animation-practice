import {
	Camera,
	Code,
	Layout,
	lines,
	makeScene2D,
	Rect,
	Txt,
} from '@motion-canvas/2d';
import {
	all,
	chain,
	createRef,
	DEFAULT,
	makeRef,
	sequence,
	waitFor,
} from '@motion-canvas/core';
import { CodeBlock, CodeBlockProps } from '~/components/CodeBlock';

import { File } from '~/components/week/week-007/File';
import { useViewport } from '~/hooks/useViewport';

import { useWeek7 } from '~/hooks/useWeek7';

export default makeScene2D(function* (view) {
	const { portrait, landscape } = useViewport();
	useWeek7();

	const inputJsx = `\
import { foo } from 'foo.ts';
import { bar } from 'bar.js';

export function Input(props) {
	return <input type={props.type} />;
}

export const createInput = () => {
	// ...
}`.replace(/\t/g, ' '.repeat(4));
	const indexJs = `\
import { baz } from 'baz.ts';
import { qux } from 'qux.ts';

export function App() {
	return (
		<Form>
			<Input type="text" />
		</Form>
	);
}`.replace(/\t/g, ' '.repeat(4));

	const codeWidth = 860;
	const padding = 30;
	const shared: CodeBlockProps = {
		offset: 0,
		width: codeWidth,
		codeFontSize: 32,
	};

	const fileNames = ['components/input.jsx', 'index.js'] as const;
	const sources = [inputJsx, indexJs] as const;
	const codeRefs: Code[] = [];
	const jsTxt: Txt[] = [];
	const tsTxt: Txt[] = [];
	const readyTxt: Txt[] = [];

	const camera = createRef<Layout>();
	view.add(
		<Layout ref={camera} layout gap={padding * 2}>
			{sources.map((source, i) => (
				<Layout layout direction="column" gap={20}>
					<File fileName={fileNames[i]} />
					<CodeBlock codeRef={makeRef(codeRefs, i)} code={source} {...shared} />
					<Rect height={20} />
					<Layout justifyContent={'space-around'}>
						<Txt ref={makeRef(jsTxt, i)} text="JS Files: 0" fill="white" />
						<Txt ref={makeRef(tsTxt, i)} text="TS Files: 0" fill="white" />
					</Layout>
					<Rect />
					<Txt
						ref={makeRef(readyTxt, i)}
						text={`Ready for Conversion ${i ? '✅' : '❌'}`}
						fill="white"
						opacity={0}
						width={codeWidth}
						textAlign={'center'}
					/>
				</Layout>
			))}
		</Layout>,
	);

	const camX = -(codeWidth + padding) / 2;
	const cameraPositions = [-camX, camX];
	if (portrait) {
		camera().x(cameraPositions[0]);
	}

	const dur = 0.6;
	function* highlightBlock(code: Code, i: number) {
		const source = sources[i];
		let js = 0,
			ts = 0;

		yield* code.selection(lines(0, 1), dur);
		yield* waitFor(0.3);

		const regex = /'\w+\.\w+'/gi;

		const m = source.match(regex);

		// highlight line 1
		const ranges = code.findAllRanges(regex);
		yield* sequence(
			1,
			...ranges.map(function* (range, ri) {
				console.log(m[ri], m[ri].includes('.js'));
				if (m[ri].includes('.js')) ++js;
				if (m[ri].includes('.ts')) ++ts;
				yield* all(
					jsTxt[i].text(`JS Files: ${js}`, dur),
					tsTxt[i].text(`TS Files: ${ts}`, dur),
					code.selection(range, dur),
				);
			}),
		);
		yield* waitFor(0.3);

		yield* sequence(
			0.4,
			code.selection(DEFAULT, dur),
			readyTxt[i].opacity(1, dur),
		);
	}

	yield* waitFor(0.1);

	yield* chain(
		...codeRefs.map(function* (code, i) {
			const nextIndex = (i + 1) % 2;
			yield* highlightBlock(code, i);
			yield* waitFor(0.3);
			if (portrait) {
				yield* camera().x(cameraPositions[nextIndex], 0.6);
				yield* resetCode(i);
			}
		}),
	);

	function* resetCode(index: number) {
		yield* all(
			jsTxt[index].text('JS Files: 0', 0.6),
			tsTxt[index].text('TS Files: 0', 0.6),
			readyTxt[index].opacity(0, 0.6),
		);
	}

	if (landscape) {
		yield* all(resetCode(0), resetCode(1));
		yield* waitFor(0.3);
	}
});
