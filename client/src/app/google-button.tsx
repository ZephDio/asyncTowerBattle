import { useEffect, useRef } from "react";

// The OAuth client of the game in Google Cloud. The server checks ID tokens against the same id (GOOGLE_CLIENT_ID).
export const GOOGLE_CLIENT_ID: string | undefined = import.meta.env["VITE_GOOGLE_CLIENT_ID"] || undefined;

// The few calls of Google Identity Services the button uses.
type GoogleIdentityServices = {
	initialize(config: { client_id: string; callback: (response: { credential: string }) => void }): void;
	renderButton(
		parent: HTMLElement,
		options: { theme: string; size: string; shape: string; text: string; width: number },
	): void;
};

declare global {
	interface Window {
		google?: { accounts: { id: GoogleIdentityServices } };
	}
}

let identityServices: Promise<GoogleIdentityServices> | undefined;

const loadIdentityServices = () => {
	identityServices ??= new Promise((resolve, reject) => {
		const script = document.createElement("script");
		script.src = "https://accounts.google.com/gsi/client";
		script.async = true;
		script.onload = () => (window.google ? resolve(window.google.accounts.id) : reject(new Error("No Google API")));
		script.onerror = () => {
			identityServices = undefined;
			reject(new Error("Could not load Google sign-in"));
		};
		document.head.appendChild(script);
	});
	return identityServices;
};

// Google's own sign-in button, which gives an ID token for the account the player picked. Its look is Google's, only
// the label changes: "Sign in with Google" to log in, "Sign up with Google" to register.
export function GoogleButton({
	clientId,
	text,
	onCredential,
	onError,
}: {
	clientId: string;
	text: "signin_with" | "signup_with";
	onCredential: (credential: string) => void;
	onError: (message: string) => void;
}) {
	const parent = useRef<HTMLDivElement>(null);
	// The latest callbacks, since Google keeps the one given to initialize.
	const callbacks = useRef({ onCredential, onError });
	callbacks.current = { onCredential, onError };

	useEffect(() => {
		let cancelled = false;
		loadIdentityServices()
			.then((google) => {
				if (cancelled || !parent.current) return;
				google.initialize({
					client_id: clientId,
					callback: ({ credential }) => callbacks.current.onCredential(credential),
				});
				google.renderButton(parent.current, { theme: "filled_black", size: "large", shape: "pill", text, width: 280 });
			})
			.catch((error: Error) => !cancelled && callbacks.current.onError(error.message));
		return () => {
			cancelled = true;
		};
	}, [clientId, text]);

	return <div ref={parent} className="flex h-11 justify-center" />;
}
