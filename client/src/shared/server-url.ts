// The game server (server/): opponent boards, player accounts and sessions. It is reached through `/api` on the page's
// own origin: the Docker image's nginx proxies it to the server, and so does the Vite dev server.
export const SERVER_URL: string = import.meta.env["VITE_SERVER_URL"] || "/api";
