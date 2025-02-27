import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mint = searchParams.get("mint")

  if (!mint) {
    return NextResponse.json({ error: "Mint address required" }, { status: 400 })
  }

  const supabase = createRouteHandlerClient({ cookies })

  const { data, error } = await supabase.from("stablecoin_metadata").select("*").eq("mint_address", mint).single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const json = await request.json()
  const { mint_address, name, symbol, currency, image_url, description } = json

  const supabase = createRouteHandlerClient({ cookies })

  const { data, error } = await supabase
    .from("stablecoin_metadata")
    .upsert([
      {
        mint_address,
        name,
        symbol,
        currency,
        image_url,
        description,
      },
    ])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

