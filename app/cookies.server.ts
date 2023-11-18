import { createCookie } from "@remix-run/node"; // or cloudflare/deno

export const spotifyAuthState = createCookie("spotify-auth-state", {
  maxAge: 60 * 5, // five minutes
});
