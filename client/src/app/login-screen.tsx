import { type FormEvent, type InputHTMLAttributes, useState } from "react";
import {
	AuthError,
	loginWithGoogle,
	loginWithPassword,
	registerWithGoogle,
	registerWithPassword,
} from "../auth/auth-api";
import type { Session } from "../auth/session";
import { GOOGLE_CLIENT_ID, GoogleButton } from "./google-button";

type Mode = "login" | "register";

// Same rules as the server's playerName and playerPassword.
const NAME_LENGTH = { min: 2, max: 20 };
const PASSWORD_LENGTH = { min: 8, max: 128 };

const errorMessage = (error: unknown) =>
	error instanceof AuthError ? error.message : "The server can't be reached, try again or play as a guest";

const nameError = (name: string) =>
	name.length < NAME_LENGTH.min || name.length > NAME_LENGTH.max
		? `Pick a name of ${NAME_LENGTH.min} to ${NAME_LENGTH.max} characters first`
		: undefined;

// Covers the game until the player logs in, registers or chooses to play as a guest.
export function LoginScreen({ onSession, onGuest }: { onSession: (session: Session) => void; onGuest: () => void }) {
	const [mode, setMode] = useState<Mode>("login");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string>();
	const [pending, setPending] = useState(false);

	const attempt = async (
		open: () => Promise<Session>,
		onFailure = (caught: unknown) => setError(errorMessage(caught)),
	) => {
		setError(undefined);
		setPending(true);
		try {
			onSession(await open());
		} catch (caught) {
			await onFailure(caught);
		} finally {
			setPending(false);
		}
	};

	const submitPassword = (event: FormEvent) => {
		event.preventDefault();
		const trimmed = name.trim();
		if (mode === "register") {
			const invalid =
				nameError(trimmed) ??
				(password.length < PASSWORD_LENGTH.min
					? `Pick a password of at least ${PASSWORD_LENGTH.min} characters`
					: undefined);
			if (invalid) return setError(invalid);
		}
		attempt(() =>
			mode === "login" ? loginWithPassword(email, password) : registerWithPassword(email, trimmed, password),
		);
	};

	const signInWithGoogle = (credential: string) => {
		const trimmed = name.trim();
		if (mode === "register" && nameError(trimmed)) return setError(nameError(trimmed));
		attempt(
			() => (mode === "login" ? loginWithGoogle(credential) : registerWithGoogle(credential, trimmed)),
			async (caught) => {
				if (caught instanceof AuthError && caught.status === 404) {
					setMode("register");
					setError("This Google account has no player yet: pick a name to register");
				} else if (caught instanceof AuthError && caught.status === 409) {
					// Already registered: the same credential logs them in. Otherwise the email or name is taken.
					await loginWithGoogle(credential).then(onSession, () => setError(errorMessage(caught)));
				} else {
					setError(errorMessage(caught));
				}
			},
		);
	};

	const tab = (tabMode: Mode, label: string) => (
		<button
			type="button"
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

	const field = (
		label: string,
		props: InputHTMLAttributes<HTMLInputElement> & { value: string; onValue: (value: string) => void },
	) => {
		const { onValue, ...input } = props;
		return (
			<label className="flex flex-col gap-1 font-text text-neutral-300">
				{label}
				<input
					className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-lg text-white outline-none focus:border-amber-300"
					onChange={(event) => onValue(event.target.value)}
					{...input}
				/>
			</label>
		);
	};

	const divider = (
		<div className="flex items-center gap-3 font-text text-neutral-500">
			<span className="h-px flex-1 bg-white/10" />
			or
			<span className="h-px flex-1 bg-white/10" />
		</div>
	);

	return (
		<div className="fixed inset-0 z-40 grid place-items-center bg-black/70 backdrop-blur-sm">
			<div className="flex w-80 flex-col gap-5 rounded-2xl border border-white/10 bg-neutral-900/90 p-6 shadow-2xl shadow-black/60">
				<h1 className="text-center font-title text-3xl tracking-wide text-amber-100">Tower Battle</h1>
				<div className="flex gap-1 rounded-xl bg-black/30 p-1">
					{tab("login", "Log in")}
					{tab("register", "Register")}
				</div>
				<form className="flex flex-col gap-3" onSubmit={submitPassword}>
					{mode === "register" &&
						field("Player name", {
							value: name,
							onValue: setName,
							maxLength: NAME_LENGTH.max,
							autoComplete: "username",
						})}
					{field(mode === "login" ? "Email or player name" : "Email", {
						value: email,
						onValue: setEmail,
						type: mode === "login" ? "text" : "email",
						required: true,
						autoComplete: mode === "login" ? "username" : "email",
					})}
					{field("Password", {
						value: password,
						onValue: setPassword,
						type: "password",
						required: true,
						maxLength: PASSWORD_LENGTH.max,
						autoComplete: mode === "login" ? "current-password" : "new-password",
					})}
					<button
						type="submit"
						disabled={pending}
						className="mt-1 cursor-pointer rounded-xl bg-amber-300/90 py-2.5 font-text text-lg text-neutral-900 transition-colors hover:bg-amber-200 disabled:opacity-50"
					>
						{mode === "login" ? "Log in" : "Register"}
					</button>
				</form>
				{error && <p className="text-center font-text text-red-300">{error}</p>}
				{divider}
				{GOOGLE_CLIENT_ID ? (
					<div className={pending ? "pointer-events-none opacity-50" : ""}>
						<GoogleButton
							clientId={GOOGLE_CLIENT_ID}
							text={mode === "login" ? "signin_with" : "signup_with"}
							onCredential={signInWithGoogle}
							onError={setError}
						/>
					</div>
				) : (
					<p className="text-center font-text text-neutral-500">Google sign-in is not set up (VITE_GOOGLE_CLIENT_ID)</p>
				)}
				<button
					type="button"
					className="cursor-pointer rounded-xl border border-white/10 py-2.5 font-text text-lg text-neutral-300 transition-colors hover:bg-white/8 hover:text-white"
					onClick={onGuest}
				>
					Play as guest
				</button>
			</div>
		</div>
	);
}
