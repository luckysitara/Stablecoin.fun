import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { currency: string } }) {
  const currency = params.currency.toUpperCase()

  // Validate currency
  const validCurrencies = ["USD", "EUR", "GBP", "JPY"]
  if (!validCurrencies.includes(currency)) {
    return NextResponse.json({ error: "Invalid currency. Supported currencies: USD, EUR, GBP, JPY" }, { status: 400 })
  }

  try {
    // In a real implementation, you would fetch the price from Switchboard Oracle
    // For demo purposes, we'll return mock data
    const mockPrices: Record<string, number> = {
      USD: 1.0,
      EUR: 1.08,
      GBP: 1.27,
      JPY: 0.0067,
    }

    return NextResponse.json({
      currency,
      price: mockPrices[currency],
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error(`Error fetching ${currency} price:`, error)
    return NextResponse.json({ error: `Failed to fetch ${currency} price` }, { status: 500 })
  }
}

