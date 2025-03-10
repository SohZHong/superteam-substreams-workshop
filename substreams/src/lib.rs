mod pb;
use pb::mydata::v1 as mydata;
use substreams::store::{StoreAdd, StoreAddInt64, StoreGet, StoreGetInt64, StoreNew};
use substreams_solana::pb::sf::solana::r#type::v1::{Block, ConfirmedTransaction};
#[substreams::handlers::store]
fn tx_counter(blk: Block, store: StoreAddInt64) {
    let tx_count = blk.transactions.len() as i64;

    // Store transaction count with block slot as the key
    store.add(0, &blk.slot.to_string(), tx_count);
}

#[substreams::handlers::map]
fn tx_counter_view(block: Block, store: StoreGetInt64) -> mydata::MyData {
    
    // Get the latest block slot as a string key
    let latest_slot: String = block.slot.to_string();

    // Get transaction count
    let count: i64 = store.get_last(&latest_slot).unwrap_or(0); // Default to 0 if no value exists

    // Extract block hash
    let block_hash = block.blockhash.clone();

    let block_timestamp = block.block_time.unwrap().timestamp as u64;
   
    // Calculate instruction count from transactions
    let instructions_len: u64 = block
        .transactions
        .iter()
        .map(|tx: &ConfirmedTransaction| tx.transaction.iter().count() as u64)
        .sum(); // Sum up instructions from all transactions

    // Construct MyData with all required fields
    mydata::MyData {
        block_hash,
        block_slot: block.slot,
        block_timestamp,
        transactions_len: count as u64,
        instructions_len, // Total instruction count
    }
}