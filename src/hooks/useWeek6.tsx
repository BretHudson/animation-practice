import { SafeArea } from '~/components/SafeArea';
import { Week6Credits } from '~/components/week/week-006/Credits';
import { Week6Title } from '~/components/week/week-006/Title';
import { useViewport } from '~/hooks/useViewport';

import { TxtProps } from '@motion-canvas/2d';
import { Background } from '~/components/Background';
import { WGTheme } from '~/util/themes';

export const useWeek6 = (title: string, subtitle?: string, stroke?: string) => {
	const { view } = useViewport();
	view.fontFamily('Outfit');

	view.add(Background.Week6());

	view.add(<SafeArea opacity={0} />);

	view.add(
		<>
			<Week6Title title={title} subtitle={subtitle} stroke={stroke} />
			<Week6Credits stroke={stroke} />
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
