import { RequestHandler } from "express";

let cachedTHash: string | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

export const getTHash = async (): Promise<string | null> => {
  // Return cached value if still valid
  if (cachedTHash && Date.now() - cacheTimestamp < CACHE_DURATION) {
    console.log("Using cached t_hash");
    return cachedTHash;
  }

  try {
    console.log("Fetching fresh t_hash from net51.cc");
    const response = await fetch("https://net51.cc/tv/p.php", {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    // Get the Set-Cookie header
    const setCookieHeader = response.headers.get("set-cookie");
    console.log(
      "Set-Cookie header:",
      setCookieHeader ? setCookieHeader.substring(0, 100) : "not found",
    );

    if (!setCookieHeader) {
      console.error("No Set-Cookie header found");
      return null;
    }

    // Extract t_hash using regex pattern
    const hashMatch = setCookieHeader.match(/t_hash=([^;]+)/);
    if (hashMatch && hashMatch[1]) {
      cachedTHash = hashMatch[1];
      cacheTimestamp = Date.now();
      console.log("Successfully extracted t_hash:", cachedTHash);
      return cachedTHash;
    }

    console.error("Could not extract t_hash from cookie");
    return null;
  } catch (error) {
    console.error("Error fetching t_hash:", error);
    return null;
  }
};

export const handleFetchCookie: RequestHandler = async (req, res) => {
  try {
    const tHash = await getTHash();
    if (tHash) {
      res.json({ success: true, tHash });
    } else {
      res.status(500).json({ success: false, error: "Failed to fetch t_hash" });
    }
  } catch (error) {
    console.error("Cookie fetch error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch cookie" });
  }
};

export const handleCookieStatus: RequestHandler = async (req, res) => {
  const tHash = await getTHash();
  res.json({
    status: tHash ? "success" : "failed",
    hasCookie: !!tHash,
    cached: !!cachedTHash && Date.now() - cacheTimestamp < CACHE_DURATION,
  });
};
