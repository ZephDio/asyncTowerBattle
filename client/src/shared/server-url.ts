// The game server (server/): opponent boards, player accounts and sessions. The Docker image sets VITE_SERVER_URL to
// `/api`, which its nginx proxies to the server. In development the server runs on the machine that serves the game,
// so a player on the local network reaches it through the same host name as the page.
export const SERVER_URL: string = import.meta.env["VITE_SERVER_URL"] || `http://${window.location.hostname}:6868`;
