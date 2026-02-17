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
import { SpotifyConfig, SpotifyTrack, SpotifyRecentTrack, SpotifyDevice } from "./types";
import {
    loadConfig,
    isConfigReady,
    getCurrentlyPlaying,
    getRecentlyPlayed,
    playResume,
    pause,
    skipToNext,
    skipToPrevious,
    getDevices,
    transferPlayback,
    formatDuration,
    deviceIcon,
} from "./spotify";
import { SettingsPage } from "./settings";

function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMin = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diffMin < 1) return "剛剛";
    if (diffMin < 60) return diffMin + " 分鐘前";
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return diffHr + " 小時前";
    return Math.floor(diffHr / 24) + " 天前";
}

// ─── 裝置頁面 ───

function DevicesPage(): JSX.Element {
    const [devices, setDevices] = useState<SpotifyDevice[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [statusMsg, setStatusMsg] = useState<string>("");

    const config = loadConfig();

    async function fetchDevices(): Promise<void> {
        setLoading(true);
        try {
            const list = await getDevices(config);
            setDevices(list);
            setStatusMsg("");
        } catch (e) {
            setStatusMsg("❌ " + String(e));
        } finally {
            setLoading(false);
        }
    }

    async function switchTo(deviceId: string, deviceName: string): Promise<void> {
        setStatusMsg("🔄 切換至 " + deviceName + "...");
        try {
            await transferPlayback(config, deviceId);
            setStatusMsg("✅ 已切換至 " + deviceName);
            await fetchDevices();
        } catch (e) {
            setStatusMsg("❌ 切換失敗: " + String(e));
        }
    }

    useEffect(() => {
        fetchDevices();
    }, []);

    return (
        <List
            navigationTitle={"在線裝置"}
            navigationBarTitleDisplayMode={"inline"}
            refreshable={async () => { await fetchDevices(); }}>
            {loading ? (
                <Section>
                    <ProgressView progressViewStyle={"circular"} />
                </Section>
            ) : devices.length === 0 ? (
                <Section>
                    <HStack>
                        <Image
                            systemName="wifi.slash"
                            foregroundStyle={"systemGray"}
                            frame={{ width: 24 }}
                        />
                        <Text foregroundStyle="secondaryLabel">
                            沒有在線裝置，請先開啟 Spotify App
                        </Text>
                    </HStack>
                </Section>
            ) : (
                <Section title={"共 " + devices.length + " 個裝置"}>
                    {devices.map((device, i) => (
                        <Button
                            key={"dev-" + i}
                            action={async () => {
                                if (!device.isActive) {
                                    await switchTo(device.id, device.name);
                                }
                            }}>
                            <HStack spacing={10}>
                                <Image
                                    systemName={deviceIcon(device.type)}
                                    foregroundStyle={device.isActive ? "systemGreen" : "secondaryLabel"}
                                    font={20}
                                    frame={{ width: 28 }}
                                />
                                <VStack alignment="leading" spacing={2}>
                                    <Text bold={device.isActive}>
                                        {device.name}
                                    </Text>
                                    <Text font={12} foregroundStyle="secondaryLabel">
                                        {device.type}{device.isActive ? " · 使用中" : ""}
                                        {device.volumePercent !== null ? " · 🔊 " + device.volumePercent + "%" : ""}
                                    </Text>
                                </VStack>
                                <Spacer />
                                {device.isActive ? (
                                    <Image
                                        systemName="checkmark.circle.fill"
                                        foregroundStyle={"systemGreen"}
                                    />
                                ) : (
                                    <Image
                                        systemName="arrow.right.circle"
                                        foregroundStyle={"tertiaryLabel"}
                                    />
                                )}
                            </HStack>
                        </Button>
                    ))}
                </Section>
            )}
            {statusMsg.length > 0 ? (
                <Section>
                    <Text font={13}>{statusMsg}</Text>
                </Section>
            ) : null}
        </List>
    );
}

// ─── 主頁面 ───

export function PlayerPage() {
    const dismiss = Navigation.useDismiss();

    const [config, setConfig] = useState<SpotifyConfig>(loadConfig());
    const [current, setCurrent] = useState<SpotifyTrack | null>(null);
    const [recent, setRecent] = useState<SpotifyRecentTrack[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [configReady, setConfigReady] = useState<boolean>(isConfigReady(loadConfig()));
    const [controlMsg, setControlMsg] = useState<string>("");

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

    async function openDevices(): Promise<void> {
        await Navigation.present(<DevicesPage />);
    }

    async function handlePlayPause(): Promise<void> {
        const cfg = loadConfig();
        try {
            if (current?.isPlaying) {
                await pause(cfg);
                setControlMsg("⏸️ 已暫停");
            } else {
                await playResume(cfg);
                setControlMsg("▶️ 播放中");
            }
            // 短暫延遲後刷新狀態
            setTimeout(async () => {
                await fetchAll();
                setControlMsg("");
            }, 500);
        } catch (e) {
            setControlMsg("❌ " + String(e));
        }
    }

    async function handleNext(): Promise<void> {
        try {
            await skipToNext(loadConfig());
            setControlMsg("⏭️ 下一首");
            setTimeout(async () => {
                await fetchAll();
                setControlMsg("");
            }, 500);
        } catch (e) {
            setControlMsg("❌ " + String(e));
        }
    }

    async function handlePrev(): Promise<void> {
        try {
            await skipToPrevious(loadConfig());
            setControlMsg("⏮️ 上一首");
            setTimeout(async () => {
                await fetchAll();
                setControlMsg("");
            }, 500);
        } catch (e) {
            setControlMsg("❌ " + String(e));
        }
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
                        <Button action={async () => { await openDevices(); }}>
                            <Image systemName="hifispeaker.2" />
                        </Button>,
                        <Button action={async () => { await openSettings(); }}>
                            <Image systemName="gear" />
                        </Button>,
                        <Button action={async () => { await fetchAll(); }}>
                            <Image systemName="arrow.clockwise" />
                        </Button>,
                    ],
                }}>
                {(() => {
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
                                            請先設定您的 Spotify OAuth 憑證
                                        </Text>
                                    </VStack>
                                </Section>
                                <Section>
                                    <Button action={async () => { await openSettings(); }}>
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
                            </List>
                        );

                    if (isLoading)
                        return (
                            <>
                                <ProgressView progressViewStyle={"circular"} padding />
                                <Spacer />
                            </>
                        );

                    return (
                        <List refreshable={async () => { await fetchAll(); }}>
                            {/* 正在播放 */}
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
                                            <Text lineLimit={1}>{current.album}</Text>
                                        </HStack>
                                        <HStack>
                                            <Image
                                                systemName="timer"
                                                foregroundStyle={"systemBlue"}
                                                frame={{ width: 24 }}
                                            />
                                            <Text>
                                                {formatDuration(current.progressMs)} / {formatDuration(current.durationMs)}
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

                            {/* 播放控制 */}
                            {configReady ? (
                                <Section title="控制">
                                    <HStack alignment="center" spacing={0}>
                                        <Spacer />
                                        <Button action={async () => { await handlePrev(); }}>
                                            <Image
                                                systemName="backward.fill"
                                                font={28}
                                                foregroundStyle={"label"}
                                                frame={{ width: 60 }}
                                            />
                                        </Button>
                                        <Spacer />
                                        <Button action={async () => { await handlePlayPause(); }}>
                                            <Image
                                                systemName={current?.isPlaying ? "pause.circle.fill" : "play.circle.fill"}
                                                font={44}
                                                foregroundStyle={"systemGreen"}
                                                frame={{ width: 60 }}
                                            />
                                        </Button>
                                        <Spacer />
                                        <Button action={async () => { await handleNext(); }}>
                                            <Image
                                                systemName="forward.fill"
                                                font={28}
                                                foregroundStyle={"label"}
                                                frame={{ width: 60 }}
                                            />
                                        </Button>
                                        <Spacer />
                                    </HStack>
                                    {controlMsg.length > 0 ? (
                                        <Text font={12} foregroundStyle="secondaryLabel">
                                            {controlMsg}
                                        </Text>
                                    ) : null}
                                </Section>
                            ) : null}

                            {/* 最近播放 */}
                            <Section title={"最近播放（" + recent.length + "）"}>
                                {recent.length === 0 ? (
                                    <Text foregroundStyle="secondaryLabel">
                                        沒有播放紀錄
                                    </Text>
                                ) : (
                                    recent.map((track, i) => (
                                        <HStack
                                            key={"recent-" + i}
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
