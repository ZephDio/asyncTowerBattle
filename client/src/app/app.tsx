import { useCallback, useState } from "react";
import { GameCanvas } from "./game-canvas";
import { MenuToggle, SideMenu } from "./side-menu";

export function App() {
	const [menuOpen, setMenuOpen] = useState(false);
	const closeMenu = useCallback(() => setMenuOpen(false), []);
	return (
		<div className="h-screen w-screen overflow-hidden bg-black">
			{/* The left padding keeps a strip for the menu toggle, so it never covers the canvas. */}
			<div className="h-full py-[2vh] pr-[2vw] pl-20">
				<GameCanvas />
			</div>
			<SideMenu open={menuOpen} onClose={closeMenu} />
			<MenuToggle open={menuOpen} onToggle={() => setMenuOpen(!menuOpen)} />
		</div>
	);
}
