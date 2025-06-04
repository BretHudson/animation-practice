import {
	Layout,
	type LayoutProps,
	nodeName,
	type PossibleCanvasStyle,
	Rect,
	Node,
	NodeProps,
} from '@motion-canvas/2d';
import {
	PlaybackState,
	SignalValue,
	usePlayback,
	useScene,
	Vector2,
} from '@motion-canvas/core';
import { useDimensions } from '~/util';

//  Youtube 9x16 used to be 150 pixels top and bottom but I got sent a new one recently from Instagram saying 20% at the bottom is protected.
// - https://www.reddit.com/r/editors/comments/zoj9zz/comment/j0p57fa/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button

// TikTok Safe Zone: https://imgur.com/O8sasYC

// TODO(bret): Build this into Motion Canvas 👀

export interface SafeAreaProps extends LayoutProps {}

export const useSafeArea = () => {
	const fullSize = useScene().getSize();

	const instaSafeArea = fullSize.scale(0.8);
	instaSafeArea.width = fullSize.width;

	const youTubeTitleArea: [Vector2, Vector2] = [
		new Vector2(0, fullSize.height * 0.4),
		new Vector2(fullSize.width, fullSize.height * 0.2),
	];
	const youTubeIconArea: [Vector2, Vector2] = [
		//
		new Vector2(fullSize.width * 0.4, fullSize.height * 0.11),
		new Vector2(fullSize.width * 0.2, fullSize.height * 0.38),
	];

	return {
		fullSize,
		actionSafeArea: fullSize.scale(0.95),
		titleSafeArea: fullSize.scale(0.9),
		instaSafeArea,
		youTubeTitleArea,
		youTubeIconArea,
	};
};

interface RectBorderProps extends NodeProps {
	innerSize: Vector2;
	outerSize: Vector2;
	fill: SignalValue<PossibleCanvasStyle>;
}

@nodeName('RectBorder')
export class RectBorder extends Node {
	public constructor(props: RectBorderProps) {
		super(props);

		this.cache(true);
		this.add(
			<>
				<Rect size={props.outerSize} fill={props.fill} />
				<Rect
					size={props.innerSize}
					fill="white"
					compositeOperation="destination-out"
				/>
			</>,
		);
	}
}

@nodeName('SafeArea')
export class SafeArea extends Layout {
	public constructor(props: SafeAreaProps) {
		super(props);

		if (usePlayback().state === PlaybackState.Rendering) {
			this.opacity(0);
		}

		const { portrait } = useDimensions();

		const {
			fullSize,
			actionSafeArea,
			titleSafeArea,
			instaSafeArea,
			youTubeIconArea,
			youTubeTitleArea,
		} = useSafeArea();

		this.zIndex(999999);

		this.add(
			<>
				<RectBorder
					fill="#ff000033"
					outerSize={fullSize}
					innerSize={actionSafeArea}
				/>
				<RectBorder
					fill="#ffff0033"
					outerSize={actionSafeArea}
					innerSize={titleSafeArea}
				/>
			</>,
		);

		if (portrait) {
			this.add(
				<>
					<RectBorder
						fill="#8134af66"
						outerSize={fullSize}
						innerSize={instaSafeArea}
					/>
					<Rect
						fill="#ffffff66"
						position={youTubeTitleArea[0]}
						size={youTubeTitleArea[1]}
					/>
					<Rect
						fill="#ffffff66"
						position={youTubeIconArea[0]}
						size={youTubeIconArea[1]}
					/>
				</>,
			);
		}
	}
}
