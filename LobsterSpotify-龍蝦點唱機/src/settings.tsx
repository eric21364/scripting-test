import {
    HStack,
    Divider,
    TextField,
    Text,
    Section,
    List,
    Navigation,
    NavigationStack,
    Button,
    Spacer,
    Image,
    VStack,
    useState,
    Pasteboard,
    fetch,
    Script,
} from "scripting";
import { SpotifyConfig } from "./types";
import { loadConfig, saveConfig, isConfigReady, getCurrentlyPlaying } from "./spotify";

const DEFAULT_REDIRECT = "https://localhost:8888/callback";
const SCOPES = [
    "user-read-currently-playing",
    "user-read-recently-played",
    "user-read-playback-state",
].join("%20");

export function SettingsPage(): JSX.Element {
    const dismiss = Navigation.useDismiss();

    const config = loadConfig();
    const [clientId, setClientId] = useState<string>(config.clientId);
    const [clientSecret, setClientSecret] = useState<string>(config.clientSecret);
    const [refreshToken, setRefreshToken] = useState<string>(config.refreshToken);
    const [redirectUri, setRedirectUri] = useState<string>(DEFAULT_REDIRECT);
    const [authCode, setAuthCode] = useState<string>("");
    const [statusMsg, setStatusMsg] = useState<string>("");
    const [testing, setTesting] = useState<boolean>(false);

    const blockWidth = 96;

    function buildAuthUrl(): string {
        return (
            "https://accounts.spotify.com/authorize" +
            `?client_id=${encodeURIComponent(clientId)}` +
            "&response_type=code" +
            `&redirect_uri=${encodeURIComponent(redirectUri)}` +
            `&scope=${SCOPES}`
        );
    }

    async function exchangeCode(): Promise<void> {
        if (!clientId || !clientSecret || !authCode) {
            setStatusMsg("❌ 請先填寫 Client ID、Secret 和授權碼");
            return;
        }
        setStatusMsg("🔄 正在換取 Refresh Token...");

        // 從貼上的網址中提取 code
        let code = authCode;
        if (code.includes("code=")) {
            const match = code.match(/code=([^&]+)/);
            if (match) code = match[1];
        }

        try {
            const basic = btoa(`${clientId}:${clientSecret}`);
            const response = await fetch(
                "https://accounts.spotify.com/api/token",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Basic ${basic}`,
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: [
                        "grant_type=authorization_code",
                        `code=${encodeURIComponent(code)}`,
                        `redirect_uri=${encodeURIComponent(redirectUri)}`,
                    ].join("&"),
                    timeout: 15,
                }
            );

            if (!response.ok) {
                const err = await response.text();
                setStatusMsg(`❌ 換取失敗 (${response.status}): ${err}`);
                return;
            }

            const data = await response.json();
            const rt = data.refresh_token as string;

            if (!rt) {
                setStatusMsg("❌ 回應中沒有 refresh_token");
                return;
            }

            setRefreshToken(rt);
            saveConfig({ clientId, clientSecret, refreshToken: rt });
            setStatusMsg(`✅ 成功！Refresh Token 已自動儲存`);
        } catch (e) {
            setStatusMsg(`❌ 錯誤: ${String(e)}`);
        }
    }

    async function testConnection(): Promise<void> {
        const cfg: SpotifyConfig = { clientId, clientSecret, refreshToken };
        if (!isConfigReady(cfg)) {
            setStatusMsg("❌ 請先完成所有步驟");
            return;
        }
        setTesting(true);
        setStatusMsg("🔄 測試連線中...");
        try {
            saveConfig(cfg);
            const track = await getCurrentlyPlaying(cfg);
            if (track) {
                setStatusMsg(`✅ 連線成功！正在播放: ${track.name}`);
            } else {
                setStatusMsg("✅ 連線成功！目前沒有在播放");
            }
        } catch (e) {
            setStatusMsg(`❌ 連線失敗: ${String(e)}`);
        } finally {
            setTesting(false);
        }
    }

    return (
        <NavigationStack>
            <List
                navigationTitle={"Spotify 設定"}
                toolbar={{
                    topBarLeading: [
                        <Button
                            action={() => {
                                saveConfig({ clientId, clientSecret, refreshToken });
                                dismiss();
                            }}>
                            <Text>儲存</Text>
                        </Button>,
                    ],
                }}>
                {/* Step 1: 基本憑證 */}
                <Section title={"Step 1 — 填入憑證"}>
                    <HStack>
                        <HStack frame={{ width: blockWidth }}>
                            <Text>Client ID</Text>
                            <Spacer />
                        </HStack>
                        <Divider />
                        <TextField
                            title="Client ID"
                            prompt="從 Developer Dashboard 取得"
                            value={clientId}
                            onChanged={(v: string) => setClientId(v)}
                        />
                    </HStack>
                    <HStack>
                        <HStack frame={{ width: blockWidth }}>
                            <Text>Secret</Text>
                            <Spacer />
                        </HStack>
                        <Divider />
                        <TextField
                            title="Client Secret"
                            prompt="從 Developer Dashboard 取得"
                            value={clientSecret}
                            onChanged={(v: string) => setClientSecret(v)}
                        />
                    </HStack>
                    <HStack>
                        <HStack frame={{ width: blockWidth }}>
                            <Text>Redirect</Text>
                            <Spacer />
                        </HStack>
                        <Divider />
                        <TextField
                            title="Redirect URI"
                            prompt={DEFAULT_REDIRECT}
                            value={redirectUri}
                            onChanged={(v: string) => setRedirectUri(v)}
                        />
                    </HStack>
                </Section>

                {/* Step 2: 產生授權連結 */}
                <Section title={"Step 2 — 授權"}>
                    <Button
                        action={() => {
                            if (!clientId) {
                                setStatusMsg("❌ 請先填 Client ID");
                                return;
                            }
                            const url = buildAuthUrl();
                            Pasteboard.copy(url);
                            setStatusMsg("📋 授權連結已複製！請在瀏覽器中開啟");
                        }}>
                        <HStack>
                            <Image
                                systemName="link.badge.plus"
                                foregroundStyle={"systemBlue"}
                                frame={{ width: 24 }}
                            />
                            <Text>複製授權連結</Text>
                            <Spacer />
                            <Image systemName="doc.on.doc" foregroundStyle={"tertiaryLabel"} />
                        </HStack>
                    </Button>
                    <Text font={12} foregroundStyle="secondaryLabel">
                        在瀏覽器開啟連結並授權，頁面會跳轉到打不開的網址，把網址列的整串 URL 貼回下方
                    </Text>
                </Section>

                {/* Step 3: 貼回 code 並換取 token */}
                <Section title={"Step 3 — 貼回授權碼"}>
                    <HStack>
                        <HStack frame={{ width: blockWidth }}>
                            <Text>授權碼</Text>
                            <Spacer />
                        </HStack>
                        <Divider />
                        <TextField
                            title="授權碼"
                            prompt="貼上 code 或整串網址"
                            value={authCode}
                            onChanged={(v: string) => setAuthCode(v)}
                        />
                    </HStack>
                    <Button action={async () => { await exchangeCode(); }}>
                        <HStack>
                            <Image
                                systemName="arrow.triangle.2.circlepath"
                                foregroundStyle={"systemGreen"}
                                frame={{ width: 24 }}
                            />
                            <Text>換取 Refresh Token</Text>
                        </HStack>
                    </Button>
                </Section>

                {/* Step 4: 測試 */}
                <Section title={"Step 4 — 測試連線"}>
                    {refreshToken.length > 0 ? (
                        <HStack>
                            <Image
                                systemName="checkmark.seal.fill"
                                foregroundStyle={"systemGreen"}
                                frame={{ width: 24 }}
                            />
                            <Text font={13}>Refresh Token 已就緒</Text>
                        </HStack>
                    ) : (
                        <HStack>
                            <Image
                                systemName="xmark.seal"
                                foregroundStyle={"systemGray"}
                                frame={{ width: 24 }}
                            />
                            <Text font={13} foregroundStyle="secondaryLabel">尚未取得 Refresh Token</Text>
                        </HStack>
                    )}
                    <Button
                        action={async () => { await testConnection(); }}
                        disabled={testing || refreshToken.length === 0}>
                        <HStack>
                            <Image
                                systemName="antenna.radiowaves.left.and.right"
                                foregroundStyle={"systemGreen"}
                                frame={{ width: 24 }}
                            />
                            <Text>{testing ? "測試中..." : "測試 Spotify 連線"}</Text>
                        </HStack>
                    </Button>
                </Section>

                {/* 狀態訊息 */}
                {statusMsg.length > 0 ? (
                    <Section title={"狀態"}>
                        <Text font={13}>{statusMsg}</Text>
                    </Section>
                ) : null}
            </List>
        </NavigationStack>
    );
}
