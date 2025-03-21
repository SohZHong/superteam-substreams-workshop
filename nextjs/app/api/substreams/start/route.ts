import { NextRequest } from 'next/server';
import { startSubstreams } from '@/substreams/main';
import { Handlers } from '@/substreams/types';
import {
  BlockScopedData,
  BlockUndoSignal,
  ModulesProgress,
} from '@substreams/core/proto';
import { IMessageTypeRegistry } from '@bufbuild/protobuf';
import { SPKG } from '@/substreams/constants';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const filePath = path.join(process.cwd(), 'substreams', 'spkgs', SPKG);
      const spkgBuffer = fs.readFileSync(filePath);

      const writeToStream = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      const blockScopeDataHandler = (
        response: BlockScopedData,
        registry: IMessageTypeRegistry
      ) => {
        const output = response.output?.mapOutput;
        const cursor = response.cursor;
        if (output !== undefined) {
          const message = output.unpack(registry);
          if (message === undefined) return;

          // Cursor writing MUST happen after you have successfully processed the message. Otherwise, you risk "skipping" data.
          const outputAsJson = output.toJson({ typeRegistry: registry });
          writeToStream({ output: outputAsJson, cursor });
        }
      };

      const blockUndoSignalHandler = (response: BlockUndoSignal) => {
        const lastValidBlock = response.lastValidBlock;
        const lastValidCursor = response.lastValidCursor;

        /* The blockchain you are streaming from undo 1 or more blocks and you must now handle that case.
          The field `response.message.<last_valid_block>` contains the last valid block, you must undo whatever
          has been done prior that (so for data where `block_number > last_valid_block`). Once undo, you must also
          write the `response.message.<last_valid_cursor>`. In this example, we just print the undo signal and write the cursor.
        */
        console.log(
          `Blockchain undo 1 or more blocks, returning to valid block #${lastValidBlock?.number} (${lastValidBlock?.id})`
        );

        writeToStream({ undo: lastValidCursor });
      };

      const progressHandler = (message: ModulesProgress) => {
        writeToStream({ progress: message });
      };

      const handlers = new Handlers(
        blockScopeDataHandler,
        blockUndoSignalHandler,
        progressHandler
      );

      try {
        await startSubstreams(handlers, spkgBuffer);
      } catch (error) {
        writeToStream({ error: 'Internal Server Error' });
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
