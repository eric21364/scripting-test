export type SpotifyConfig = {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
};

export type SpotifyTrack = {
    name: string;
    artist: string;
    album: string;
    albumCoverUrl: string | null;
    durationMs: number;
    progressMs: number;
    isPlaying: boolean;
    trackUrl: string;
};

export type SpotifyRecentTrack = {
    name: string;
    artist: string;
    album: string;
    playedAt: string;
};
