"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "@/components/solana/solana-provider";
import Link from 'next/link';
import { Decimal } from "decimal.js";
// @ts-ignore
import { StablebondProgram } from "@etherfuse/stablebond-sdk"; 
import toast from "react-hot-toast";
import { useConnection } from "@solana/wallet-adapter-react";
import bs58 from "bs58";

export default function Page() {
  const { publicKey, connected, wallet } = useWallet();
  const { connection } = useConnection();
  const [isClient, setIsClient] = useState(false);
  const [amount, setAmount] = useState<number>(50);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  const handleBuyBond = async () => {
    if (!publicKey || !wallet) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setIsLoading(true);
      
  
      // Get bonds list
      const bonds = await StablebondProgram.getBonds("https://api.devnet.solana.com");
      const bond = bonds[6];
      
      const stablebondProgram = new StablebondProgram(
        "https://api.devnet.solana.com",
        wallet.adapter
      );

      // Mint bond
      const mintBond = await stablebondProgram.mintBond(
        bond.address,
        new Decimal(amount)
      );

      toast.success("Bond minting initiated");

      // Wait for transaction confirmation
      await new Promise(resolve => setTimeout(resolve, 10000));

      // Get transaction details
      const solanaAddress = bs58.encode(mintBond);
      const tx = await connection.getTransaction(solanaAddress, {
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0
      });

      if (tx) {
        toast.success(`Bond purchased successfully!`);
      }

    } catch (error) {
      console.error("Error buying bond:", error);
      toast.error("Failed to buy bond");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 w-full">
      <Link href="/" className="text-3xl font-bold mb-4 block hover:underline">&larr; Back</Link>
      {connected ? (
        <div className="flex flex-col items-center gap-8">
          <div className="card !bg-wild-cream border border-black shadow-[5px_5px_0px_0px_rgba(0,0,0)] w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-6">Buy Savings Bond</h2>
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Amount</span>
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="input input-bordered w-full"
                  min="0.1"
                  step="0.1"
                />
              </div>
              <button
                onClick={handleBuyBond}
                className="btn btn-primary w-full"
                disabled={isLoading || !amount}
              >
                {isLoading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  "Buy Savings Bond"
                )}
              </button>
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm font-medium">Returns up to: 12% APY</p>
            <p className="text-xs opacity-75">Minimum holding period: 30 days</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col p-4 gap-4">
          <div className="">Connect your wallet to buy savings bonds</div>
          <WalletButton style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }} />
          <div className="space-y-2 pt-10">
            <img src="/Stables2.png" alt="Stables.fun logo" className="w-3/4 align-center mx-auto" />
            <p className="text-sm font-medium text-center">Earn up to 12% returns with Savings Bonds</p>
          </div>
        </div>
      )}
    </div>
  );
}