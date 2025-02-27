'use client'
import Link from "next/link";
import { WalletButton } from "../solana/solana-provider";
import { FaGithub } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";


export function LHSNAV() {
    return (
        <div className="flex flex-col p-4 gap-4 bg-wild-cream min-h-screen max-h-screen border-r-[5px] border-r-black">
            <div className="flex flex-col h-full">
                <div className="space-y-2">
                    <Link href="/">
                        <img src="/Stables.png" alt="Stables.fun logo" className="w-full max-w-[400px] mx-auto" />
                    </Link>
                    <p className="text-sm font-medium text-center">Mint Stability, Backed by Real Assets.</p>
                </div>
                <WalletButton style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }} />
                <div className="space-y-4 pt-3">
                    <a href="/stablesfun" className="card !bg-wild-orange hover:!bg-wild-orange transition-all hover:shadow-[5px_5px_0px_0px_rgba(0,0,0)] ">
                        <div className="card-body items-center text-center">
                            <h2 className="card-title text-white">Create your own Stablecoin</h2>
                            <br />
                            <p className="text-white">Easily create and mint your own Stablecoin without coding.</p>
                            <div className="card-actions justify-end">
                                {/* <span className="btn btn-primary">Start</span> */}
                            </div>
                        </div>
                    </a>
                    <a href="/buysavingscoin" className="card !bg-wild-orange hover:!bg-wild-orange transition-all hover:shadow-[5px_5px_0px_0px_rgba(0,0,0)] ">
                        <div className="card-body items-center text-center">
                            <h2 className="card-title text-white">Buy Savings Coin</h2>
                            <br />
                            <p className="text-white">Earn up to 12% returns</p>
                            <div className="card-actions justify-end">
                            </div>
                        </div>
                    </a>
                </div>

                <div className="mt-auto">
                    <div>
                        <div className="mt-4 font-bold text-primary">How it Works</div>
                        <div className="text-md font-bold">Secure. Asset-Backed. Built for Growth.</div>
                        <ul className="text-sm list-none pl-0">
                            <li>Pegged to commodities for stability and trust.</li>
                            <li>Transparent, blockchain-powered transactions.</li>
                        </ul>
                    </div>

                    <div className="flex gap-4 justify-start mt-4">
                        <a
                            href="https://twitter.com/stablesfun"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-2xl hover:text-primary transition-colors"
                        >
                            <FaXTwitter />
                        </a>
                        <a
                            href="https://github.com/stablesfun"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-2xl hover:text-primary transition-colors"
                        >
                            <FaGithub />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
} 