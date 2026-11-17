// Set when the game is opened with `?debug`, as the game MCP server (.claude/mcp/server.py) does. Kept apart from the
// bridge so the engine can read it without importing the bridge.
export const DEBUG_BRIDGE = typeof location !== "undefined" && new URLSearchParams(location.search).has("debug");
