"use client"

import { useState, ChangeEvent, useRef, useCallback, useEffect } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { WalletButton } from "@/components/solana/solana-provider"

import { PinataSDK } from "pinata-web3"
import ReactCanvasConfetti from 'react-canvas-confetti'
import type { CreateTypes } from 'canvas-confetti'
import { useBasicProgram } from '@/components/basic/basic-data-access'
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'

const pinata = new PinataSDK({
    pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT,
    pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY 
})

enum Currency {
    USD = "USD",
    EUR = "EUR",
    GBP = "GBP",
    PESO = "MNX"
}

const CURRENCIES = [
    { value: 'USD', label: 'US Dollar' },
    { value: 'EUR', label: 'Euro' },
    { value: 'GBP', label: 'British Pound' },
    { value: 'MNX', label: 'Mexican Peso' }
] as const

export default function Page() {
    const { connection } = useConnection()
    const { publicKey, connected, sendTransaction } = useWallet()
    const { createStableCoin } = useBasicProgram()
    const [isClient, setIsClient] = useState(false)
    const [name, setName] = useState("")
    const [symbol, setSymbol] = useState("")
    const [currency, setCurrency] = useState<typeof CURRENCIES[number]['value']>('USD')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [description, setDescription] = useState("")

    const router = useRouter()
    const refConfetti = useRef<CreateTypes | null>(null)

    const TARGET_WIDTH = 256
    const TARGET_HEIGHT = 256

    useEffect(() => {
        setIsClient(true)
    }, [])

    const makeShot = useCallback((particleRatio: number, opts: any) => {
        refConfetti.current?.({
            ...opts,
            origin: { y: 0.7 },
            particleCount: Math.floor(200 * particleRatio)
        });
    }, []);

    const fire = useCallback(() => {
        makeShot(0.25, {
            spread: 26,
            startVelocity: 55
        });

        makeShot(0.2, {
            spread: 60
        });

        makeShot(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8
        });

        makeShot(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2
        });

        makeShot(0.1, {
            spread: 120,
            startVelocity: 45
        });
    }, [makeShot]);

    const resizeImage = (file: File): Promise<File> => {
        return new Promise((resolve, reject) => {
            const img = new Image()
            img.src = URL.createObjectURL(file)

            img.onload = () => {
                const canvas = document.createElement('canvas')
                canvas.width = TARGET_WIDTH
                canvas.height = TARGET_HEIGHT
                const ctx = canvas.getContext('2d')

                if (!ctx) {
                    URL.revokeObjectURL(img.src)
                    reject(new Error('Could not get canvas context'))
                    return
                }

                // White background
                ctx.fillStyle = 'white'
                ctx.fillRect(0, 0, canvas.width, canvas.height)

                // Calculate scaling to maintain aspect ratio
                const scale = Math.max(
                    TARGET_WIDTH / img.width,
                    TARGET_HEIGHT / img.height
                )
                const scaledWidth = img.width * scale
                const scaledHeight = img.height * scale
                const x = (TARGET_WIDTH - scaledWidth) / 2
                const y = (TARGET_HEIGHT - scaledHeight) / 2

                ctx.drawImage(img, x, y, scaledWidth, scaledHeight)

                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Could not convert canvas to blob'))
                            return
                        }

                        const processedFile = new File([blob], file.name, {
                            type: 'image/png',
                            lastModified: Date.now(),
                        })

                        URL.revokeObjectURL(img.src)
                        resolve(processedFile)
                    },
                    'image/png',
                    0.8
                )
            }
        })
    }

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setSelectedFile(e.target.files[0])
        }
    }

    const handleInitialize = async () => {
        if (!publicKey || !selectedFile || !name || !symbol) return

        toast.success("Uploading image")
        setIsUploading(true)
        
        try {
            const resizedFile = await resizeImage(selectedFile)
            const imageUpload = await pinata.upload.file(resizedFile)
            const imageIpfsHash = imageUpload.IpfsHash
            const uploadedImage = `https://gateway.pinata.cloud/ipfs/${imageIpfsHash}`

            const upload = await pinata.upload.json({
                name,
                symbol,
                description,
                image: uploadedImage,
                currency
            }, {
                metadata: {
                    name: `${symbol}_metadata.json`
                }
            })

            const uploadedUri = `https://gateway.pinata.cloud/ipfs/${upload.IpfsHash}`

            toast.success('Upload complete');

            const { transaction, mint, coinAccount } = await createStableCoin.mutateAsync({
                params: {
                    name,
                    symbol,
                    uri: uploadedUri,
                    decimals: 6,
                },
                currency,
                image: uploadedImage,
                description,
                coinType: 'everyday',
            });
    
            const bondintATA = await getAssociatedTokenAddressSync(
                new PublicKey("A433vq62iQbDToDeZ3XZcWj1VWFHYB95SYwnZgSoEmXy"),
                new PublicKey(coinAccount),
                true,
                TOKEN_2022_PROGRAM_ID
            );

            const createATAInstruction = await createAssociatedTokenAccountInstruction(
                new PublicKey(publicKey),
                new PublicKey(bondintATA),
                new PublicKey(coinAccount),
                new PublicKey("A433vq62iQbDToDeZ3XZcWj1VWFHYB95SYwnZgSoEmXy"),
                TOKEN_2022_PROGRAM_ID
            );

            transaction.add(createATAInstruction);

            const latestBlockhash = await connection.getLatestBlockhash('confirmed');
            transaction.recentBlockhash = latestBlockhash.blockhash;
            transaction.feePayer = publicKey;
    
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
    
            toast.success('Token created successfully!');
            fire();
    
            setTimeout(() => {
                router.push(`/stablecoins/${mint}`);
            }, 3000);

        } catch (error) {
            toast.error('Error! Only 1 token with the same symbol can be minted per wallet.');
            console.error('Error during upload:', error)
        } finally {
            setIsUploading(false)
        }
    }

    if (!isClient) return null

    return (
        <div className="p-8 w-full">
            <Link href="/" className="text-3xl font-bold mb-4 block hover:underline">&larr; Back</Link>
            {connected ? (
                <div className="flex flex-col gap-4 w-full max-w-md mx-auto p-4">
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
                    <div className="flex justify-start">
                        <h2 className="text-2xl font-bold">Create your stablecoin</h2>
                    </div>

                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">Token Name</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Token Name"
                            className="input input-bordered w-full"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={32}
                        />
                    </div>

                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">Token Symbol</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Token Symbol"
                            className="input input-bordered w-full"
                            value={symbol}
                            onChange={(e) => setSymbol(e.target.value)}
                            maxLength={4}
                        />
                    </div>

                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">Token Image</span>
                        </label>
                        <input
                            type="file"
                            className="file-input file-input-bordered w-full"
                            onChange={handleFileChange}
                            accept="image/*"
                        />
                        {selectedFile && (
                            <div className="mt-2 mb-4">
                                <img
                                    src={URL.createObjectURL(selectedFile)}
                                    alt="Preview"
                                    className="w-64 h-64 object-cover rounded-lg shadow-lg"
                                />
                            </div>
                        )}
                    </div>

                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">Description</span>
                        </label>
                        <textarea
                            maxLength={100}
                            placeholder="Token description"
                            className="textarea textarea-bordered h-24 w-full"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <label className="label">
                            <span className="label-text-alt">{description.length}/100 bytes</span>
                        </label>
                    </div>

                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">Currency</span>
                        </label>
                        <select
                            className="select select-bordered w-full"
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value as Currency)}
                        >
                            {Object.values(Currency).map((curr) => (
                                <option key={curr} value={curr}>
                                    {curr}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleInitialize}
                        className="btn btn-secondary w-full"
                        disabled={!publicKey || !selectedFile || !name || !symbol || isUploading}
                    >
                        {isUploading ? 'Uploading...' : 'Initialize Token'}
                    </button>
                </div>
            ) : (
                <div className="flex flex-col p-4 gap-4">
                    <div className="">Connect your wallet to mint your stablecoin </div>
                    <WalletButton style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }} />
                    <div className="space-y-2 pt-10">
                        <img src="/Stables2.png" alt="Stables.fun logo" className="w-3/4 align-center mx-auto" />
                        <p className="text-sm font-medium text-center">Mint Stability, Backed by Real Assets.</p>
                    </div>
                </div>
            )}
        </div>
    )
}