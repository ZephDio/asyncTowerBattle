import { useEffect, useRef } from "react";
import type { GameLink } from "../control/input-to-intent-translator";
import { startGame } from "../index";

// onStart receives the link to the game once the game runs.
export function GameCanvas({ onStart }: { onStart: (game: GameLink) => void }) {
	const container = useRef<HTMLDivElement>(null);
	const canvas = useRef<HTMLCanvasElement>(null);
	useEffect(() => {
		if (!container.current || !canvas.current) return;
		// The app renders the game once and never unmounts it; the cleanup is for Fast Refresh and StrictMode, which
		// run the effect again on the same canvas and must not leave the first game drawing and listening.
		const { link, stop } = startGame(container.current, canvas.current);
		onStart(link);
		return stop;
		// onStart is only read when the game starts.
	}, []);
	return (
		<div ref={container} className="flex h-full w-full items-center justify-center">
			<canvas ref={canvas} />
		</div>
	);
}
