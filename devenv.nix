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

  processes.vite.exec = "pnpm start";

  enterShell = ''
    echo "node $(node --version) / pnpm $(pnpm --version)"
    echo "Run 'pnpm start' (or 'devenv up') to launch the dev server"
  '';
}
