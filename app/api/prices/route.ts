import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const feed = searchParams.get("feed")

  if (!feed) {
    return NextResponse.json({ error: "Feed address required" }, { status: 400 })
  }

  const supabase = createRouteHandlerClient({ cookies })

  const { data, error } = await supabase
    .from("price_history")
    .select("*")
    .eq("feed_address", feed)
    .order("timestamp", { ascending: false })
    .limit(1)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const json = await request.json()
  const { feed_address, price } = json

  const supabase = createRouteHandlerClient({ cookies })

  const { data, error } = await supabase
    .from("price_history")
    .insert([
      {
        feed_address,
        price,
      },
    ])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}


