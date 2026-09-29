export default async function(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const url = body?.url;
    const alias = body?.alias;
    if (!url) return Response.json({ error: "Missing url" }, { status: 400 });

    // Try is.gd with custom alias
    if (alias) {
      try {
        const isGdUrl = `https://is.gd/create.php?format=json&url=${encodeURIComponent(url)}&shorturl=${encodeURIComponent(alias)}`;
        const res = await fetch(isGdUrl);
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (data.shorturl) return Response.json({ shortUrl: data.shorturl });
          if (data.errormessage) console.log("is.gd alias error:", data.errormessage);
        } catch { /* not json */ }
      } catch (e) { console.log("is.gd alias fetch failed:", e.message); }
    }

    // Try is.gd without alias
    try {
      const res = await fetch(`https://is.gd/create.php?format=json&url=${encodeURIComponent(url)}`);
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        if (data.shorturl) return Response.json({ shortUrl: data.shorturl });
        if (data.errormessage) console.log("is.gd error:", data.errormessage);
      } catch { /* not json */ }
    } catch (e) { console.log("is.gd fetch failed:", e.message); }

    // Try cleanuri
    try {
      const res = await fetch("https://cleanuri.com/api/v1/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `url=${encodeURIComponent(url)}`,
      });
      const data = await res.json();
      if (data.result_url) return Response.json({ shortUrl: data.result_url });
    } catch (e) { console.log("cleanuri failed:", e.message); }

    // Last resort: tinyurl
    try {
      const res2 = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
      const shortUrl = (await res2.text()).trim();
      if (shortUrl.startsWith("http")) return Response.json({ shortUrl });
    } catch { /* give up */ }

    return Response.json({ shortUrl: url });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}