import { Layout, LayoutProps, nodeName, Txt } from '@motion-canvas/2d';

export interface CreditsProps extends LayoutProps {
	title: string;
	author: string;
}

@nodeName('Credits')
export class Credits extends Layout {
	public constructor(props: CreditsProps) {
		super(props);

		this.zIndex(1000);
		this.layout(true);
		this.direction('column');
		this.padding([12, 20]);

		this.add(
			<>
				<Txt text={props.title} fill="#aaa" />
				<Txt text={props.author} fill="#efefef" />
			</>,
		);
	}
}
