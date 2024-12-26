#!/bin/bash

echo "Deploying smart contract to Solana Devnet..."
solana program deploy ./smart_contracts/target/deploy/solpay.so
