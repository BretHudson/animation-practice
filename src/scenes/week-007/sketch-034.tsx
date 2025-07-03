import { Layout, makeScene2D, Txt, TxtProps } from '@motion-canvas/2d';
import {
	all,
	chain,
	createRef,
	easeInOutCubic,
	easeOutCubic,
	makeRef,
	sequence,
	waitFor,
} from '@motion-canvas/core';
import { CodeBlockWithTitle } from '~/components/CodeBlockWithTitle';
import { TxtPlus } from '~/components/TxtPlus';

import { useViewport } from '~/hooks/useViewport';

import { useWeek7 } from '~/hooks/useWeek7';
import { WGTheme } from '~/util/themes';

const FILE_NAMES = {
	INDEX: 'index.js',
	COMPONENTS: {
		BUTTON: 'components/button.jsx',
		FORM: 'components/form.jsx',
		INPUT: 'components/input.jsx',
	},
} as const;

type Values<T> = T extends object ? Values<T[keyof T]> : T;
type FileName = Values<typeof FILE_NAMES>;

const map = new Map<FileName, FileName[]>();
map.set(FILE_NAMES.INDEX, [
	FILE_NAMES.COMPONENTS.FORM,
	FILE_NAMES.COMPONENTS.INPUT,
]);
map.set(FILE_NAMES.COMPONENTS.BUTTON, []);
map.set(FILE_NAMES.COMPONENTS.FORM, []);
map.set(FILE_NAMES.COMPONENTS.INPUT, []);

export default makeScene2D(function* (view) {
	const { byOrientation } = useViewport();
	useWeek7();

	const txtProps: TxtProps = {
		fill: 'rgb(33,36,42)',
		fontSize: 96 * byOrientation(3, 1.7),
		fontWeight: 900,
		fontFamily: 'monospace',
		stroke: WGTheme.bubbleBg,
		lineWidth: 0,
	};
	const txtRef = createRef<TxtPlus>();
	view.add(
		<Layout layout direction="column" alignItems="center">
			<Txt
				text="Recreating the fade-in effect popularized by"
				fill={WGTheme.bubbleBg}
				opacity={0.8}
			/>
			<TxtPlus ref={txtRef} text={'3Blue1Brown'} txtProps={txtProps} />
		</Layout>,
	);
	yield* waitFor(0.2);
	yield* sequence(
		0.11,
		...txtRef().letters.map(function* (l) {
			const txt = l.childAs<Txt>(0);
			const full = 1200;
			txt.lineWidth(byOrientation(5, 2.5));
			txt.lineDash([0, full]);
			yield* sequence(
				0.7,
				txt.lineDash(
					[full, full],
					1.5,
					(t) => easeOutCubic(t) * easeInOutCubic(t),
				),
				txt.fill(WGTheme.bubbleBg, 0.5),
			);
		}),
	);
	yield* waitFor(0.5);
	yield* txtRef().opacity(0, 0.5);
	yield* waitFor(0.2);
});
