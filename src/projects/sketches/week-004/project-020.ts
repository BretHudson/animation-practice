import { makeProject } from '@motion-canvas/core';
import { Code, LezerHighlighter } from '@motion-canvas/2d';
import { parser } from '@lezer/javascript';

import scene from '~/scenes/week-004/sketch-020?scene';
import audio from '~/../audio/sketch-020.mp3';
import '~/global.css';

Code.defaultHighlighter = new LezerHighlighter(
	parser.configure({
		dialect: 'ts',
	}),
);

export default makeProject({
	scenes: [scene],
	audio: audio,
});
