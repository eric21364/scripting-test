import { fetch, Script } from "scripting";
import { SpotifyConfig, SpotifyTrack, SpotifyRecentTrack } from "./types";

const CONFIG_KEY = "lobster_spotify_config";
const TOKEN_KEY = "lobster_spotify_token";

export function loadConfig(): SpotifyConfig {
    return (Storage.get(CONFIG_KEY) as SpotifyConfig) || {
        clientId: "",
        clientSecret: "",
        refreshToken: "",
    };
}

export function saveConfig(config: SpotifyConfig): void {
    Storage.set(CONFIG_KEY, config);
}

export function isConfigReady(config: SpotifyConfig): boolean {
    return (
        config.clientId.length > 0 &&
        config.clientSecret.length > 0 &&
        config.refreshToken.length > 0
    );
}

async function refreshAccessToken(config: SpotifyConfig): Promise<string> {
    const basic = btoa(`${config.clientId}:${config.clientSecret}`);

    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            Authorization: `Basic ${basic}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(
            config.refreshToken
        )}`,
        timeout: 10,
        debugLabel: "SpotifyTokenRefresh",
    });

    if (!response.ok) {
        throw new Error(`Token refresh failed: HTTP ${response.status}`);
    }

    const data = await response.json();
    const token = data.access_token as string;

    Storage.set(TOKEN_KEY, {
        accessToken: token,
        expiresAt: Date.now() + (data.expires_in as number) * 1000,
    });

    return token;
}

async function getAccessToken(config: SpotifyConfig): Promise<string> {
    const cached = Storage.get(TOKEN_KEY) as {
        accessToken: string;
        expiresAt: number;
    } | null;

    if (cached && cached.expiresAt > Date.now() + 60000) {
        return cached.accessToken;
    }

    return refreshAccessToken(config);
}

export async function getCurrentlyPlaying(
    config: SpotifyConfig
): Promise<SpotifyTrack | null> {
    const token = await getAccessToken(config);

    const response = await fetch(
        "https://api.spotify.com/v1/me/player/currently-playing",
        {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10,
            debugLabel: "SpotifyNowPlaying",
        }
    );

    if (response.status === 204) return null;
    if (!response.ok) throw new Error(`API error: HTTP ${response.status}`);

    const data = await response.json();
    if (!data || !data.item) return null;

    const item = data.item as any;
    const artists = (item.artists as any[])
        .map((a: any) => a.name as string)
        .join(", ");
    const images = item.album?.images as any[] | undefined;
    const coverUrl =
        images && images.length > 0 ? (images[0].url as string) : null;

    return {
        name: item.name as string,
        artist: artists,
        album: (item.album?.name as string) || "",
        albumCoverUrl: coverUrl,
        durationMs: item.duration_ms as number,
        progressMs: (data.progress_ms as number) || 0,
        isPlaying: data.is_playing as boolean,
        trackUrl: (item.external_urls?.spotify as string) || "",
    };
}

export async function getRecentlyPlayed(
    config: SpotifyConfig,
    limit: number = 10
): Promise<SpotifyRecentTrack[]> {
    const token = await getAccessToken(config);

    const response = await fetch(
        `https://api.spotify.com/v1/me/player/recently-played?limit=${limit}`,
        {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10,
            debugLabel: "SpotifyRecent",
        }
    );

    if (!response.ok) throw new Error(`API error: HTTP ${response.status}`);

    const data = await response.json();
    const items = (data.items as any[]) || [];

    return items.map((entry: any) => {
        const track = entry.track as any;
        const artists = (track.artists as any[])
            .map((a: any) => a.name as string)
            .join(", ");
        return {
            name: track.name as string,
            artist: artists,
            album: (track.album?.name as string) || "",
            playedAt: entry.played_at as string,
        };
    });
}

export function formatDuration(ms: number): string {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${String(sec).padStart(2, "0")}`;
}
