'use client';

import { BASIC_PROGRAM_ID as programId, getBasicProgram } from '@project/anchor'
import { AnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useMutation, useQuery } from '@tanstack/react-query'

import { Transaction } from '@solana/web3.js';

import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
// import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'
import { AnchorProvider, web3 } from '@coral-xyz/anchor'
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import { TOKEN_METADATA_PROGRAM_ID } from '../stablesfun/constants';
import { BN } from 'bn.js'
import { getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { useMemo } from 'react';
import { useAnchorProvider } from '../solana/solana-provider';




export function useBasicProgram() {
  const { connection } = useConnection()
  const wallet = useWallet()
  // 3. Get the transaction toast component for displaying transaction messages
  const transactionToast = useTransactionToast();
  // 4. Get the Anchor provider
  // const provider = useAnchorProvider(); // woking 
  const provider = useAnchorProvider();
  const program = getBasicProgram(provider!);

  // Add null check for provider
 
  // 5. Log current cluster, connection URL, and program ID
  // console.log("Current cluster:", cluster);
  // console.log("Connection URL:", connection.rpcEndpoint);
  // console.log("Program ID:", programId.toString());

  // 6. Get the Basic program using the Anchor provider

  // console.log("Program's programId:", program.programId.toString());
  // console.log("Program IDL:", program.idl);
  // console.log("Program address from IDL:", program.idl.address);

   // 7. Mutation hook to create a stable coin
   const createStableCoin = useMutation({
    mutationKey: ['basic', 'createStableCoin', {  }],
    mutationFn: async ({ params, currency, image, description, coinType }: {
      params: { name: string; symbol: string; uri: string; decimals: number };
      currency: string;
      image: string;
      description: string;
      coinType: string;
    }) => {
      // 8. Throw an error if the wallet is not connected
      if (!provider.publicKey) throw new Error('Wallet not connected');

      // 9. Find the Program Derived Address (PDA) for the mint
      const [mintPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("COIN_MINT"),
          provider.publicKey.toBuffer(),
          Buffer.from(params.symbol)
        ],
        program.programId
      );

      // 10. Find the PDA for the metadata
      const [metadataAddress] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mintPDA.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
      );

      // 11. Find the PDA for the coin account
      const [coinAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("COIN_ACCOUNT"), mintPDA.toBuffer()],
        program.programId
      );

      // Find the PDA for the treasury account
      const [treasuryPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("TREASURY3")],
        program.programId
      );

      // 12. Build the transaction to create a token
      const transaction = await program.methods
        .createToken(params, currency, image, description, coinType)
        .accounts({
          metadata: metadataAddress,
          mint: mintPDA,
          payer: provider.publicKey,
          rent: web3.SYSVAR_RENT_PUBKEY,
          systemProgram: web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
          coinAccount,
          treasury: treasuryPDA,
        } as any)
        .transaction();

      // 13. Return transaction details and PDAs
      return {
        transaction,
        mint: mintPDA.toBase58(),
        metadataAddress: metadataAddress.toBase58(),
        coinAccount: coinAccount.toBase58(),
        treasury: treasuryPDA.toBase58(),
      };
    },

    onSuccess: () => {
      transactionToast("sending transaction");
    },
 
    onError: (error) => {
      console.error('Detailed error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to initialize coin');
    },
  });

  const mintCoins = useMutation({
    mutationKey: ['basic', 'mintCoins', {  }],
    mutationFn: async ({
      solAmount,
      mint,
      bondMint,
      treasuryBondAta,
      feed
    }: {
      solAmount: number;
      mint: PublicKey;
      bondMint: PublicKey;
      treasuryBondAta: PublicKey;
      feed: PublicKey;
    }) => {
     
      if (!provider.publicKey) throw new Error('Wallet not connected');

   
      const [coinAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("COIN_ACCOUNT"), mint.toBuffer()],
        program.programId
      );
      console.log("coinAccount-basic", coinAccount.toBase58());
    
      const destination = await getAssociatedTokenAddress(
        mint,
        provider.publicKey,
      );
      console.log("destination-basic", destination.toBase58());
      
      const [treasury] = PublicKey.findProgramAddressSync(
        [Buffer.from("TREASURY3")],
        program.programId
      );
      console.log("treasury-basic", treasury.toBase58());

    
      const coinAccountBondAta = await getAssociatedTokenAddress(
        bondMint,
        coinAccount,
        true,
        TOKEN_2022_PROGRAM_ID
      );
      console.log("coinAccountBondAta-basic", coinAccountBondAta.toBase58());

     
      const solAmountLamports = new BN(solAmount * web3.LAMPORTS_PER_SOL);

    
      // const createCoinAccountBondAtaInstruction = createAssociatedTokenAccountInstruction(
      //   provider.publicKey, // 24. Payer to create the ATA
      //   coinAccountBondAta, // 25. The ATA to be created
      //   coinAccount, // 26. Owner of the ATA (CoinAccount)
      //   bondMint, // 27. Mint of the bond token
      //   TOKEN_2022_PROGRAM_ID // 28. Token 2022 program ID
      // );

   
      const accounts = {
        mint,  // Stablecoin mint (SPL Token)
        destination, // User's ATA for the stablecoin
        payer: provider.publicKey, // User's public key
        feed, // Switchboard price feed
        rent: web3.SYSVAR_RENT_PUBKEY, // Rent sysvar
        systemProgram: web3.SystemProgram.programId, // System program
        tokenProgram: TOKEN_PROGRAM_ID, // 36. SPL Token program for stablecoin minting
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID, // Associated Token program
        coinAccount, // CoinAccount PDA
        treasury, // Treasury PDA
        bondMint, // Bond token mint (Token 2022)
        treasuryBondAta, // Treasury's ATA for bond tokens
        coinAccountBondAta, // CoinAccount's ATA for bond tokens
      };

      
      console.log("Accounts in mintCoins mutation:", accounts);

      const mintTokensInstruction = await program.methods
        .tokensMint(solAmountLamports)
        .accounts(accounts)
        .instruction();

 
      const transaction = new Transaction().add(
        // createCoinAccountBondAtaInstruction, 
        mintTokensInstruction 
      );

   
      return { transaction }; 
    },
    onSuccess: (data) => { //
      
      toast.success('Transaction created successfully, ready to sign.');
    },
    onError: (error) => { 
      console.error('Detailed error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create transaction');
    },
  });

  const burnCoins = useMutation({
    mutationKey: ['basic', 'tokensBurn', {}],
    mutationFn: async ({
      amount,
      mint,
      bondMint,
      treasuryBondAta,
      feed,
      userStablecoinAta
    }: {
      amount: number;
      mint: PublicKey;
      bondMint: PublicKey;
      treasuryBondAta: PublicKey;
      feed: PublicKey;
      userStablecoinAta: PublicKey;
    }) => {
      if (!provider.publicKey) throw new Error('Wallet not connected');

      // 1. Derive the CoinAccount PDA
      const [coinAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("COIN_ACCOUNT"), mint.toBuffer()],
        program.programId
      );
      console.log("coinAccount-basic", coinAccount.toBase58());

      // 2. Derive the treasury PDA
      const [treasury] = PublicKey.findProgramAddressSync(
        [Buffer.from("TREASURY3")], // Ensure this matches your on-chain code
        program.programId
      );
      console.log("treasury-basic", treasury.toBase58());

      // 3. Get the CoinAccount's ATA for the bond token (Token 2022)
      const coinAccountBondAta = await getAssociatedTokenAddress(
        bondMint,
        coinAccount,
        true, // Allow owner off-curve (important for PDAs)
        TOKEN_2022_PROGRAM_ID
      );
      console.log("coinAccountBondAta-basic", coinAccountBondAta.toBase58());

      // Get the user's ATA for the stablecoin (Token)
      const userStablecoinAtaAddress = getAssociatedTokenAddressSync(
        mint,
        provider.publicKey,
        false,
        TOKEN_PROGRAM_ID
      );
      console.log("userStablecoinAta-basic", userStablecoinAtaAddress.toBase58());

      // 4. Derive the sol_transfer PDA
      const [solTransferPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("sol_transfer"),
          provider.publicKey.toBuffer()
        ],
        program.programId
      );
      console.log("solTransferPda-basic", solTransferPda.toBase58());

      // 5. Define accounts for the burning transaction
      const accounts = {
        mint,  
        payer: provider.publicKey,
        feed,
        userStablecoinAta: userStablecoinAtaAddress,
        coinAccount,
        treasury,
        bondMint,
        treasuryBondAta,
        coinAccountBondAta,
        solTransfer: solTransferPda, // Add the sol_transfer PDA
        systemProgram: web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        tokenProgram2022: TOKEN_2022_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: web3.SYSVAR_RENT_PUBKEY,
      };

      // 6. Fetch the user's stablecoin balance to check if enough to burn
      const tokenBalance = await provider.connection.getTokenAccountBalance(userStablecoinAta);
      const currentBalance = Number(tokenBalance.value.amount);
      const amountToBurn = amount * Math.pow(10, tokenBalance.value.decimals); 

      console.log("currentBalance", currentBalance);
      console.log("amountToBurn", amountToBurn);  
      console.log("tokenBalance.value.decimals", tokenBalance.value.decimals);

      if (currentBalance < amountToBurn) {
        throw new Error(`Insufficient token balance. You have ${currentBalance / Math.pow(10, tokenBalance.value.decimals)} tokens`);
      }

      // 7. Convert amount to atomic units (using BN for precision)
      const amountAtomic = new BN(amountToBurn);

      // 8. Log accounts for debugging
      console.log("Accounts in burnCoins mutation:", accounts);

      // 9. Build the instruction to burn tokens
      const burnTokensInstruction = await program.methods
        .tokensBurn(amountAtomic)
        .accounts(accounts)
        .instruction();

      // 10. Create a new transaction
      const transaction = new Transaction().add(burnTokensInstruction);

      // 11. Return the transaction object
      return { transaction };
    },
    onSuccess: (data) => {
      toast.success('Transaction created successfully, ready to sign.');
    },
    onError: (error) => {
      console.error('Detailed error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create transaction');
    },
  });

  

 
  const getCoinAccount = useQuery({
    queryKey: ['basic', 'getCoinAccount', {}],
    queryFn: async () => {
      try {
        const accounts = await provider.connection.getProgramAccounts(program.programId);

        const excludedAccounts = [
          "FQBv64kBMVAcAJx3daSrNzQsxiBievK1CfBttGobeLYr", //treasury account
          "5BHfykJojo2LnFwmLq9fZruysQALfPtLtdrefzza1Dgz" 
        ];

        console.log("Excluded accounts:", excludedAccounts);

        const coinAccounts = await Promise.all(
          accounts
            .filter((acc) => !excludedAccounts.includes(acc.pubkey.toBase58())) // Filter out excluded accounts
            .map(async (acc) => {
              try {
                const coin = await program.account.coinAccount.fetch(acc.pubkey);
                return {
                  ...coin,
                  pubkey: acc.pubkey.toBase58(),
                };
              } catch (error) {
                console.error("Error processing coin account:", error, "Account:", acc.pubkey.toBase58());
                return null;
              }
            })
        );

        return coinAccounts.filter((c) => c !== null);
      } catch (error) {
        console.error("Error fetching coin accounts:", error);
        throw error;
      }
    },
  });

  // 36. Return the program, program ID, mutations, and query
  return {
    program,
    programId,
    createStableCoin,
    getCoinAccount,
    mintCoins,
    burnCoins
  };
}
