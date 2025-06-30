import { SafeArea } from '~/components/SafeArea';
import { Week7Credits } from '~/components/week/week-007/Credits';
import { useViewport } from '~/hooks/useViewport';

import { Background } from '~/components/Background';
import { createRef } from '@motion-canvas/core';

export const useWeek7 = () => {
	const { view } = useViewport();
	view.fontFamily('Outfit');

	const bg = Background.Week7();
	const credits = createRef<Week7Credits>();

	view.add(bg());

	if (false as boolean) view.add(<SafeArea />);

	view.add(<Week7Credits />);

	bg().fill('rgb(33,36,42)');

	return { bg, credits };
};
