{
  description = "Environment for Tapestry plugin development";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-24.11";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          overlays = [ ];
        };
      in
      rec {
        devShell = with pkgs; mkShell {
          name = "tapestry-plugins-env";
          packages = [
            nodejs
            nodePackages.pnpm
            nodePackages.typescript-language-server
          ];
        };
      }
    );
}
