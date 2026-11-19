# From the repository root:
# nix-shell .agents/skills/layering-design/shell.nix --run "python3 ..."
{ pkgs ? import <nixpkgs> { } }:
pkgs.mkShell {
  packages = [
    (pkgs.python3.withPackages (p: [ p.pillow ]))
    pkgs.librsvg
  ];
}
