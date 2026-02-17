import {
    NavigationStack,
    Image,
    Text,
    List,
    Section,
    HStack,
    VStack,
    Navigation,
    Spacer,
    Button,
    useState,
    useEffect,
    ProgressView,
} from "scripting";
import { SpotifyConfig, SpotifyTrack, SpotifyRecentTrack } from "./types";
import {
    loadConfig,
    isConfigReady,
    getCurrentlyPlaying,
    getRecentlyPlayed,
    formatDuration,
} from "./spotify";
import { SettingsPage } from "./settings";

function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMin = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diffMin < 1) return "剛剛";
    if (diffMin < 60) return `${diffMin} 分鐘前`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} 小時前`;
    return `${Math.floor(diffHr / 24)} 天前`;
}

export function PlayerPage() {
    const dismiss = Navigation.useDismiss();

    const [config, setConfig] = useState<SpotifyConfig>(loadConfig());
    const [current, setCurrent] = useState<SpotifyTrack | null>(null);
    const [recent, setRecent] = useState<SpotifyRecentTrack[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [configReady, setConfigReady] = useState<boolean>(isConfigReady(loadConfig()));

    const fetchAll = async () => {
        const cfg = loadConfig();
        setConfig(cfg);
        if (!isConfigReady(cfg)) {
            setConfigReady(false);
            return;
        }
        setConfigReady(true);
        setIsLoading(true);
        try {
            const [track, history] = await Promise.all([
                getCurrentlyPlaying(cfg),
                getRecentlyPlayed(cfg, 10),
            ]);
            setCurrent(track);
            setRecent(history);
        } catch (e) {
            // silently fail
        } finally {
            setIsLoading(false);
        }
    };

    async function openSettings(): Promise<void> {
        await Navigation.present(<SettingsPage />);
        await fetchAll();
    }

    useEffect(() => {
        if (configReady) {
            fetchAll();
        }
    }, []);

    return (
        <NavigationStack>
            <VStack
                navigationTitle={"🦞 龍蝦點唱機"}
                toolbar={{
                    topBarLeading: [
                        <Button action={() => dismiss()}>
                            <Image systemName="xmark" />
                        </Button>,
                    ],
                    topBarTrailing: [
                        <Button action={() => { void openSettings(); }}>
                            <Image systemName="gear" />
                        </Button>,
                        <Button
                            action={async () => {
                                await fetchAll();
                            }}>
                            <Image systemName="arrow.clockwise" />
                        </Button>,
                    ],
                }}>
                {(() => {
                    // 尚未設定：顯示引導畫面
                    if (!configReady)
                        return (
                            <List>
                                <Section title="歡迎使用龍蝦點唱機 🦞🎵">
                                    <VStack alignment="center" spacing={12} padding>
                                        <Image
                                            systemName="music.note.house.fill"
                                            font={48}
                                            foregroundStyle={"systemGreen"}
                                        />
                                        <Text bold font={17}>
                                            尚未連接 Spotify
                                        </Text>
                                        <Text foregroundStyle="secondaryLabel" font={14}>
                                            請先設定您的 Spotify OAuth 憑證，即可在桌面即時查看正在播放的音樂。
                                        </Text>
                                    </VStack>
                                </Section>
                                <Section>
                                    <Button action={() => { void openSettings(); }}>
                                        <HStack>
                                            <Image
                                                systemName="gear.badge.checkmark"
                                                foregroundStyle={"systemGreen"}
                                                frame={{ width: 24 }}
                                            />
                                            <Text>前往設定 Spotify 帳號</Text>
                                            <Spacer />
                                            <Image systemName="chevron.right" foregroundStyle={"tertiaryLabel"} />
                                        </HStack>
                                    </Button>
                                </Section>
                                <Section title="設定指引">
                                    <HStack>
                                        <Text foregroundStyle="secondaryLabel" font={13}>
                                            1️⃣
                                        </Text>
                                        <Text font={13}>前往 Spotify Developer Dashboard</Text>
                                    </HStack>
                                    <HStack>
                                        <Text foregroundStyle="secondaryLabel" font={13}>
                                            2️⃣
                                        </Text>
                                        <Text font={13}>取得 Client ID 與 Client Secret</Text>
                                    </HStack>
                                    <HStack>
                                        <Text foregroundStyle="secondaryLabel" font={13}>
                                            3️⃣
                                        </Text>
                                        <Text font={13}>產生 Refresh Token 並填入設定</Text>
                                    </HStack>
                                </Section>
                            </List>
                        );

                    // 載入中
                    if (isLoading)
                        return (
                            <>
                                <ProgressView progressViewStyle={"circular"} padding />
                                <Spacer />
                            </>
                        );

                    // 已連接：顯示播放資訊
                    return (
                        <List
                            refreshable={async () => {
                                await fetchAll();
                            }}>
                            <Section title="正在播放">
                                {current ? (
                                    <>
                                        <HStack>
                                            <Image
                                                systemName={
                                                    current.isPlaying
                                                        ? "play.circle.fill"
                                                        : "pause.circle.fill"
                                                }
                                                foregroundStyle={
                                                    current.isPlaying
                                                        ? "systemGreen"
                                                        : "systemOrange"
                                                }
                                                font={24}
                                                frame={{ width: 32 }}
                                            />
                                            <VStack alignment="leading" spacing={2}>
                                                <Text bold lineLimit={1}>
                                                    {current.name}
                                                </Text>
                                                <Text
                                                    font={13}
                                                    foregroundStyle="secondaryLabel"
                                                    lineLimit={1}>
                                                    {current.artist}
                                                </Text>
                                            </VStack>
                                        </HStack>
                                        <HStack>
                                            <Image
                                                systemName="opticaldisc"
                                                foregroundStyle={"systemPurple"}
                                                frame={{ width: 24 }}
                                            />
                                            <Text>{current.album}</Text>
                                        </HStack>
                                        <HStack>
                                            <Image
                                                systemName="timer"
                                                foregroundStyle={"systemBlue"}
                                                frame={{ width: 24 }}
                                            />
                                            <Text>
                                                {formatDuration(current.progressMs)} /{" "}
                                                {formatDuration(current.durationMs)}
                                            </Text>
                                        </HStack>
                                    </>
                                ) : (
                                    <HStack>
                                        <Image
                                            systemName="speaker.slash"
                                            foregroundStyle={"systemGray"}
                                            frame={{ width: 24 }}
                                        />
                                        <Text foregroundStyle="secondaryLabel">
                                            目前沒有在播放音樂 🎵
                                        </Text>
                                    </HStack>
                                )}
                            </Section>
                            <Section title={`最近播放（${recent.length}）`}>
                                {recent.length === 0 ? (
                                    <Text foregroundStyle="secondaryLabel">
                                        沒有播放紀錄
                                    </Text>
                                ) : (
                                    recent.map((track, i) => (
                                        <HStack
                                            key={`recent-${i}`}
                                            alignment="center"
                                            spacing={8}>
                                            <VStack
                                                alignment="leading"
                                                spacing={2}
                                                frame={{
                                                    maxWidth: "infinity",
                                                    alignment: "leading",
                                                }}>
                                                <Text lineLimit={1}>{track.name}</Text>
                                                <Text
                                                    lineLimit={1}
                                                    font="caption"
                                                    foregroundStyle="secondaryLabel">
                                                    {track.artist} · {track.album}
                                                </Text>
                                            </VStack>
                                            <Text
                                                font={11}
                                                foregroundStyle="tertiaryLabel">
                                                {formatTimeAgo(track.playedAt)}
                                            </Text>
                                        </HStack>
                                    ))
                                )}
                            </Section>
                        </List>
                    );
                })()}
            </VStack>
        </NavigationStack>
    );
}
