import { useState } from "react";
import { GameCanvas } from "./game-canvas";
import { MenuToggle, SideMenu } from "./side-menu";

export function App() {
	const [menuOpen, setMenuOpen] = useState(true);
	return (
		<div className="flex h-screen w-screen overflow-hidden bg-black">
			<SideMenu open={menuOpen} />
			<div className="shrink-0 p-2">
				<MenuToggle open={menuOpen} onToggle={() => setMenuOpen(!menuOpen)} />
			</div>
			<div className="min-w-0 flex-1 py-[2vh] pr-[2vw]">
				<GameCanvas />
			</div>
		</div>
	);
}
