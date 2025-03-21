# Substreams Data Stream Sink Integration Example

## Getting Started

### 1. Install the dependencies:

Make sure you have [Bun](https://bun.sh/) installed, then run:

```bash
bun install
```

### 2. Set Up Environment Variables

- Copy `.env.example` and rename it to `.env`
- Obtain your **Substreams API Token** from [The Graph Market](https://thegraph.market/dashboard?state=onboarding).
- Update the `.env` file:

```env
SUBSTREAMS_API_TOKEN=your_api_token_here
```

### 3. Configure Substreams Constants

Open the `constants.ts` file. This file contains all the necessary configuration variables for the Substreams integration. Update the fields to match your requirements:

```typescript
export const TOKEN: string = process.env.SUBSTREAMS_API_TOKEN || '';
export const ENDPOINT = '<YOUR_ENDPOINT>';
export const MODULE = '<YOUR_MODULE>';
export const SPKG = '<LOCAL_SPKG_FILE>';
export const START_BLOCK = <START_BLOCK>;
export const STOP_BLOCK = '<STOP_BLOCK>';
```

#### Explanation of Constants

| Variable      | Description                                                                                            |
| ------------- | ------------------------------------------------------------------------------------------------------ |
| `TOKEN`       | API token (fetched from .env)                                                                          |
| `ENDPOINT`    | Substreams endpoint for streaming Solana blockchain data e.g. https://mainnet.sol.streamingfast.io:443 |
| `MODULE`      | Name of the Substreams module to execute e.g. 'my_module'                                              |
| `SPKG`        | Name of the .spkg package file used for the stream e.g. 'my_spkg.spkg'                                 |
| `START_BLOCK` | The starting block number for processing e.g. 325320000                                                |
| `STOP_BLOCK`  | The number of blocks to process (relative stop block) e.g. '+100'                                      |

### 4. Running The Project

Start the Next.js development server:

```bash
bun run dev
```

Then, open http://localhost:3000 in your browser to see the real-time blockchain data streaming.

## Substreams JS Library

This [library](https://github.com/substreams-js/substreams-js) allows you to consume Substreams packages using the Typescript programming language. The library works on both NodeJS and the Browser, but with some differences

### Persisting The Cursor

Consuming a Substreams package involves opening a stream long-live gRPC connection. Disconnections will happen and it is necessary to create a reconnection mechanism that starts reading exactly where the stream was interrupted. The cursor provided by Substream must be persisted and, in the case of a disconnection, the latest committed cursor must be used.

You can read more about this topic in the [Substreams docs](https://docs.substreams.dev/reference-material/reliability-guarantees).

### NodeJS vs Browser

- Libraries: running Substreams JS on NodeJS requires using the `@connectrpc/connect-node` library, while consuming packages on the browser requires using `@connectrpc/connect-web`.
- Persisting the cursor: when using NodeJS, you can persist the cursor in a file or a database. When using the browser, you can use the local storage, cookies or an external API.

In this example, We will be using local storage to store the cursor
