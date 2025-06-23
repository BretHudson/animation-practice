import { Layout, makeScene2D, Rect, Txt } from '@motion-canvas/2d';
import {
	all,
	chain,
	createRef,
	createSignal,
	easeOutBack,
	makeRef,
	waitFor,
} from '@motion-canvas/core';
import { useViewport } from '~/hooks/useViewport';

import { TxtPlus } from '~/components/TxtPlus';
import { useWeek5 } from '~/hooks/useWeek5';

const script = `
On Fri_day,
June 2_1st, 20_2_5,
I tra_veled to
New York City,
where I'm going to
be re_si_ding
for the sum_mer.

I'm living in Brook_lyn,
which means_ I'll be
close to
the Re_curse Center,
where I have
seven weeks left at.

I'm be_yond ex_cited
to meet all
my batch_mates,
eat great food,
and explore the city.

I asked some_one
for ad_vice to get
the most_ out of
my time here.

They then asked me,
"What do you want
out of New York?"

I de_cided to an_swer with
"I'm looking for ad_ven_ture"
which led her to
tell_ing me
"Don't say no to any_thing"

So, here's to a sum_mer of "yes"
`;

export default makeScene2D(function* (view) {
	const { byOrientation, portrait } = useViewport();

	const { shared } = useWeek5(
		{ h: 0.0575, v: 0.99, c: 1.7 },
		'Text Animations 5',
		'Seattle → New York',
		'#111a',
	);

	const scale = byOrientation(1, 1 / 1.2);
	shared.fontSize = 96 * scale;

	const lines = script.split('\n');

	let curIndex = 0;
	const setValues = (text: TxtPlus) => {
		const index = txts.indexOf(text);
		const offset = index - curIndex;
		if (offset > 0) {
			text.opacity(0);
			return;
		}
		if (offset !== 0) {
			text.scale(0.8);
		}
		text.y(offset * 108 * scale + 38 * scale);
		const abs = 1 - Math.abs(offset) * 0.5;
		text.opacity(abs);
	};

	const highlight = createRef<Rect>();
	view.add(
		<Rect
			ref={highlight}
			width={100}
			height={30}
			fill="#e7f"
			// zIndex={1000}
			radius={30}
		/>,
	);

	const txtProps = shared;

	const txts: TxtPlus[] = [];
	view.add(
		lines.map((line, i) => (
			<TxtPlus
				key={[line, i].join('-')}
				ref={makeRef(txts, i)}
				text={line.replaceAll('_', '')}
				txtProps={txtProps}
			/>
		)),
	);

	txts.forEach((txt) => {
		const { words } = txt;
		txt.words.forEach((w) => w.scale(0.75));
		words.toReversed().forEach((w, i) => w.zIndex(10 + i * 2));
	});

	const width = createSignal(0);
	const height = createSignal(0);
	highlight().width(createSignal(() => width() + 12));
	highlight().height(createSignal(() => height() + 12));

	txts.forEach(setValues);
	for (let i = 0; i < txts.length; ++i) {
		// animate each word
		const txt = txts[i];
		const line = lines[i];
		if (line === '') {
			highlight().opacity(0);
			// yield* waitFor(0.2);
		} else {
			highlight().opacity(1);
			const wordStr = line.split(' ');
			const { words } = txt;
			words.forEach((w) => w.opacity(0));
			yield* chain(
				...words.map(function* (_w, index) {
					const w = _w.childAs<Layout>(0);
					// _w.opacity(1);
					const letters = _w.letters.map((l) => l.childAs<Txt>(0));
					console.log(letters);
					letters.forEach((l) => {
						l.fill('white');
						l.stroke('#111');
					});
					highlight().absolutePosition(w.absolutePosition);
					width(w.width);
					height(w.height);

					highlight().zIndex(w.zIndex());
					// highlight().height(w.height);
					const syllables = (wordStr[index].match(/[_\s,]/g)?.length ?? 0) + 1;
					console.log(syllables);
					yield* all(
						_w.opacity(0.5).opacity(1, 0.05),
						_w.scale(1, 0.15, easeOutBack),
						waitFor(syllables * 0.19),
					);
				}),
			);
			if (line.includes('.') || line.endsWith('"')) yield* waitFor(0.4);
			if (line.endsWith('"yes"')) yield* waitFor(0.5);

			yield* waitFor(0.15);
		}
		curIndex += 1;
		txts.forEach(setValues);
	}
});
