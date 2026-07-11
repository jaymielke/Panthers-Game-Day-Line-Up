import * as cheerio from "cheerio";

const STANDINGS_URL = "https://icbabaseball.ca/Rounds/31986/2026_8_and_Under_T1_Regular_Season/";
const KEYS = ["gp", "w", "l", "t", "pts", "winPct", "rf", "ra", "defInn", "raPerDI", "l10", "streak"];

export default async function handler(req, res) {
  try {
    const response = await fetch(STANDINGS_URL, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; PanthersTrackerBot/1.0)" },
    });
    if (!response.ok) throw new Error(`League site returned ${response.status}`);
    const html = await response.text();
    const $ = cheerio.load(html);

    let table = null;
    $("table").each((_, el) => {
      const headers = $(el).find("th").map((__, th) => $(th).text().trim().toLowerCase()).get();
      if (headers.includes("team") && headers.includes("gp")) {
        table = $(el);
        return false;
      }
    });
    if (!table) throw new Error("Couldn't find the standings table on the league page — its layout may have changed.");

    const teams = [];
    let rows = table.find("tbody tr");
    if (rows.length === 0) rows = table.find("tr").filter((__, tr) => $(tr).find("th").length === 0);
    rows.each((_, tr) => {
      const cells = $(tr).find("td");
      if (cells.length === 0) return;
      const teamCell = $(cells[0]);
      const name = teamCell.find("a").first().text().trim() || teamCell.text().trim();
      if (!name) return;
      const row = { team: name };
      cells.each((idx, td) => {
        if (idx === 0) return;
        const key = KEYS[idx - 1];
        if (key) row[key] = $(td).text().trim();
      });
      teams.push(row);
    });

    if (teams.length === 0) throw new Error("The standings table looked empty — the league site's layout may have changed.");

    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    res.status(200).json({ teams, updatedAt: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ error: (e && e.message) || String(e) });
  }
}
