export interface LobsterStatusData {
    lastUpdate: string;
    status: string;
    vibe: string;
    reputation: number;
    threads: string;
    btc: string;
    disk: string;
    moltbook: string;
    events: string[];
    api_health: {
        threads: string;
        clawtasks: string;
        moltbook: string;
        openclaw: string;
    };
}

export const lobsterStatusUrl =
    "https://raw.githubusercontent.com/eric21364/scripting-test/main/status.json";
