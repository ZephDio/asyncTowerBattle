{ pkgs, ... }:

{
  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_22;
    pnpm = {
      enable = true;
      install.enable = true;
    };
  };

  languages.typescript.enable = true;

  # Biome from nixpkgs: the npm package ships a generic-linux binary that NixOS can't run
  packages = [ pkgs.biome ];

  processes.server.exec = "pnpm start";

  enterShell = ''
    echo "node $(node --version) / pnpm $(pnpm --version)"
    echo "Run 'pnpm start' (or 'devenv up') to launch the server on port 6868"
  '';
}
