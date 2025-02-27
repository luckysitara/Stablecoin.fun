'use client'

import { useEffect, useState, useRef, useCallback } from 'react';
import { PublicKey, Keypair } from '@solana/web3.js';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { WalletButton } from '@/components/solana/solana-provider';
import ReactCanvasConfetti from 'react-canvas-confetti';
import type { CreateTypes } from 'canvas-confetti';
import { ellipsify } from '@/components/ui/ui-layout';
import { useBasicProgram } from '@/components/basic/basic-data-access';
import { getAssociatedTokenAddress, getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";



const COIN_ACCOUNT_SEED = Buffer.from('COIN_ACCOUNT');

export default function StablecoinPage() {
  
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const { mintAddress } = useParams();
 
  const [mintData, setMintData] = useState<any>(null);
  const refConfetti = useRef<CreateTypes | null>(null);
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState(0);
  const [burnAmount, setBurnAmount] = useState(0);
  const [treasury, setTreasury] = useState<PublicKey | null>(null);
  const [bond_ata, setBond_ata] = useState<PublicKey | null>(null);
  const [userStablecoinAta, setUserStablecoinAta] = useState<PublicKey | null>(null);
 // load programs 
  const { program, getCoinAccount, mintCoins, burnCoins } = useBasicProgram();

  // bond mint and feed public keys
  const bondMint = new PublicKey("A433vq62iQbDToDeZ3XZcWj1VWFHYB95SYwnZgSoEmXy");
  const feed = new PublicKey("66bVyxuQ6a4XCAqQHWoiCbG6wjZsZkHgwbGVY7NqQjS5");
  
  

    
  async function derivePDAs() {
    
  }

  // Function to handle minting of tokens
  const handleMint = async () => {
if (!publicKey) {
  toast.error("Wallet not connected");
  return;
}
    
    const [derivedTreasury] = PublicKey.findProgramAddressSync(
      [Buffer.from("TREASURY3")],
      program.programId
    );
    setTreasury(derivedTreasury);

    console.log("derivedTreasury", derivedTreasury.toBase58());

    const derivedBondAta = getAssociatedTokenAddressSync(
      bondMint,
      derivedTreasury,
      true,
      TOKEN_2022_PROGRAM_ID
    );
    setBond_ata(derivedBondAta);
    console.log("derivedBondAta", derivedBondAta.toBase58());

    const mintPublicKey = new PublicKey(mintAddress);
    const derivedUserStablecoinAta = await getAssociatedTokenAddress(
      mintPublicKey,
      publicKey,
      false, 
      TOKEN_PROGRAM_ID
    );
    setUserStablecoinAta(derivedUserStablecoinAta);
    console.log("derivedUserStablecoinAta", derivedUserStablecoinAta.toBase58());



    if (!publicKey || !mintAddress || !treasury || !bond_ata) {
      toast.error("Wallet not connected or required data is missing.");
      return;
    }
  
    console.log("Starting minting process...");
    console.log("Public Key:", publicKey.toBase58());
    console.log("Mint Address:", mintAddress);
    console.log("Amount:", amount);
  
    try {
      // Determine the correct mint to use
      const mint = new PublicKey(mintAddress);
  
      console.log("Treasury", treasury.toBase58());
      console.log("bond_ata", bond_ata.toBase58());
  
    
      const { transaction } = await mintCoins.mutateAsync({
        solAmount: amount,
        mint,
        bondMint,
        treasuryBondAta: bond_ata,
        feed
      });
      
      // Get latest blockhash and set fee payer
      const latestBlockhash = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = latestBlockhash.blockhash;
      transaction.feePayer = publicKey;
  
      // if (!signTransaction) {
      //     throw new Error('Wallet does not support transaction signing');
      // }
      // const signedTransaction = await signTransaction(transaction)
  
 
      const simulation = await connection.simulateTransaction(transaction);
      console.log('Simulation result:', simulation.value);
  
      if (simulation.value.err) {
          throw new Error(`Simulation failed: ${JSON.stringify(simulation.value.err)}`);
      }
  

      const signature = await sendTransaction(transaction, connection, {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
          maxRetries: 3,
      });
  
      toast.success('Successfully Minted!');
      fire();
    } catch (error) {
      console.error("Error during minting:", error);
      toast.error(`Failed to mint tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };


  /// burn 
  const handleBurn = async () => {
    
    if (!publicKey) {
  toast.error("Wallet not connected");
  return;
}
    
    const [derivedTreasury] = PublicKey.findProgramAddressSync(
      [Buffer.from("TREASURY3")],
      program.programId
    );
    setTreasury(derivedTreasury);

    console.log("derivedTreasury", derivedTreasury.toBase58());

    const derivedBondAta = getAssociatedTokenAddressSync(
      bondMint,
      derivedTreasury,
      true,
      TOKEN_2022_PROGRAM_ID
    );
    setBond_ata(derivedBondAta);
    console.log("derivedBondAta", derivedBondAta.toBase58());

    const mintPublicKey = new PublicKey(mintAddress);
    const derivedUserStablecoinAta = await getAssociatedTokenAddress(
      mintPublicKey,
      publicKey,
      false, 
      TOKEN_PROGRAM_ID
    );
    setUserStablecoinAta(derivedUserStablecoinAta);
    console.log("derivedUserStablecoinAta", derivedUserStablecoinAta.toBase58());

  if (!publicKey || !mintAddress || !treasury || !bond_ata) {
    toast.error("Wallet not connected or required data is missing.");
    return;
  }

  console.log("Starting minting process...");
  console.log("Public Key:", publicKey.toBase58());
  console.log("Mint Address:", mintAddress);
  console.log("Amount:", amount);

  try {
    // Determine the correct mint to use
    const mint = new PublicKey(mintAddress);

    console.log("Treasury", treasury.toBase58());
    console.log("bond_ata", bond_ata.toBase58());

    

  
    const { transaction } = await burnCoins.mutateAsync({
      amount: burnAmount,
      bondMint,
      mint,
      treasuryBondAta: bond_ata,
      feed,
      userStablecoinAta: userStablecoinAta!
  });
    
    // Get latest blockhash and set fee payer
    const latestBlockhash = await connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = latestBlockhash.blockhash;
    transaction.feePayer = publicKey;

    // if (!signTransaction) {
    //     throw new Error('Wallet does not support transaction signing');
    // }
    // const signedTransaction = await signTransaction(transaction)


    const simulation = await connection.simulateTransaction(transaction);
    console.log('Simulation result:', simulation.value);

    if (simulation.value.err) {
        throw new Error(`Simulation failed: ${JSON.stringify(simulation.value.err)}`);
    }


    const signature = await sendTransaction(transaction, connection, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
        maxRetries: 3,
    });

    toast.success('Successfully Burned!');
    fire();
  } catch (error) {
    console.error("Error during minting:", error);
    toast.error(`Failed to mint tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};



  const makeShot = useCallback((particleRatio: number, opts: any) => {
    refConfetti.current?.({
      ...opts,
      origin: { y: 0.7 },
      particleCount: Math.floor(200 * particleRatio)
    });
  }, []);

  const fire = useCallback(() => {
    makeShot(0.25, { spread: 26, startVelocity: 55 });
    makeShot(0.2, { spread: 60 });
    makeShot(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    makeShot(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    makeShot(0.1, { spread: 120, startVelocity: 45 });
  }, [makeShot]);

  // fetch mint data
  useEffect(() => {
    const fetchMintData = async () => {
          
          const [derivedTreasury] = PublicKey.findProgramAddressSync(
            [Buffer.from("TREASURY3")],
            program.programId
          );
          setTreasury(derivedTreasury);
      
          console.log("derivedTreasury", derivedTreasury.toBase58());
      
          const derivedBondAta = getAssociatedTokenAddressSync(
            bondMint,
            derivedTreasury,
            true,
            TOKEN_2022_PROGRAM_ID
          );
          setBond_ata(derivedBondAta);
          console.log("derivedBondAta", derivedBondAta.toBase58());
      
          const mintPublicKey = new PublicKey(mintAddress);
          
      
      
      if (!mintAddress || !program ) return;
  
      try {
        const mintPublicKey = new PublicKey(mintAddress);
  
       
        const [coinAccountPDA] = PublicKey.findProgramAddressSync(
          [COIN_ACCOUNT_SEED, mintPublicKey.toBuffer()],
          program.programId
        );
  
      
        const coinAccountData = await program.account.coinAccount.fetch(coinAccountPDA);
  
        if (coinAccountData) {
          setMintData({
            mintAddress: mintAddress,
            symbol: coinAccountData.symbol,
            name: coinAccountData.name,
            image: coinAccountData.image,
            description: coinAccountData.description,
            currency: coinAccountData.currency,
            decimals: 9, // 16. Set your default decimals
            supply: coinAccountData.balance.toString(),
          });
        }
      } catch (error) {
        console.error('Error fetching mint data:', error);
        toast.error('Failed to load token data');
      }
    };
  
    fetchMintData();
  }, [mintAddress,]);

 
  const isLoading = getCoinAccount.isLoading || getCoinAccount.isFetching;
  const isError = getCoinAccount.isError;

const error = getCoinAccount.error;

 
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

 
  if (isError) {
    return (
      <div className="alert alert-error">
        <span>Error: {error instanceof Error ? error.message : 'Unknown error'}</span>
      </div>
    );
  }

  
  if (!mintData) {
    return null; 
  }



  return (
    <div className="p-8">

      <ReactCanvasConfetti
        onInit={(instance: { confetti: CreateTypes }) => {
          refConfetti.current = instance.confetti;
        }}
        style={{
          position: 'fixed',
          pointerEvents: 'none',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          zIndex: 50
        }}
      />

      <Link href="/" className="text-3xl font-bold mb-4 block hover:underline">&larr; Back</Link>
      <div className='flex flex-row p-4 gap-4'>
        <div className="w-2/3">
          <div className='flex flex flex-col  gap-4'>

     
            {mintData.image && (
              <div className="">
                <img
                  src={mintData.image}
                  alt={`${mintData.symbol} token`}
                  className="object-cover"
                />
              </div>
            )}

     
            <div>
              <h1 className="text-2xl font-bold mb-4">{mintData.name}</h1>
              <h1 className="text-lg mb-4">{mintData.description}</h1>
            </div>

 
            <div className="stats stats-horizontal bg-wild-cream border border-black ">
              <div className="stat">
                <div className="stat-title">Symbol</div>
                <div className="stat-value">{mintData.symbol}</div>
              </div>

              <div className="stat">
                <div className="stat-title">Total Supply</div>
                <div className="stat-value">{(Number(mintData.supply) / 10 ** mintData.decimals).toLocaleString()}</div>
                <div className="stat-desc">Decimals: {mintData.decimals}</div>
              </div>
            </div>

     
            <div className="font-mono">mint <br />{mintData.mintAddress}</div>

          </div>
        </div>
        <div className="w-1/3">

          <div className="bg-wild-cream border border-black shadow-[5px_5px_0px_0px_rgba(0,0,0)] w-full max-w-md">

            {!publicKey ? (
              <div className="space-y-4 p-4 min-h-[180px] flex items-center justify-center">
                <div className="">
                  <div className="text-2xl font-bold mb-2">Connect your wallet to mint or redeem tokens</div>
                  <div className="pt-5"><WalletButton style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }} /></div>
                </div>
              </div>
            ) : (
              <>
       
                <div role="tablist" className="tabs tabs-boxed">
                  <a
                    role="tab"
                    className={`tab ${activeTab === 'buy' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('buy')}
                  >
                    Buy
                  </a>
                  <a
                    role="tab"
                    className={`tab ${activeTab === 'sell' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('sell')}
                  >
                    Sell
                  </a>
                </div>

    
                {activeTab === 'buy' && (
                  <div className="space-y-4 p-4 min-h-[180px]">
                    <div className="text-2xl font-bold mb-4">BUY <br /> {mintData.symbol} STABLECOIN</div>
                    <div className="flex flex-col gap-2">
                      <div className="join w-full">
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(Number(e.target.value))}
                          placeholder="Enter amount"
                          className="input input-bordered join-item w-full"
                          step="0.000001"
                          min="0.00000000001"
                        />
              
                        <button
                          onClick={handleMint}
                          disabled={!publicKey}
                          className="btn btn-primary join-item"
                        >
                          {publicKey ? `Buy ${mintData.symbol}` : 'Connect Wallet'}
                        </button>
                      </div>
     
                      <div className="text-sm text-gray-600">
                        {amount > 0 ? `${amount} SOL → ${amount * 176} ${mintData.symbol}` : `Enter amount of SOL to buy ${mintData.symbol}`}
                      </div>
                    </div>
                  </div>
                )}

                {/*  Sell tab content */}
                {activeTab === 'sell' && (
                  <div className="space-y-4 p-4 min-h-[180px]">
                    <div className="text-2xl font-bold mb-4">SELL <br />{mintData.symbol} STABLECOIN</div>
                    <div className="flex flex-col gap-2">
                      <div className="join w-full">
                        <input
                          type="number"
                          value={burnAmount}
                          onChange={(e) => setBurnAmount(Number(e.target.value))}
                          placeholder="Enter amount"
                          className="input input-bordered join-item w-full"
                          step="0.000001"
                          min="0.00000000001"
                        />
                        <button
                          onClick={handleBurn}
                          disabled={!publicKey}
                          className="btn btn-primary join-item"
                        >
                          {publicKey ? `Sell ${mintData.symbol}` : 'Connect Wallet'}
                        </button>
                      </div>
    
                      <div className="text-sm text-gray-600">
                        {burnAmount > 0 ? `${burnAmount} ${mintData.symbol} → ${burnAmount / 176} SOL` : `Enter amount of ${mintData.symbol} to sell for SOL`}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}