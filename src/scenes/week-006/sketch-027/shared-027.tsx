import { Txt } from '@motion-canvas/2d';
import { Week6Credits } from '~/components/week/week-006/Credits';
import { Week6Title } from '~/components/week/week-006/Title';
import { useViewport } from '~/hooks/useViewport';
import { useWeek6 } from '~/hooks/useWeek6';
import { WGTheme } from '~/util/themes';

export function initScene(id?: number, bg?: string, stroke?: string) {
	const { byOrientation, view } = useViewport();

	if (bg) view.fill(bg);

	const { shared } = useWeek6('Transitions 2', `Scene ${id}/3`, stroke);

	const scale = byOrientation(1, 1 / 1.2);
	shared.fontSize = 96 * scale;

	const week6Title = view.childAs<Week6Title>(2);
	const week6Credits = view.childAs<Week6Credits>(3);
	week6Title.y(0);
	week6Title.gap(42);
	const [titleTxt, subtitleTxt] = [0, 1].map((i) => week6Title.childAs<Txt>(i));
	titleTxt.fontSize(128);
	titleTxt.y(titleTxt.y() - 40);
	titleTxt.y(-200);
	subtitleTxt.y(subtitleTxt.y() + 40);
	subtitleTxt.fontSize(72);
	subtitleTxt.fill(WGTheme.bubbleFg);
	week6Title.direction('column-reverse');

	week6Title.zIndex(0);
	week6Credits.zIndex(1);

	return { shared, scale };
}
