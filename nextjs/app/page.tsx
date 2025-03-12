'use client';
import { useEffect, useState } from 'react';
import {
  BlockScopedData,
  BlockUndoSignal,
  ModulesProgress,
} from '@substreams/core/proto';
import { IMessageTypeRegistry } from '@bufbuild/protobuf';
import { getCursor, writeCursor } from '@/substreams/cursor';
import { startSubstreams } from '@/substreams/main';
import { Handlers } from '@/substreams/types';
import { SPKG } from '@/substreams/constants';

export default function Home() {
  // Keep state of errors
  const [error, setError] = useState<unknown>();

  // Store blocks on a queue
  const [blocks, setBlocks] = useState<string[]>([]);

  // Keep state of cursor
  const [cursor, setCursor] = useState<string>();

  // Store spkg file
  const [spkg, setSpkg] = useState<Buffer<ArrayBufferLike>>();

  const blockScopeDataHandler = (
    response: BlockScopedData,
    registry: IMessageTypeRegistry
  ) => {
    const output = response.output?.mapOutput;
    const cursor = response.cursor;

    if (output !== undefined) {
      const message = output.unpack(registry);
      if (message === undefined) {
        throw new Error(`Failed to unpack output of type ${output.typeUrl}`);
      }

      // Cursor writing MUST happen after you have successfully processed the message. Otherwise, you risk "skipping" data.
      const outputAsJson = output.toJson({ typeRegistry: registry });

      // Add output to the queue
      setBlocks((prev) => [...prev, JSON.stringify(outputAsJson)]);

      writeCursor(cursor);
      setCursor(cursor);
    }
  };

  /*
      Handle BlockUndoSignal messages.
      You will receive this message after a fork has happened in the blockchain.

      Because of the fork, you have probably read incorrect blocks in the "handleBlockScopedDataMessage" function,
      so you must rewind back to the last valid block.
  */
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

    writeCursor(lastValidCursor);
  };

  const progressHandler = (message: ModulesProgress) => {
    console.log(`Progress: ${JSON.stringify(message)}`);
  };

  const createHandlers = (): Handlers => {
    return new Handlers(
      blockScopeDataHandler,
      blockUndoSignalHandler,
      progressHandler
    );
  };

  useEffect(() => {
    // const executeSubstreams = async () => {
    //   try {
    //     if (!spkg) throw new Error('SPKG File is not loaded');
    //     console.log('Starting substreams');
    //     await startSubstreams(createHandlers(), spkg);
    //   } catch (e) {
    //     setError(e);
    //     console.log(e);
    //   }
    // };

    const fetchSpkg = async () => {
      try {
        const response = await fetch(`/spkgs/${SPKG}`);
        const arrayBuffer = await response.arrayBuffer();
        setSpkg(Buffer.from(arrayBuffer));
        console.log('Substreams: ', Buffer.from(arrayBuffer));
        await startSubstreams(createHandlers(), Buffer.from(arrayBuffer));
      } catch (error) {
        console.error('Failed to fetch SPKG:', error);
      }
    };

    fetchSpkg();

    setCursor(getCursor() ?? undefined);
    // executeSubstreams();

    return () => {
      console.log('Stopping substreams (component unmounted)');
    };
  }, []);

  return (
    <div style={{ width: '100%' }}>
      {error != null && <div>{JSON.stringify(error)}</div>}
      {error == null && (
        <>
          <h3>Consuming Substreams package</h3>
          <div>
            <h4>Last Committed Cursor:</h4> <i>{cursor ?? <>-</>}</i>
            <h4>Blocks:</h4>
          </div>
          <div style={{ overflow: 'scroll' }}>
            {blocks.map((block, idx) => (
              <div key={idx}>{block}</div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
