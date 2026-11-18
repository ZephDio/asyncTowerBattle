import { useEffect } from "react";
import type { Account } from "./app";

// Placeholder entries until the menu gets real features.
const entries = [
	{ label: "Button 1", icon: <path d="M4 5h16M4 12h16M4 19h10" /> },
	{ label: "Button 2", icon: <circle cx="12" cy="12" r="7" /> },
];

// A drawer floating over the game: opening it never resizes or moves the canvas, and the game stays playable beside it.
export function SideMenu({
	open,
	onClose,
	account,
	onLogOut,
}: {
	open: boolean;
	onClose: () => void;
	account: Account;
	// Logging out a guest brings the login screen back too.
	onLogOut: () => void;
}) {
	useEffect(() => {
		if (!open) return;
		const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && onClose();
		window.addEventListener("keydown", closeOnEscape);
		return () => window.removeEventListener("keydown", closeOnEscape);
	}, [open, onClose]);

	return (
		<nav
			className={`fixed top-3 bottom-3 left-3 z-20 flex w-64 flex-col rounded-2xl border border-white/10 bg-neutral-900/85 shadow-2xl shadow-black/60 backdrop-blur-xl transition-transform duration-300 ease-out ${open ? "translate-x-0" : "-translate-x-[calc(100%+1rem)]"}`}
			inert={!open}
			aria-label="Main menu"
		>
			<header className="flex h-17 items-center border-b border-white/10 pr-4 pl-18">
				<span className="font-title text-xl tracking-wide text-amber-100">Tower Battle</span>
			</header>
			<ul className="flex flex-col gap-1 p-2">
				{entries.map(({ label, icon }) => (
					<li key={label}>
						<button className="group flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left font-text text-lg text-neutral-300 transition-colors hover:bg-white/8 hover:text-white focus-visible:bg-white/8 focus-visible:text-white focus-visible:outline-none">
							<svg
								className="size-5 shrink-0 text-neutral-500 transition-colors group-hover:text-amber-300"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
							>
								{icon}
							</svg>
							{label}
						</button>
					</li>
				))}
			</ul>
			{(account.kind === "player" || account.kind === "guest") && (
				<footer className="mt-auto flex items-center gap-3 border-t border-white/10 p-4">
					<span className="min-w-0 flex-1 truncate font-text text-lg text-neutral-300">
						{account.kind === "player" ? account.player.name : "Guest"}
					</span>
					<button
						className="cursor-pointer rounded-lg px-3 py-1.5 font-text text-neutral-400 transition-colors hover:bg-white/8 hover:text-white focus-visible:bg-white/8 focus-visible:outline-none"
						onClick={onLogOut}
					>
						{account.kind === "player" ? "Log out" : "Log in"}
					</button>
				</footer>
			)}
		</nav>
	);
}

// Sits above the drawer and morphs between a hamburger and a cross.
export function MenuToggle({ open, onToggle }: { open: boolean; onToggle: () => void }) {
	const bar = "absolute h-0.5 w-5 rounded-full bg-current transition-transform duration-300 ease-out";
	return (
		<button
			className="fixed top-6 left-6 z-30 grid size-11 cursor-pointer place-items-center rounded-xl border border-white/10 bg-neutral-800/80 text-neutral-200 shadow-lg shadow-black/40 backdrop-blur transition-colors hover:bg-neutral-700 hover:text-white focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:outline-none"
			aria-label={open ? "Close the menu" : "Open the menu"}
			aria-expanded={open}
			onClick={onToggle}
		>
			<span className={`${bar} ${open ? "rotate-45" : "-translate-y-1.5"}`} />
			<span className={`${bar} ${open ? "scale-x-0" : ""}`} />
			<span className={`${bar} ${open ? "-rotate-45" : "translate-y-1.5"}`} />
		</button>
	);
}
