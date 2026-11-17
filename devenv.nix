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

  processes.vite.exec = "pnpm start:client";
  processes.server.exec = "pnpm start:server";

  enterShell = ''
    echo "node $(node --version) / pnpm $(pnpm --version)"
    echo "Run 'devenv up' to launch the Vite client (port 5173) and the server (port 6868)"
  '';
}
