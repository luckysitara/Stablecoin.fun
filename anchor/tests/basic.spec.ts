import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Basic } from '../target/types/basic';

import { AuthorityType, createAssociatedTokenAccount, createAssociatedTokenAccountInstruction, createSetAuthorityInstruction, createTransferCheckedInstruction, getAccount, setAuthority, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { PublicKey, Keypair, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";
import { SYSVAR_RENT_PUBKEY, Connection } from "@solana/web3.js";
import { useWallet } from '@solana/wallet-adapter-react'



// @ts-ignore
import { StablebondProgram } from "@etherfuse/stablebond-sdk";
import { Decimal } from "decimal.js";
import { describe, it } from '@jest/globals';
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { simulateTransaction } from '@coral-xyz/anchor/dist/cjs/utils/rpc';

describe('basic', () => {
  // Configure the client to use the local cluster.
  // anchor.setProvider(anchor.AnchorProvider.env());

  const payer = Keypair.fromSecretKey(
    Buffer.from(
      JSON.parse(
        require("fs").readFileSync(
          require("os").homedir() + "/.config/solana/id.json",
          "utf-8"
        )
      )
    )
  );

  const wallet = new anchor.Wallet(payer);
  const connection = new Connection("https://api.devnet.solana.com");
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);

  const program = anchor.workspace.Basic as Program<Basic>;


  // Define variables outside the test scope
  let bond_coin_mint = new PublicKey("A433vq62iQbDToDeZ3XZcWj1VWFHYB95SYwnZgSoEmXy");
  let bond_ata: PublicKey;
  let treasury: PublicKey;
  // Constants

  const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
  const TREASURY_SEED = "TREASURY3";
  const COIN_ACCOUNT_SEED = "COIN_ACCOUNT";
  const COIN_MINT_SEED = "COIN_MINT";
  const feed = new PublicKey("66bVyxuQ6a4XCAqQHWoiCbG6wjZsZkHgwbGVY7NqQjS5");
  const METADATA_SEED = "metadata";
  let mint: PublicKey;
  let mintPDA: PublicKey;
  let metadataAddress: PublicKey;
  let coinAccount: PublicKey;
  const symbol = "TEST"; // Define the symbol that will be used


  // only works once
  // it("Should initialize treasury", async () => {

  //   // Setup that needs to happen before all tests
  //   [treasury] = PublicKey.findProgramAddressSync(
  //     [Buffer.from("TREASURY3")],
  //     program.programId
  //   );

  //   console.log("Treasury PDA", treasury.toBase58());

  //   bond_ata = await getAssociatedTokenAddress(
  //     bond_coin_mint,
  //     treasury,
  //     true,
  //     TOKEN_2022_PROGRAM_ID
  //   );

  //   console.log("Treasurybond_ata", bond_ata.toBase58());


  //   try {
  //     const tx = await program.methods.initTreasury(
  //       bond_ata,
  //       bond_coin_mint,
  //     )
  //       .accounts({
  //         payer: wallet.publicKey,
  //         treasuryPda: treasury,
  //         systemProgram: anchor.web3.SystemProgram.programId,
  //       } as any)
  //       .rpc();

  //     console.log("Transaction signature:", tx);
  //   } catch (error) {
  //     console.error("Error:", error);
  //     throw error;
  //   }
  // });

  // it("should create the bondata", async () => {
  //   // Setup that needs to happen before all tests
  //   [treasury] = PublicKey.findProgramAddressSync(
  //     [Buffer.from("TREASURY3")],
  //     program.programId
  //   );

  //   console.log("Treasury PDA", treasury.toBase58());

  //   const createATAInstruction = await createAssociatedTokenAccountInstruction(
  //     wallet.publicKey,
  //     bond_ata,
  //     treasury,
  //     bond_coin_mint,
  //     TOKEN_2022_PROGRAM_ID
  //   );
  //   console.log("Treasurybond_ata", bond_ata.toBase58());

  //   const tx = new Transaction().add(createATAInstruction);

  //   const latestBlockhash = await connection.getLatestBlockhash('confirmed');
  //   tx.recentBlockhash = latestBlockhash.blockhash;

  //   const txHash = await connection.sendTransaction(tx, [payer]);

  //   console.log("Transaction signature:", txHash);


  // })

  it("Should get bonds list ", async () => {


    const bonds = await StablebondProgram.getBonds(
      "https://api.devnet.solana.com"
    );
    const bond = bonds[6];
    // console.log("Selected Bond:", bond);

    const stablebondProgram2 = new StablebondProgram(
      "https://api.devnet.solana.com",
      wallet
    );

    const mintBond = await stablebondProgram2.mintBond(
      bond.address,
      new Decimal(5.0)
    );
    console.log("Mint Bond:", mintBond);

    setTimeout(() => {
     ////
    }, 10000);

    const solanaAddress = bs58.encode(mintBond);
    console.log("Solana Address:", solanaAddress);


    const tx = await connection.getTransaction(solanaAddress, {
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0
    });
    console.log("Transaction:", tx);


  })

  it("should send the bonds to the treasury from user wallet", async () => {
   
      // Setup that needs to happen before all tests
      [treasury] = PublicKey.findProgramAddressSync(
        [Buffer.from("TREASURY3")],
        program.programId
      );
  
      console.log("Treasury PDA", treasury.toBase58());
  
      bond_ata = await getAssociatedTokenAddress(
        bond_coin_mint,
        treasury,
        true,
        TOKEN_2022_PROGRAM_ID
      );
  
      console.log("Treasurybond_ata", bond_ata.toBase58());

      //transfer checked bonds to treasury  
      const userWallet = wallet.publicKey;

      // Get the user's associated token account for the bond token
  const userBondAta = await getAssociatedTokenAddress(
    bond_coin_mint,
    userWallet,
    false,
    TOKEN_2022_PROGRAM_ID
  );

  console.log("User bond_ata", userBondAta.toBase58());

  //transfer checked bonds to treasury
  const amountToTransfer = 10000000; // 1 token with 6 decimals
  const decimals = 6;

  const transferIx = createTransferCheckedInstruction(
    userBondAta,
    bond_coin_mint,
    bond_ata,
    userWallet,
    amountToTransfer,
    decimals,
    [],
    TOKEN_2022_PROGRAM_ID
  );

  const tx = new Transaction().add(transferIx);
  const txSig = await sendAndConfirmTransaction(
    provider.connection,
    tx,
    [payer],
    { skipPreflight: false }
  );

  console.log("Transfer successful, TX:", txSig);

  // --- Get the balance of the treasury's bond ATA ---

  // Fetch the account info using getAccount
  const treasuryBondAtaAccount = await getAccount(
    provider.connection,
    bond_ata,
    "confirmed", 
    TOKEN_2022_PROGRAM_ID
  );

  // Log the balance
  console.log(
    "Treasury bond ATA balance:",
    treasuryBondAtaAccount.amount.toString()
  );
  }, 2000)
 

  // it("should create the bondata and transfer ownership", async () => {
  //   // Setup that needs to happen before all tests
  //   const [treasury] = PublicKey.findProgramAddressSync(
  //     [Buffer.from("TREASURY3")],
  //     program.programId
  //   );

  //   console.log("Treasury PDA", treasury.toBase58());

  //   const bond_ata = await getAssociatedTokenAddress(
  //     bond_coin_mint,
  //     treasury, // Use treasury as owner
  //     true,
  //     TOKEN_2022_PROGRAM_ID
  //   );


  //   console.log("Treasurybond_ata", bond_ata.toBase58());

  //   // Create the ATA for the treasury
  //   const createATAInstruction = createAssociatedTokenAccountInstruction(
  //     wallet.publicKey, // Payer
  //     bond_ata, // ATA to create
  //     treasury, // Owner (treasury)
  //     bond_coin_mint, // Mint
  //     TOKEN_2022_PROGRAM_ID
  //   );

  //   // Create the instruction to transfer ownership of the ATA to the treasury PDA
  //   const transferOwnershipInstruction = createSetAuthorityInstruction(
  //     bond_ata, // ATA to change the owner of
  //     payer.publicKey, // Current owner (your wallet)
  //     AuthorityType.AccountOwner, // Authority type (AccountOwner)
  //     treasury, // New owner (treasury PDA)
  //     [], // No multisig signers
  //     TOKEN_2022_PROGRAM_ID // Token 2022 program ID
  //   );

  //   // Create a transaction and add both instructions
  //   const tx = new Transaction().add(createATAInstruction, transferOwnershipInstruction);

  //   const latestBlockhash = await connection.getLatestBlockhash('confirmed');
  //   tx.recentBlockhash = latestBlockhash.blockhash;
  //   tx.feePayer = wallet.publicKey;

  //   // Send the transaction
  //   const txHash = await connection.sendTransaction(tx, [payer]);

  //   console.log("Transaction signature:", txHash);
  // });

//   it("should create the bondata", async () => {
   
  
//     // Derive the treasury PDA
//     const [treasury] = PublicKey.findProgramAddressSync(
//       [Buffer.from("TREASURY3")],
//       program.programId
//     );
  
//     console.log("Treasury PDA", treasury.toBase58()); // Log treasury
  
//     // Calculate the bond_ata (treasury's bond token ATA)
//     const bond_ata = await getAssociatedTokenAddress(
//       bond_coin_mint, // Your bond token mint (make sure this is defined)
//       treasury, // Owner of the ATA (treasury PDA)
//       true, // Allow PDA owner
//       TOKEN_2022_PROGRAM_ID // Token 2022 program ID
//     );
  
//     console.log("Treasurybond_ata", bond_ata.toBase58()); 
  

//     const createATAInstruction = createAssociatedTokenAccountInstruction(
//       wallet.publicKey, // Payer
//       bond_ata, // ATA to create
//       treasury, // Owner (treasury PDA)
//       bond_coin_mint, // Mint
//       TOKEN_2022_PROGRAM_ID // Token 2022 program ID
//     );
  

//     const tx = new Transaction().add(createATAInstruction);
  
//     const latestBlockhash = await connection.getLatestBlockhash('confirmed');
//     tx.recentBlockhash = latestBlockhash.blockhash;
//     tx.feePayer = payer.publicKey;

  

//     const txHash = await connection.sendTransaction(tx, [payer]); // Use 'payer' here
  
//     console.log("Transaction signature:", txHash);
//   });
  
// });


  // it("Should create token", async () => {

  //   // Setup that needs to happen before all tests
  //   [treasury] = PublicKey.findProgramAddressSync(
  //     [Buffer.from("TREASURY3")],
  //     program.programId
  //   );

  //   bond_coin_mint = new PublicKey("HELLjegdkkJeLeBhMKxCvbUVXJnLEiJyFKLJtjpX4c55");

  //   bond_ata = await getAssociatedTokenAddress(
  //     bond_coin_mint,
  //     treasury,
  //     true,
  //     TOKEN_2022_PROGRAM_ID
  //   );

  //   try {
  //     [mintPDA] = PublicKey.findProgramAddressSync(
  //       [
  //         Buffer.from(COIN_MINT_SEED),
  //         wallet.publicKey.toBuffer(), 
  //         Buffer.from(symbol)
  //       ],
  //       program.programId
  //     );
  //     console.log("mintPDA", mintPDA.toBase58());

  //     [metadataAddress] = PublicKey.findProgramAddressSync(
  //       [
  //         Buffer.from(METADATA_SEED),
  //         TOKEN_METADATA_PROGRAM_ID.toBuffer(),
  //         mintPDA.toBuffer(),
  //       ],
  //       TOKEN_METADATA_PROGRAM_ID
  //     );

  //     [coinAccount] = PublicKey.findProgramAddressSync(
  //       [Buffer.from(COIN_ACCOUNT_SEED), mintPDA.toBuffer()],
  //       program.programId
  //     );

  //     // Not needed for this test
  //     // const associatedTokenAccount = await getAssociatedTokenAddress(
  //     //   mintPDA,
  //     //   wallet.publicKey
  //     // );

  //     const initCoinParams = {
  //       name: "Test Coin",
  //       symbol: symbol,
  //       uri: "https://test.uri",
  //       decimals: 9,
  //     };

  //     const tx = await program.methods
  //       .createToken(
  //         initCoinParams,
  //         "USD", // currency
  //         "https://example.com/image.png", // image
  //         "Test coin description", // description
  //         "cryptocurrency" // coin_type
  //       )
  //       .accounts({
  //         metadata: metadataAddress,
  //         mint: mintPDA,
  //         payer: wallet.publicKey,
  //         rent: SYSVAR_RENT_PUBKEY,
  //         systemProgram: SYSTEM_PROGRAM_ID,
  //         tokenProgram: TOKEN_PROGRAM_ID,
  //         tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
  //         coinAccount: coinAccount,
  //       } as any)
  //       .rpc();

  //     console.log("Transaction signature:", tx);
  //   } catch (error) {
  //     console.error("Error:", error);
  //     throw error;
  //   }
  // });

  
})
