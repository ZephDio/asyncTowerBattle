# Headless browser shell for Claude to run the game and take screenshots.
# Usage: nix-shell .agents/playwright.nix --run "python .agents/scripts/screenshot.py --help"
# Python playwright and the Chromium build come from the same nixpkgs, so their versions match:
# the npm playwright package downloads a generic-linux Chromium that NixOS can't run.
{ pkgs ? import <nixpkgs> { } }:

pkgs.mkShell {
  packages = [
    (pkgs.python3.withPackages (ps: [ ps.playwright ps.mcp ]))
    pkgs.playwright-driver.browsers
    pkgs.nodejs_22
    pkgs.pnpm
  ];

  PLAYWRIGHT_BROWSERS_PATH = "${pkgs.playwright-driver.browsers}";
  PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS = "true";
}
