import { NextResponse } from "next/server";

// Fallback parsing using OpenAI (option 1) or simple rules (option 2)
async function fallbackParsing(naturalText: string) {
  console.log("⚠️ Using fallback parsing...");

  // Option 1: OpenAI fallback (if API key available)
  if (process.env.OPENAI_API_KEY) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content:
                'Parse the user intent into JSON format with fields: action (supply/borrow/swap/bridge), amount (string), token (string), protocol (string), chains (array). Return ONLY valid JSON, no markdown.',
            },
            { role: "user", content: naturalText },
          ],
          temperature: 0.3,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices[0].message.content;
        // Remove markdown code blocks if present
        const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "");
        const parsed = JSON.parse(jsonStr);
        console.log("✅ OpenAI fallback successful");
        return parsed;
      }
    } catch (error) {
      console.error("❌ OpenAI fallback failed:", error);
    }
  }

  // Option 2: Simple rule-based fallback
  console.log("ℹ️ Using rule-based fallback");
  const textLower = naturalText.toLowerCase();

  let action = "supply";
  if (textLower.includes("borrow") || textLower.includes("loan")) {
    action = "borrow";
  } else if (textLower.includes("swap") || textLower.includes("trade") || textLower.includes("exchange")) {
    action = "swap";
  } else if (textLower.includes("bridge") || textLower.includes("transfer")) {
    action = "bridge";
  }

  // Extract amount
  const amountMatch = naturalText.match(/\b(\d+(?:\.\d+)?)\b/);
  const amount = amountMatch ? amountMatch[1] : "100";

  // Extract token
  const tokens = ["usdc", "usdt", "dai", "weth", "eth", "wbtc", "btc"];
  let token = "USDC";
  for (const t of tokens) {
    if (textLower.includes(t)) {
      token = t.toUpperCase();
      break;
    }
  }

  // Extract protocol
  const protocols = {
    morpho: ["morpho"],
    aave: ["aave"],
    compound: ["compound"],
    uniswap: ["uniswap", "uni"],
    balancer: ["balancer"],
  };
  let protocol = "morpho";
  for (const [proto, keywords] of Object.entries(protocols)) {
    if (keywords.some(kw => textLower.includes(kw))) {
      protocol = proto;
      break;
    }
  }

  // Extract chains
  const chainMap: Record<string, string[]> = {
    optimism: ["optimism", "op"],
    arbitrum: ["arbitrum", "arb"],
    base: ["base"],
    polygon: ["polygon", "matic"],
    ethereum: ["ethereum", "eth mainnet"],
  };
  const chains: string[] = [];
  for (const [chain, keywords] of Object.entries(chainMap)) {
    if (keywords.some(kw => textLower.includes(kw))) {
      chains.push(chain);
    }
  }
  if (chains.length === 0) {
    chains.push("optimism");
  }

  return {
    action,
    amount,
    token,
    protocol,
    chains,
    confidence: 0.6,
  };
}

export async function POST(request: Request) {
  try {
    const { naturalText, userAddress } = await request.json();

    if (!naturalText || !userAddress) {
      return NextResponse.json({ error: "Missing naturalText or userAddress" }, { status: 400 });
    }

    console.log("🤖 Attempting to use Fetch.ai uAgent...");
    console.log(`📝 Text: "${naturalText}"`);
    console.log(`👤 User: ${userAddress}`);

    // Try calling the real uAgent (with 5 second timeout)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch("http://localhost:8001/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_address: userAddress,
          natural_text: naturalText,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const parsedIntent = await response.json();
        console.log("✅ uAgent parsing successful!");
        return NextResponse.json({
          ...parsedIntent,
          source: "uAgent",
        });
      }

      throw new Error(`uAgent returned status ${response.status}`);
    } catch (error) {
      clearTimeout(timeoutId);

      // Check if it was a timeout/connection error
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          console.log("⏱️ uAgent request timed out after 5s");
        } else {
          console.log(`❌ uAgent error: ${error.message}`);
        }
      }

      throw error;
    }
  } catch (error) {
    // Fallback mechanism
    console.log("🔄 Switching to fallback parsing...");

    try {
      const { naturalText } = await request.json();
      const parsedIntent = await fallbackParsing(naturalText);

      return NextResponse.json({
        ...parsedIntent,
        source: "fallback",
      });
    } catch (fallbackError) {
      console.error("❌ Fallback parsing also failed:", fallbackError);
      return NextResponse.json(
        {
          error: "Failed to parse intent",
          details: fallbackError instanceof Error ? fallbackError.message : "Unknown error",
        },
        { status: 500 },
      );
    }
  }
}
