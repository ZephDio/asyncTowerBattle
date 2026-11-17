// Placeholder entries until the menu gets real features.
const entries = ["Button 1", "Button 2"];

export function SideMenu({ open }: { open: boolean }) {
	return (
		<nav
			className={`h-full shrink-0 overflow-hidden transition-[width] duration-200 ${open ? "w-40" : "w-0"}`}
			aria-hidden={!open}
		>
			<ul className="flex h-full w-40 flex-col gap-2 rounded-r-3xl border-r border-neutral-700 bg-neutral-900 px-4 py-8">
				{entries.map((entry) => (
					<li key={entry}>
						<button
							className="w-full rounded-lg px-2 py-1 text-left font-text text-2xl text-white hover:bg-neutral-800"
							tabIndex={open ? 0 : -1}
						>
							{entry}
						</button>
					</li>
				))}
			</ul>
		</nav>
	);
}

export function MenuToggle({ open, onToggle }: { open: boolean; onToggle: () => void }) {
	return (
		<button
			className="flex size-14 flex-col items-center justify-center gap-1.5 rounded-full border-2 border-neutral-500 bg-neutral-400 hover:bg-neutral-300"
			aria-label={open ? "Fold the menu" : "Unfold the menu"}
			aria-expanded={open}
			onClick={onToggle}
		>
			<span className="h-1 w-7 rounded-full bg-white" />
			<span className="h-1 w-7 rounded-full bg-white" />
			<span className="h-1 w-7 rounded-full bg-white" />
		</button>
	);
}
