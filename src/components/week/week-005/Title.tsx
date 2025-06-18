import {
	Layout,
	LayoutProps,
	nodeName,
	Txt,
	useScene2D,
	View2D,
} from '@motion-canvas/2d';
import { getViewportData } from '~/util';

export interface TitleProps extends LayoutProps {
	/** @deprecated - title gets this dynamically */
	view?: View2D;
	title: string;
	subtitle?: string;
	stroke?: string;
}

@nodeName('Week5Title')
export class Week5Title extends Layout {
	public constructor(props: TitleProps) {
		super(props);

		const scene2d = useScene2D();
		const view = scene2d.getView();

		const { title, subtitle, stroke } = props;
		const { byOrientation } = getViewportData(view);

		this.y(-650 * 0.5 - 110);

		this.direction('column');
		this.gap(6);
		// this.offset([0, 0]);
		this.width(view.width);
		// this.height(view.height);
		this.textAlign('center');
		this.justifyContent('center');
		this.alignContent('center');
		this.alignItems('center');
		this.zIndex(100);
		this.top([
			0,
			-view.height() * 0.5 + byOrientation(130, subtitle ? 310 : 290),
		]);
		this.layout(true);

		let yPos = 0;
		const computePosAndSize = (fontSize: number) => {
			const res = {
				y: yPos,
				width: view.width,
				textAlign: 'center',
				fontSize,
				lineHeight: fontSize,
				stroke: stroke ?? '#444',
				lineWidth: 10,
				strokeFirst: true,
			} as const;
			yPos += fontSize * 1.2;
			return res;
		};

		this.add(
			<>
				<Txt
					text={title}
					fill={'#eef'}
					fontWeight={700}
					letterSpacing={-0.8}
					{...computePosAndSize(72)}
				/>
				<Txt
					text={subtitle}
					fill={'#eef'}
					fontWeight={250}
					letterSpacing={1}
					{...computePosAndSize(byOrientation(50, 50))}
				/>
				{/* <Layout
					{...computePosAndSize(byOrientation(60, 50))}
					layout
					alignItems="center"
					justifyContent="center"
				>
					<Txt text="Recreation of " fill={'#eef'} fontWeight={250} />
					<Txt text="Freya Holmér" fill={'#eef'} fontWeight={450} />
					<Txt text="'s animation" fill={'#eef'} fontWeight={250} />
				</Layout> */}
			</>,
		);
	}
}
