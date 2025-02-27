"use client";
import { BASIC_PROGRAM_ID as programId, getBasicProgram } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { useMutation, useQuery } from '@tanstack/react-query'

import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'

import { useState, useEffect } from 'react' 
import Link from 'next/link'
import { PublicKey } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'
import { TokenCard } from '../ui/token-card'

interface CoinData {
  balance: BN
  mint: PublicKey
  bump: number
  symbol: string
  name: string
  coinType: string
  currency: string
  uri: string
  image: string
  description: string
}

export default function DashboardFeature() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const program = getBasicProgram(provider);
  const [isLoading, setIsLoading] = useState(false);
  const [coins, setCoins] = useState<(CoinData & { pubkey: string })[]>([]);

  useEffect(() => {
    fetchAllCoins();
  }, []);

  const fetchAllCoins = async () => {
    setIsLoading(true);
    try {
      const accounts = await connection.getProgramAccounts(program.programId);

      const excludedAccounts = [
        "FQBv64kBMVAcAJx3daSrNzQsxiBievK1CfBttGobeLYr", 
        "5BHfykJojo2LnFwmLq9fZruysQALfPtLtdrefzza1Dgz"
      ];

      const coinAccounts = await Promise.all(
        accounts
          .filter((acc) => !excludedAccounts.includes(acc.pubkey.toBase58())) 
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

      setCoins(
        coinAccounts.filter((c): c is CoinData & { pubkey: string } =>
          c !== null && 'pubkey' in c && 'mint' in c && 'coinType' in c
        )
      );
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast.error('Failed to fetch coins');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      {isLoading ? (
        <div className="flex justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {coins.map((coin) => (
            <Link 
              href={`/stablecoins/${coin.mint}`} 
              key={coin.pubkey}
            >
              <TokenCard
                imageSrc={coin.image}
                altText={coin.name}
                title={coin.name}
                description={coin.description}
                mintAddress={coin.mint.toBase58()}
                currency={coin.currency}
                symbol={coin.symbol}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
