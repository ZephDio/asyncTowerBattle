import { useState } from "react";
import { AuthError, loginWithGoogle, registerWithGoogle } from "../auth/auth-api";
import type { Session } from "../auth/session";
import { GOOGLE_CLIENT_ID, GoogleButton } from "./google-button";

type Mode = "login" | "register";

// Same rule as the server's playerName.
const NAME_LENGTH = { min: 2, max: 20 };

const errorMessage = (error: unknown) =>
	error instanceof AuthError ? error.message : "The server can't be reached, try again or play as a guest";

// Covers the game until the player logs in, registers or chooses to play as a guest.
export function LoginScreen({ onSession, onGuest }: { onSession: (session: Session) => void; onGuest: () => void }) {
	const [mode, setMode] = useState<Mode>("login");
	const [name, setName] = useState("");
	const [error, setError] = useState<string>();
	const [pending, setPending] = useState(false);

	const signIn = async (credential: string) => {
		setError(undefined);
		const trimmed = name.trim();
		if (mode === "register" && (trimmed.length < NAME_LENGTH.min || trimmed.length > NAME_LENGTH.max)) {
			setError(`Pick a name of ${NAME_LENGTH.min} to ${NAME_LENGTH.max} characters first`);
			return;
		}
		setPending(true);
		try {
			onSession(mode === "login" ? await loginWithGoogle(credential) : await registerWithGoogle(credential, trimmed));
		} catch (caught) {
			if (caught instanceof AuthError && caught.status === 404) {
				setMode("register");
				setError("This Google account has no player yet: pick a name to register");
			} else if (caught instanceof AuthError && caught.status === 409) {
				// Already registered: the same credential logs them in.
				await loginWithGoogle(credential).then(onSession, (retry) => setError(errorMessage(retry)));
			} else {
				setError(errorMessage(caught));
			}
		} finally {
			setPending(false);
		}
	};

	const tab = (tabMode: Mode, label: string) => (
		<button
			className={`flex-1 cursor-pointer rounded-lg py-2 font-text text-lg transition-colors ${mode === tabMode ? "bg-white/10 text-amber-100" : "text-neutral-400 hover:text-neutral-200"}`}
			aria-pressed={mode === tabMode}
			onClick={() => {
				setMode(tabMode);
				setError(undefined);
			}}
		>
			{label}
		</button>
	);

	return (
		<div className="fixed inset-0 z-40 grid place-items-center bg-black/70 backdrop-blur-sm">
			<div className="flex w-80 flex-col gap-5 rounded-2xl border border-white/10 bg-neutral-900/90 p-6 shadow-2xl shadow-black/60">
				<h1 className="text-center font-title text-3xl tracking-wide text-amber-100">Tower Battle</h1>
				<div className="flex gap-1 rounded-xl bg-black/30 p-1">
					{tab("login", "Log in")}
					{tab("register", "Register")}
				</div>
				{mode === "register" && (
					<label className="flex flex-col gap-1 font-text text-neutral-300">
						Player name
						<input
							className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-lg text-white outline-none focus:border-amber-300"
							value={name}
							maxLength={NAME_LENGTH.max}
							autoFocus
							onChange={(event) => setName(event.target.value)}
						/>
					</label>
				)}
				{GOOGLE_CLIENT_ID ? (
					<div className={pending ? "pointer-events-none opacity-50" : ""}>
						<GoogleButton
							clientId={GOOGLE_CLIENT_ID}
							text={mode === "login" ? "signin_with" : "signup_with"}
							onCredential={signIn}
							onError={setError}
						/>
					</div>
				) : (
					<p className="text-center font-text text-neutral-500">Google sign-in is not set up (VITE_GOOGLE_CLIENT_ID)</p>
				)}
				{error && <p className="text-center font-text text-red-300">{error}</p>}
				<div className="flex items-center gap-3 font-text text-neutral-500">
					<span className="h-px flex-1 bg-white/10" />
					or
					<span className="h-px flex-1 bg-white/10" />
				</div>
				<button
					className="cursor-pointer rounded-xl border border-white/10 py-2.5 font-text text-lg text-neutral-300 transition-colors hover:bg-white/8 hover:text-white"
					onClick={onGuest}
				>
					Play as guest
				</button>
			</div>
		</div>
	);
}
