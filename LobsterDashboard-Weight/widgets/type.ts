export interface LobsterStatusData {
    status: string;
    reputation: number;
    threadsDay: number;
    btcPrice: string;
    diskAvail: string;
    moltbook: string;
    uptime: string;
    apiHealth: {
        threads: string;
        clawtasks: string;
        moltbook: string;
        openclaw: string;
    };
}

export const lobsterStatusCmd = `cat /home/ubuntu/.openclaw/workspace/status.json`;
