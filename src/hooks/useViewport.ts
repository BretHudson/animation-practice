import { useScene2D } from '@motion-canvas/2d';

export function useViewport() {
	const scene2d = useScene2D();
	const view = scene2d.getView();

	const [viewW, viewH] = [view.width, view.height];
	const landscape = viewW >= viewH;
	const axisX = 'x' as const;
	const axisY = 'y' as const;
	const axes = landscape
		? ([axisX, axisY] as const)
		: ([axisY, axisX] as const);
	const [primaryAxis, crossAxis] = axes;
	const byOrientation = <T>(primary: T, cross: T): T => {
		return landscape ? primary : cross;
	};

	return {
		landscape,
		portrait: !landscape,
		view,
		viewW,
		viewH,
		axes,
		primaryAxis,
		crossAxis,
		byOrientation,
	};
}
