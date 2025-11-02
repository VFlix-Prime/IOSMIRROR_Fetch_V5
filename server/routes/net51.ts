import { RequestHandler } from "express";
import { getTHash } from "./cookie";

export const handleNet51Top10: RequestHandler = async (_req, res) => {
  try {
    let cookieHeader = null;
    try {
      cookieHeader = await getTHash();
    } catch (_) {
      cookieHeader = null;
    }

    const headers: any = {
      "User-Agent":
        "Mozilla/5.0 (Linux; Android 13; Pixel 5 Build/TQ3A.230901.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/139.0.7258.158 Safari/537.36 /OS.Gatu v3.0",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "Accept-Language": "en-IN,en-US;q=0.9,en;q=0.8",
      Connection: "keep-alive",
      Host: "net51.cc",
      "Upgrade-Insecure-Requests": "1",
    };

    if (cookieHeader) {
      headers.Cookie = cookieHeader;
    }

    const response = await fetch("https://net51.cc/mobile/home?app=1", {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      return res.status(502).json({ success: false, error: "Failed to fetch net51 home" });
    }

    const html = await response.text();

    // Simple regex parse for top10 posts
    const items: { id: string; poster: string }[] = [];
    try {
      const top10Match = html.match(/<div[^>]*id=["']top10["'][\s\S]*?<\/div>\s*<\/div>/i);
      const block = top10Match ? top10Match[0] : html;
      const regex = /<div[^>]*class=["'][^"']*top10-post[^"']*["'][^>]*data-post=["'](\d+)["'][\s\S]*?<img[^>]*data-src=["']([^"']+)["'][^>]*>/gi;
      let m: RegExpExecArray | null;
      while ((m = regex.exec(block))) {
        const id = m[1];
        const poster = m[2];
        items.push({ id, poster });
      }
    } catch (e) {
      // fallback empty
    }

    res.json({ success: true, items });
  } catch (error) {
    console.error("Net51 top10 fetch error:", error);
    res.status(500).json({ success: false, error: "Internal error" });
  }
};
