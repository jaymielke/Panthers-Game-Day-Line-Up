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

    const table = $("table").first();
    if (table.length === 0) throw new Error("Couldn't find a standings table on the league page.");

    const teams = [];
    table.find("tbody tr").each((_, tr) => {
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

