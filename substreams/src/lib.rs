mod pb;
use substreams::store::{StoreAdd, StoreAddInt64, StoreNew};
use substreams_solana::pb::sf::solana::r#type::v1::Block;
#[substreams::handlers::store]
fn tx_counter(blk: Block, store: StoreAddInt64) {
    let tx_count = blk.transactions.len() as i64;

    // Store transaction count with block slot as the key
    store.add(0, &blk.slot.to_string(), tx_count);
}