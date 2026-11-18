import { useCallback, useEffect, useState } from "react";
import { logout, resumeSession } from "../auth/auth-api";
import type { Player, Session } from "../auth/session";
import { DEBUG_BRIDGE } from "../debug/debug-flag";
import { GameCanvas } from "./game-canvas";
import { LoginScreen } from "./login-screen";
import { MenuToggle, SideMenu } from "./side-menu";

// "resuming" while the stored session is being checked, "choosing" while the login screen is up.
export type Account =
	| { kind: "resuming" }
	| { kind: "choosing" }
	| { kind: "guest" }
	| { kind: "player"; player: Player };

// Debug runs, such as the headless game tools, play as a guest without the login screen.
const initialAccount: Account = DEBUG_BRIDGE ? { kind: "guest" } : { kind: "resuming" };

export function App() {
	const [menuOpen, setMenuOpen] = useState(false);
	const closeMenu = useCallback(() => setMenuOpen(false), []);
	const [account, setAccount] = useState<Account>(initialAccount);

	useEffect(() => {
		if (initialAccount.kind !== "resuming") return;
		resumeSession()
			.catch(() => undefined)
			.then((session) => setAccount(session ? { kind: "player", player: session.player } : { kind: "choosing" }));
	}, []);

	const onSession = useCallback((session: Session) => setAccount({ kind: "player", player: session.player }), []);
	const logOut = useCallback(() => {
		setMenuOpen(false);
		setAccount({ kind: "choosing" });
		logout();
	}, []);

	return (
		<div className="h-screen w-screen overflow-hidden bg-black">
			{/* The left padding keeps a strip for the menu toggle, so it never covers the canvas. */}
			<div className="h-full py-[2vh] pr-[2vw] pl-20">
				{/* Mounted from the start and never unmounted, since the game has no teardown: the login screen covers it. */}
				<GameCanvas />
			</div>
			<SideMenu open={menuOpen} onClose={closeMenu} account={account} onLogOut={logOut} />
			<MenuToggle open={menuOpen} onToggle={() => setMenuOpen(!menuOpen)} />
			{account.kind === "choosing" && (
				<LoginScreen onSession={onSession} onGuest={() => setAccount({ kind: "guest" })} />
			)}
		</div>
	);
}
