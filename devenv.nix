{ pkgs, config, ... }:

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
  # Prisma from nixpkgs too: it has no prebuilt engines for NixOS. Keep the server's prisma packages at its version.
  # Docker with its rootless daemon, run by the docker process below, and Compose for the server's Postgres.
  packages = [ pkgs.biome pkgs.prisma-engines pkgs.docker pkgs.docker-compose ];

  env = {
    PRISMA_SCHEMA_ENGINE_BINARY = "${pkgs.prisma-engines}/bin/schema-engine";
    # The database of server/docker-compose.yml.
    DATABASE_URL = "postgresql://atb:atb@localhost:5432/atb";
    # Signs the server's access tokens. A deployed server sets its own.
    JWT_SECRET = "atb-dev-secret";
    # The game's OAuth client ID from the Google Cloud console (a "Web application" client with
    # http://localhost:5173 as an authorized JavaScript origin). The server checks ID tokens against it and Vite gives
    # it to the sign-in button. Google sign-in is off while it is empty; guests can still play.
    GOOGLE_CLIENT_ID = "851929848198-651ujp6ruq78tm3n6foo2v6ktdj23qd7.apps.googleusercontent.com";
    VITE_GOOGLE_CLIENT_ID = config.env.GOOGLE_CLIENT_ID;
    # Also accepts the credential `google:<id>` as the Google account <id>, so the headless game tools can play as a
    # registered player. Never set it on a deployed server.
    FAKE_GOOGLE_SIGN_IN = "true";
    # The project's own Docker daemon, so the docker CLI never talks to a system one.
    DOCKER_HOST = "unix://${config.env.DEVENV_RUNTIME}/docker.sock";
    DOCKERD_ROOTLESS_ROOTLESSKIT_STATE_DIR = "${config.env.DEVENV_RUNTIME}/dockerd-rootless";
  };

  processes.vite.exec = "pnpm start:client";
  processes.server.exec = "pnpm start:server";
  # A rootless Docker daemon running as the user, with its images and volumes in .devenv/state/docker and its log in
  # $DEVENV_RUNTIME/docker.log. It runs detached: the shell starts it on entering the project and leaves it running.
  # The lock keeps two shells from starting it together. Returns once the daemon answers.
  scripts.start-docker.exec = ''
    pidfile="$DEVENV_RUNTIME/docker.pid"
    exec 9> "$DEVENV_RUNTIME/docker.lock"
    ${pkgs.util-linux}/bin/flock 9
    if ! { [ -s "$pidfile" ] && kill -0 "$(cat "$pidfile")" 2> /dev/null; }; then
      rm -f "$pidfile"
      mkdir -p "$DEVENV_STATE/docker"
      ${pkgs.util-linux}/bin/setsid -f dockerd-rootless \
        --data-root "$DEVENV_STATE/docker" \
        --exec-root "$DEVENV_RUNTIME/docker" \
        --pidfile "$pidfile" \
        -H "$DOCKER_HOST" \
        >> "$DEVENV_RUNTIME/docker.log" 2>&1 < /dev/null 9>&-
    fi
    for _ in $(seq 150); do
      [ -s "$pidfile" ] && docker info > /dev/null 2>&1 && exit 0
      sleep 0.2
    done
    echo "dockerd did not start, see $DEVENV_RUNTIME/docker.log" >&2
    exit 1
  '';
  # Stops the daemon with a single signal, after which dockerd stops the containers. Signalling every process of the
  # daemon instead, the way devenv stops a process, makes dockerd quit at once and leave the containers running.
  scripts.stop-docker.exec = ''
    pidfile="$DEVENV_RUNTIME/docker.pid"
    [ -s "$pidfile" ] || exit 0
    daemon=$(cat "$pidfile")
    kill -TERM "$daemon" 2> /dev/null || exit 0
    while kill -0 "$daemon" 2> /dev/null; do sleep 0.2; done
  '';

  # Lets `devenv up` wait for the daemon, and stops it with the other processes.
  processes.docker = {
    exec = ''
      start-docker
      daemon=$(cat "$DEVENV_RUNTIME/docker.pid")
      trap 'stop-docker; exit 0' INT TERM
      while kill -0 "$daemon" 2> /dev/null; do sleep 1; done
      exit 1
    '';
    ready.exec = "docker info";
    # Time for dockerd to stop the containers, which it gives 15 seconds.
    shutdown.grace = 20;
  };
  processes.postgres = {
    exec = "exec docker compose -f server/docker-compose.yml up postgres";
    after = [ "devenv:processes:docker" ];
  };

  enterShell = ''
    echo "node $(node --version) / pnpm $(pnpm --version)"
    echo "Run 'devenv up' to launch the Vite client (port 5173), the server (port 6868), Docker and its Postgres (port 5432)"
    echo "Docker starts in the background, 'stop-docker' stops it"
    ${pkgs.util-linux}/bin/setsid -f start-docker > /dev/null 2>&1 < /dev/null
  '';
}
