import { useEffect, useState } from "react";
import type { GameLink } from "../control/input-to-intent-translator";

// The "?" in the bottom left corner of the page. Hovering it opens the tutorial, a panel drawn by the game on the
// canvas, and moving the mouse away closes it. A click pins it open until the next click on the button, or until a
// click on the canvas, which the game turns into closing the tutorial.
export function HelpButton({ game }: { game: GameLink | null }) {
	const [pinned, setPinned] = useState(false);
	useEffect(() => game?.onTutorialChange((open) => open || setPinned(false)), [game]);
	const send = (open: boolean) => game?.send({ intent: open ? "open-tutorial" : "close-tutorial" });
	return (
		<button
			className={`fixed bottom-6 left-6 z-10 grid size-11 cursor-pointer place-items-center rounded-xl border font-title text-2xl shadow-lg shadow-black/40 backdrop-blur transition-colors focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:outline-none ${pinned ? "border-amber-300/70 bg-neutral-700 text-amber-200" : "border-white/10 bg-neutral-800/80 text-neutral-200 hover:bg-neutral-700 hover:text-amber-200"}`}
			aria-label={pinned ? "Close how to play" : "How to play"}
			aria-pressed={pinned}
			onMouseEnter={() => send(true)}
			onMouseLeave={() => pinned || send(false)}
			onClick={() => {
				// Unpinning closes it at once, even though the mouse is still on the button.
				setPinned(!pinned);
				send(!pinned);
			}}
		>
			?
		</button>
	);
}
