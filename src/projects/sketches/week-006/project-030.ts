import { Direction, makeProject } from '@motion-canvas/core';

import scene from '~/scenes/week-006/sketch-030?scene';
import '~/global.css';
import { parametrize } from '~/util';

const room1Bitmask = Direction.Bottom | Direction.Right;

export default makeProject({
	scenes: [
		parametrize(scene, {
			bitmask: room1Bitmask,
			target: Direction.Right,
			from: Direction.Top,
			first: true,
			_debugColor: 'lime',
		}),
		parametrize(scene, {
			bitmask: Direction.Left | Direction.Top | Direction.Right,
			from: Direction.Right,
			target: Direction.Top,
			_debugColor: 'red',
		}),
		parametrize(scene, {
			bitmask: Direction.Left | Direction.Bottom | Direction.Right,
			from: Direction.Top,
			target: Direction.Right,
			_debugColor: 'cyan',
		}),
		parametrize(scene, {
			bitmask: Direction.Left | Direction.Top | Direction.Bottom,
			from: Direction.Right,
			target: Direction.Bottom,
			_debugColor: 'yellow',
		}),
		parametrize(scene, {
			bitmask: Direction.Left | Direction.Top | Direction.Bottom,
			from: Direction.Bottom,
			target: Direction.Bottom,
			_debugColor: 'purple',
		}),
		parametrize(scene, {
			bitmask: Direction.Top,
			from: Direction.Bottom,
			goal: true,
		}),
		parametrize(scene, {
			bitmask: room1Bitmask,
			last: true,
		}),
	],
});
