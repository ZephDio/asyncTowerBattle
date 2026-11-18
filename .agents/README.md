# Shared agent resources

This directory is the agent-neutral source of truth. Run commands from the repository root.

- `../AGENTS.md`: shared project instructions, architecture, and commands.
- `skills/<name>/SKILL.md`: portable Agent Skills, including scripts and assets.
- `mcp/`: the `atb-game` MCP server and command-line client.
- `playwright.nix`: Python, MCP, and headless Chromium environment.
- `scripts/`: standalone helpers.
- `screenshots/`: captures intended to be shared with the user.

## Agent setup

| Agent | Instructions | Skills | Game MCP |
|---|---|---|---|
| Pi | `AGENTS.md` | Native `.agents/skills/` discovery | `.pi/mcp.json` links to the root `.mcp.json` |
| OpenCode | `AGENTS.md` | Explicit path in `opencode.json` | Local server in `opencode.json` |
| Claude Code | `CLAUDE.md` imports `AGENTS.md` | `.claude/skills` links to `.agents/skills` | Root `.mcp.json` |
| Other agents | Read `AGENTS.md` | Load the relevant `SKILL.md` manually if needed | Use stdio MCP or the CLI fallback below |

The compatibility files contain no separate skills or project guidance. Edit the shared files rather than copying them into agent-specific directories. Preserve Git symlinks when checking out this repository.

Pi must trust the project before loading its MCP configuration. Restart your agent or reload its resources after changing configuration. Older Pi versions without built-in MCP can use the CLI fallback.

## Game tools without an MCP integration

Any agent with a shell can call the same tools through the real MCP protocol:

```bash
nix-shell .agents/playwright.nix --run "python .agents/mcp/call.py start '{\"seed\": 7}' state"
```

See `skills/game-testing/SKILL.md` for tool usage and browser smoke tests. The game tool starts Vite if necessary; server-backed features also need the server and PostgreSQL described in `AGENTS.md`.

## Adding resources

Create new skills under `.agents/skills/<name>/` with a `SKILL.md` containing `name` and `description` frontmatter. Keep bundled paths relative to the skill when practical. Agent-specific discovery stays in the thin compatibility configuration.

The root `.mcp.json` is shared by Claude Code and Pi. OpenCode uses a different MCP configuration format, so update its command in `opencode.json` too if the server launch command changes.
