import { useEffect, useRef } from "react";
import { startGame } from "../index";

export function GameCanvas() {
	const container = useRef<HTMLDivElement>(null);
	const canvas = useRef<HTMLCanvasElement>(null);
	useEffect(() => {
		if (!container.current || !canvas.current) return;
		// The game has no teardown: it lives for the page's lifetime, so the app renders it once and never unmounts it.
		startGame(container.current, canvas.current);
	}, []);
	return (
		<div ref={container} className="flex h-full w-full items-center justify-center">
			<canvas ref={canvas} />
		</div>
	);
}
