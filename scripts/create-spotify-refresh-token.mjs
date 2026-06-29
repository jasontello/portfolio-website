import { createServer } from "node:http";

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const port = Number(process.env.PORT || 8888);
const redirectUri = `http://127.0.0.1:${port}/callback`;
const scope = "user-top-read";

if (!clientId || !clientSecret) {
  throw new Error("Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET before running this script.");
}

const authUrl = new URL("https://accounts.spotify.com/authorize");
authUrl.search = new URLSearchParams({
  response_type: "code",
  client_id: clientId,
  scope,
  redirect_uri: redirectUri
}).toString();

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url, redirectUri);

  if (requestUrl.pathname !== "/callback") {
    response.writeHead(302, { Location: authUrl.toString() });
    response.end();
    return;
  }

  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");

  if (error || !code) {
    response.writeHead(400, { "Content-Type": "text/plain" });
    response.end(`Spotify authorization failed: ${error || "missing code"}`);
    server.close();
    return;
  }

  const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri
    })
  });

  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok) {
    response.writeHead(500, { "Content-Type": "text/plain" });
    response.end(`Spotify token exchange failed: ${JSON.stringify(tokenData)}`);
    server.close();
    return;
  }

  response.writeHead(200, { "Content-Type": "text/html" });
  response.end("<p>Spotify connected. You can close this tab and copy the refresh token from your terminal.</p>");
  console.log("\nSPOTIFY_REFRESH_TOKEN=");
  console.log(tokenData.refresh_token);
  console.log("\nAdd this as a GitHub Actions secret. Do not commit it.\n");
  server.close();
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Open this URL and approve Spotify access:\n${authUrl.toString()}\n`);
  console.log(`Spotify app redirect URI must include: ${redirectUri}`);
});
