mod pb;
use pb::mydata::v1 as mydata;

use substreams::store::{StoreAdd, StoreAddInt64, StoreGet, StoreGetInt64, StoreNew};
use substreams_solana::pb::sf::solana::r#type::v1::Block;

#[substreams::handlers::store]
fn tx_store(blk: Block, store: StoreAddInt64) {
    // Iterate through all transactions in the block
    for tx in blk.transactions {
        // Check if the transaction is confirmed
        if let Some(confirmed_tx) = &tx.transaction {
            // Store the transaction ID with a value of 1 (acting as a counter)
            store.add(0, confirmed_tx.id(), 1);
        }
    }
}

#[substreams::handlers::map]
fn map_my_data(blk: Block, store: StoreGetInt64) -> mydata::MyData {
    let mut my_data = mydata::MyData::default(); // Initialize a new MyData struct

    // Store basic block information
    my_data.block_hash = blk.blockhash.to_string();
    my_data.block_slot = blk.slot;
    my_data.block_timestamp = blk.block_time.clone().unwrap_or_default().timestamp as u64;

    // Store the number of transactions and instructions in the block
    my_data.transactions_len = blk.transactions.len() as u64;
    my_data.instructions_len = blk.walk_instructions().count() as u64;

    let mut total_tx_count: i64 = 0; // Initialize transaction count accumulator

    // Iterate through all transactions in the block
    for tx in blk.transactions {
        // Retrieve the stored transaction count from the store, defaulting to 0 if not found
        let tx_count = store.get_at(0, tx.id()).unwrap_or(0);
        total_tx_count += tx_count; // Accumulate the transaction count
    }

    // Store the total transaction count in the MyData struct
    my_data.store_transaction_val = total_tx_count as u64;

    my_data // Return the populated MyData struct
}