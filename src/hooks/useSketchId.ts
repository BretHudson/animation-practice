import { useScene } from '@motion-canvas/core';

export function getSketchId(importMetaUrl: string) {
	return +/(\d+)/.exec(importMetaUrl)[1];
}

export function useSketchId(): number {
	return getSketchId(useScene().name);
}
