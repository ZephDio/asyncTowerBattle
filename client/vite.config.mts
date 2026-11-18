import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react(), tailwindcss()],
	server: {
		// Listen on every interface so players on the local network, or through a forwarded port, can open the game.
		host: true,
		// Like the Docker image's nginx: /api reaches the game server, so the page and the server share one origin
		// and one port.
		proxy: {
			"/api": { target: "http://localhost:6868", rewrite: (path) => path.replace(/^\/api/, "") },
		},
	},
});
