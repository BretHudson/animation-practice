import { SafeArea } from '~/components/SafeArea';
import { Week5Credits } from '~/components/week/week-005/Credits';
import { Week5Title } from '~/components/week/week-005/Title';
import { useViewport } from '~/hooks/useViewport';

import { TxtProps } from '@motion-canvas/2d';
import { Background, type Week5Hue } from '~/components/Background';
import { WGTheme } from '~/util/themes';

export const useWeek5 = (
	hue: Week5Hue,
	title: string,
	subtitle?: string,
	stroke?: string,
) => {
	const { view } = useViewport();
	view.fontFamily('Outfit');

	view.add(Background.Week5(hue));

	view.add(<SafeArea />);

	view.add(
		<>
			<Week5Title title={title} subtitle={subtitle} stroke={stroke} />
			<Week5Credits stroke={stroke} />
		</>,
	);

	const shared: TxtProps = {
		fill: WGTheme.darkBlue,
		stroke: WGTheme.bubbleBg,
		fontSize: 96,
		lineWidth: 10,
		letterSpacing: 4,
		fontFamily: 'Chewy',
		strokeFirst: true,
	};

	return { shared };
};
