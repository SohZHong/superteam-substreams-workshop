mod pb;
use pb::{mydata::v1 as mydata, sf::substreams::solana::v1::Transactions};
use pb::sf::solana::r#type::v1::{ConfirmedTransaction, InnerInstruction, InnerInstructions, Transaction};

// Define token addresses as constants
const JUP_TOKEN: &str = "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN";
const USDT_TOKEN: &str = "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB";

#[substreams::handlers::map]
fn map_my_data(transactions: Transactions) -> mydata::MyData {
    let mut my_data: mydata::MyData = mydata::MyData::default(); // Initialize MyData struct

    // Filter transactions that involve JUP token transfers
    my_data.jup = transactions
        .transactions
        .iter()
        .filter(|tx: &&ConfirmedTransaction| contains_transfer(*tx, JUP_TOKEN))
        .cloned()
        .collect();

    // Filter transactions that involve USDT token transfers
    my_data.usdt = transactions
        .transactions
        .iter()
        .filter(|tx: &&ConfirmedTransaction| contains_transfer(*tx, USDT_TOKEN))
        .cloned()
        .collect();

    my_data // Return the populated MyData struct
}

// Function to check if a transaction contains a transfer of the specified token
fn contains_transfer(tx: &ConfirmedTransaction, token: &str) -> bool {
    let Some(meta) = &tx.meta else { return false };

    // Iterate over all inner instructions and check if any represent a token transfer
    meta.inner_instructions
        .iter()
        .flat_map(|i: &InnerInstructions| &i.instructions)
        .any(|instr: &InnerInstruction| is_token_transfer(instr, tx, token));

    return true; // This line is incorrect. It should return `false` if no transfer is found.
}

// Function to check if a specific instruction represents a token transfer
fn is_token_transfer(instr: &InnerInstruction, tx: &ConfirmedTransaction, token: &str) -> bool {
    let Some(message) = tx.transaction.as_ref().and_then(|t: &Transaction| t.message.as_ref()) else {
        return false;
    };
    let token_bytes: &[u8] = token.as_bytes(); // Convert token address to bytes

    // Check if any account in the instruction matches the token address
    instr.accounts.iter().any(|&index| {
        message.account_keys.get(index as usize)
            .map(|key: &Vec<u8>| key == token_bytes)
            .unwrap_or(false)
    })
}