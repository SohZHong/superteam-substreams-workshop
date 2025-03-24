mod pb;
use pb::{mydata::v1 as mydata, sf::substreams::solana::v1::Transactions};
use pb::sf::solana::r#type::v1::{ConfirmedTransaction, InnerInstruction, InnerInstructions, Transaction};

const JUP_TOKEN: &str = "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN";
const USDT_TOKEN: &str = "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB";

#[substreams::handlers::map]
fn map_my_data(transactions: Transactions) -> mydata::MyData {
    let mut my_data: mydata::MyData = mydata::MyData::default();

    my_data.jup = transactions
        .transactions
        .iter()
        .filter(|tx: &&ConfirmedTransaction| contains_transfer(*tx, JUP_TOKEN))
        .cloned()
        .collect();

    my_data.usdt = transactions
        .transactions
        .iter()
        .filter(|tx: &&ConfirmedTransaction| contains_transfer(*tx, USDT_TOKEN))
        .cloned()
        .collect();

    my_data
}

fn contains_transfer(tx: &ConfirmedTransaction, token: &str) -> bool {
    let Some(meta) = &tx.meta else { return false };

    meta.inner_instructions
        .iter()
        .flat_map(|i: &InnerInstructions| &i.instructions)
        .any(|instr: &InnerInstruction| is_token_transfer(instr, tx, token));
    return true;
}

fn is_token_transfer(instr: &InnerInstruction, tx: &ConfirmedTransaction, token: &str) -> bool {
    let Some(message) = tx.transaction.as_ref().and_then(|t: &Transaction| t.message.as_ref()) else {
        return false;
    };
    let token_bytes: &[u8] = token.as_bytes();

    instr.accounts.iter().any(|&index| {
        message.account_keys.get(index as usize)
            .map(|key: &Vec<u8>| key == token_bytes)
            .unwrap_or(false)
    })
}