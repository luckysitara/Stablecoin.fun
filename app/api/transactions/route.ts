import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const wallet = searchParams.get("wallet")
  const mint = searchParams.get("mint")

  if (!wallet && !mint) {
    return NextResponse.json({ error: "Wallet or mint address required" }, { status: 400 })
  }

  const supabase = createRouteHandlerClient({ cookies })

  let query = supabase.from("transactions").select("*").order("created_at", { ascending: false }).limit(50)

  if (wallet) {
    query = query.eq("wallet_address", wallet)
  }

  if (mint) {
    query = query.eq("mint_address", mint)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const json = await request.json()
  const { wallet_address, mint_address, type, amount, signature, block_time } = json

  const supabase = createRouteHandlerClient({ cookies })

  const { data, error } = await supabase
    .from("transactions")
    .insert([
      {
        wallet_address,
        mint_address,
        type,
        amount,
        signature,
        block_time,
      },
    ])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

