# Tools for inspecting and previewing the game's pixel art.
# Usage from the repo root:
#   nix-shell .claude/skills/pixel-art-assets/shell.nix --run "python3 <script> ..."
{ pkgs ? import <nixpkgs> { } }:

pkgs.mkShell {
  packages = [
    (pkgs.python3.withPackages (p: [ p.pillow ]))
  ];
}
