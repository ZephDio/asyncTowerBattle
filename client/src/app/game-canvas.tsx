import { useEffect, useRef } from "react";
import type { GameLink } from "../control/input-to-intent-translator";
import { startGame } from "../index";

// onStart receives the link to the game once the game runs.
export function GameCanvas({ onStart }: { onStart: (game: GameLink) => void }) {
	const container = useRef<HTMLDivElement>(null);
	const canvas = useRef<HTMLCanvasElement>(null);
	useEffect(() => {
		if (!container.current || !canvas.current) return;
		// The game has no teardown: it lives for the page's lifetime, so the app renders it once and never unmounts it.
		onStart(startGame(container.current, canvas.current));
		// The game starts once: onStart is only read then.
	}, []);
	return (
		<div ref={container} className="flex h-full w-full items-center justify-center">
			<canvas ref={canvas} />
		</div>
	);
}
