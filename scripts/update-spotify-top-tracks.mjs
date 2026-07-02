import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = resolve(root, "data/spotify-top-tracks.json");
const tokenUrl = "https://accounts.spotify.com/api/token";
const tracksUrl = "https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=10";

const requiredEnv = [
  "SPOTIFY_CLIENT_ID",
  "SPOTIFY_CLIENT_SECRET",
  "SPOTIFY_REFRESH_TOKEN"
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing ${key}.`);
  }
}

const tokenResponse = await fetch(tokenUrl, {
  method: "POST",
  headers: {
    "Authorization": `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
    "Content-Type": "application/x-www-form-urlencoded"
  },
  body: new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: process.env.SPOTIFY_REFRESH_TOKEN
  })
});

if (!tokenResponse.ok) {
  throw new Error(`Spotify token request failed: ${tokenResponse.status} ${await tokenResponse.text()}`);
}

const tokenData = await tokenResponse.json();

const tracksResponse = await fetch(tracksUrl, {
  headers: {
    "Authorization": `Bearer ${tokenData.access_token}`
  }
});

if (!tracksResponse.ok) {
  throw new Error(`Spotify top tracks request failed: ${tracksResponse.status} ${await tracksResponse.text()}`);
}

const tracksData = await tracksResponse.json();
const payload = {
  updatedAt: new Date().toISOString(),
  range: "short_term",
  source: "spotify",
  tracks: tracksData.items.map((track) => ({
    id: track.id,
    name: track.name,
    artists: track.artists.map((artist) => artist.name),
    album: track.album.name,
    albumImage: track.album.images[0]?.url || "",
    spotifyUrl: track.external_urls.spotify,
    previewUrl: track.preview_url
  }))
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`);

console.log(`Wrote ${payload.tracks.length} Spotify top tracks to ${outputPath}`);
