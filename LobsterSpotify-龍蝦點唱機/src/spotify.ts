import { fetch, Script } from "scripting";
import { SpotifyConfig, SpotifyTrack, SpotifyRecentTrack, SpotifyDevice } from "./types";

const CONFIG_KEY = "lobster_spotify_config";
const TOKEN_KEY = "lobster_spotify_token";

// Scripting 環境沒有 btoa，手寫 Base64 編碼
export function toBase64(input: string): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let result = "";
    const bytes: number[] = [];
    for (let i = 0; i < input.length; i++) {
        bytes.push(input.charCodeAt(i) & 0xff);
    }
    for (let i = 0; i < bytes.length; i += 3) {
        const b0 = bytes[i];
        const b1 = i + 1 < bytes.length ? bytes[i + 1] : 0;
        const b2 = i + 2 < bytes.length ? bytes[i + 2] : 0;
        result += chars[b0 >> 2];
        result += chars[((b0 & 3) << 4) | (b1 >> 4)];
        result += i + 1 < bytes.length ? chars[((b1 & 15) << 2) | (b2 >> 6)] : "=";
        result += i + 2 < bytes.length ? chars[b2 & 63] : "=";
    }
    return result;
}

export function loadConfig(): SpotifyConfig {
    return (Storage.get(CONFIG_KEY) as SpotifyConfig) || {
        clientId: "",
        clientSecret: "",
        refreshToken: "",
    };
}

export function saveConfig(config: SpotifyConfig): void {
    Storage.set(CONFIG_KEY, config);
    // 清除舊的 access token 快取，強制用新 refresh token 重新取得
    Storage.remove(TOKEN_KEY);
}

export function isConfigReady(config: SpotifyConfig): boolean {
    return (
        config.clientId.length > 0 &&
        config.clientSecret.length > 0 &&
        config.refreshToken.length > 0
    );
}

async function refreshAccessToken(config: SpotifyConfig): Promise<string> {
    const basic = toBase64(config.clientId + ":" + config.clientSecret);

    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            Authorization: "Basic " + basic,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=refresh_token&refresh_token=" + encodeURIComponent(config.refreshToken),
        timeout: 10,
    });

    if (!response.ok) {
        throw new Error("Token refresh failed: HTTP " + response.status);
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

// ─── 播放資訊 ───

export async function getCurrentlyPlaying(
    config: SpotifyConfig
): Promise<SpotifyTrack | null> {
    const token = await getAccessToken(config);

    const response = await fetch(
        "https://api.spotify.com/v1/me/player/currently-playing",
        {
            headers: { Authorization: "Bearer " + token },
            timeout: 10,
        }
    );

    if (response.status === 204) return null;
    if (!response.ok) throw new Error("API error: HTTP " + response.status);

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
        "https://api.spotify.com/v1/me/player/recently-played?limit=" + limit,
        {
            headers: { Authorization: "Bearer " + token },
            timeout: 10,
        }
    );

    if (!response.ok) throw new Error("API error: HTTP " + response.status);

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

// ─── 播放控制 ───

async function spotifyCommand(
    config: SpotifyConfig,
    method: string,
    endpoint: string,
    body?: string
): Promise<string> {
    const token = await getAccessToken(config);
    const headers: Record<string, string> = {
        Authorization: "Bearer " + token,
    };
    if (body) {
        headers["Content-Type"] = "application/json";
    }

    const opts: any = {
        method: method,
        headers: headers,
        timeout: 10,
    };
    if (body) {
        opts.body = body;
    }

    const response = await fetch(
        "https://api.spotify.com/v1/me/player/" + endpoint,
        opts
    );

    if (response.status === 204 || response.status === 200) {
        return "ok";
    }
    if (response.status === 403) {
        return "需要 Spotify Premium 才能使用此功能";
    }
    if (response.status === 404) {
        return "找不到播放裝置，請先開啟 Spotify App";
    }

    const errData = await response.text();
    return "HTTP " + response.status + ": " + errData;
}

export async function playResume(config: SpotifyConfig): Promise<string> {
    return spotifyCommand(config, "PUT", "play");
}

export async function pause(config: SpotifyConfig): Promise<string> {
    return spotifyCommand(config, "PUT", "pause");
}

export async function skipToNext(config: SpotifyConfig): Promise<string> {
    return spotifyCommand(config, "POST", "next");
}

export async function skipToPrevious(config: SpotifyConfig): Promise<string> {
    return spotifyCommand(config, "POST", "previous");
}

// ─── 裝置管理 ───

export async function getDevices(config: SpotifyConfig): Promise<SpotifyDevice[]> {
    const token = await getAccessToken(config);
    const response = await fetch("https://api.spotify.com/v1/me/player/devices", {
        headers: { Authorization: "Bearer " + token },
        timeout: 10,
    });

    if (!response.ok) throw new Error("Devices API error: HTTP " + response.status);

    const data = await response.json();
    const devices = (data.devices as any[]) || [];

    return devices.map((d: any) => ({
        id: d.id as string,
        name: d.name as string,
        type: d.type as string,
        isActive: d.is_active as boolean,
        volumePercent: d.volume_percent as number | null,
    }));
}

export async function transferPlayback(
    config: SpotifyConfig,
    deviceId: string
): Promise<string> {
    const token = await getAccessToken(config);
    const response = await fetch("https://api.spotify.com/v1/me/player", {
        method: "PUT",
        headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ device_ids: [deviceId], play: true }),
        timeout: 10,
    });

    if (response.status === 204 || response.status === 200) {
        return "ok";
    }
    if (response.status === 403) {
        return "需要 Spotify Premium 才能切換裝置";
    }
    if (response.status === 404) {
        return "裝置已離線";
    }
    const errData = await response.text();
    return "HTTP " + response.status + ": " + errData;
}

// ─── 工具 ───

export function formatDuration(ms: number): string {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return min + ":" + String(sec).padStart(2, "0");
}

export function deviceIcon(type: string): string {
    switch (type.toLowerCase()) {
        case "computer": return "desktopcomputer";
        case "smartphone": return "iphone";
        case "tablet": return "ipad";
        case "speaker": return "hifispeaker";
        case "tv": return "tv";
        case "automobile": return "car";
        case "castaudio": return "airplayaudio";
        case "castvideo": return "airplayvideo";
        default: return "speaker.wave.2";
    }
}
