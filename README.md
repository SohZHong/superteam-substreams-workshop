# Superteam Substreams Workshop

## Installing Dependencies

### Install the `subtreams` CLI

There are two options to start developing with substreams.

#### 1. Clone in local VSCode (Preferred)

- Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Install [VSCode](https://code.visualstudio.com/download)
- Install the [Devcontainer Extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) in VSCode
- Open this repository, and execute "Rebuild & open in container"

#### Included in the dev environment

- `substreams` preinstalled
- For _Substreams_ development: **Rust** toolchain, `buf` and protobuf tooling,
- For _subgraph_ development: **node/npm**, along with all subgraph services, running in the devcontainer (`graph-node`, `postgres`, `ipfs`) directly accessible locally or remotely.
- Pre-configured VSCode extensions for everything, plus a custom _VSCode Substreams Extension_.

#### 2. Local install

- Install the `substreams` CLI, there are several options:

  - Homebrew Installation

  ```zsh
  brew install streamingfast/tap/substreams
  ```

  - Pre-compiled binary installation

    - MacOS:

    ```bash
        LINK=$(curl -s https://api.github.com/repos/streamingfast/substreams/releases/latest | awk "/download.url.*$(uname -s | tr '[:upper:]' '[:lower:]')\_$(uname -m)/ {print \$2}" | sed 's/"//g')
        curl -L $LINK | tar zxf -
    ```

    - Linux:

    ```bash
        LINK=$(curl -s https://api.github.com/repos/streamingfast/substreams/releases/latest | awk "/download.url.*linux_$(uname -m)/ {print \$2}" | sed 's/"//g')
        curl -L  $LINK  | tar zxf -
    ```

  - Installation from source

  ```bash
  git clone https://github.com/streamingfast/substreams
  cd substreams
  go install -v ./cmd/substreams

  ```

> [!IMPORTANT]
> Add `$HOME/go/bin` to the system path if it's not already present.

#### Validation of installation

Run the [`substreams` CLI](https://docs.substreams.dev/reference-material/substreams-cli/command-line-interface) passing the `--version` flag to check the success of the installation.

```bash
substreams --version
```

A successful installation will print the version that you have installed.

```bash
substreams version dev
```

### Developer Dependencies

#### Rust Dependencies Installation

Developing Substreams modules requires a working [Rust](https://www.rust-lang.org/) compilation environment.

Install Rust through `curl` using:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env # to configure your current shell
```

**`wasm32-unknown-unknown` target**

Ensure you have the `wasm32-unknown-unknown` target installed on your Rust installation, if unsure, you can install it with:

```bash
rustup target add wasm32-unknown-unknown
```

#### Buf Installation

Buf simplifies the generation of typed structures in any language. Buf uses a remote builder executed on the Buf server, so an internet connection is required to generate Rust bindings from Protobuf definitions. To install the CLI, there are several options:

**1. Homebrew**

```zsh
brew install bufbuild/buf/buf
```

**2. NPM**

```bash
npm install @bufbuild/buf
```

To execute `buf` from the command line, you can use `npx`:

```bash
npx buf --version
```

**3. Windows**

You can install the Buf CLI using the [Scoop](https://scoop.sh/) installer for Windows:

```bash
scoop install buf
```

To update Buf:

```bash
scoop update buf
```

**Binary**

Buf offers Windows binaries for both the `x86_64` and `arm64` architectures. You can download the latest binaries from [GitHub Releases](https://github.com/bufbuild/buf/releases/latest).
