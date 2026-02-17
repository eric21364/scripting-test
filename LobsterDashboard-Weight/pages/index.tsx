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
import { SettingView, getProfile, Profile } from "./setting";
import { sshExecuteCommand } from "../utils/ssh";
import { LobsterStatusData, lobsterStatusCmd } from "../widgets/type";
import { getApiStatusIcon, getApiStatusColor } from "../utils/format";

export function View() {
    const dismiss = Navigation.useDismiss();

    const [data, setData] = useState<LobsterStatusData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [profile, setProfile] = useState<Profile>(getProfile());

    const fetchStatus = async () => {
        const result = await sshExecuteCommand(lobsterStatusCmd);
        if (result) {
            const parsed = JSON.parse(result) as LobsterStatusData;
            setData(parsed);
        }
    };

    useEffect(() => {
        async function initSetting() {
            while (true) {
                const newProfile = getProfile();
                const { ssh } = newProfile;
                const { host, username, password } = ssh;

                if (host === "" || username === "" || password === "") {
                    await Navigation.present(<SettingView />);
                } else {
                    break;
                }
            }
        }

        const load = async () => {
            await initSetting();
            setProfile(getProfile());
            await fetchStatus();
            setIsLoading(false);
        };
        load();
    }, [profile]);

    return (
        <NavigationStack>
            <VStack
                navigationTitle={"龍蝦哨兵"}
                toolbar={{
                    topBarLeading: [
                        <Button
                            action={() => {
                                dismiss();
                            }}>
                            <Image systemName="xmark" />
                        </Button>,
                        <Button
                            action={async () => {
                                await Navigation.present(<SettingView />);
                            }}>
                            <HStack>
                                <Image systemName="gear" />
                            </HStack>
                        </Button>,
                    ],
                    topBarTrailing: [
                        <Button
                            action={async () => {
                                setIsLoading(true);
                                await fetchStatus();
                                setIsLoading(false);
                            }}>
                            <Image systemName="arrow.clockwise" />
                        </Button>,
                    ],
                }}>
                {(() => {
                    if (isLoading || !data)
                        return (
                            <>
                                <ProgressView progressViewStyle={"circular"} padding />
                                <Spacer />
                            </>
                        );

                    return (
                        <List
                            refreshable={async () => {
                                await fetchStatus();
                            }}>
                            <Section title="系統狀態">
                                <HStack>
                                    <Image
                                        systemName="bolt.fill"
                                        foregroundStyle={"systemGreen"}
                                        frame={{ width: 24 }}
                                    />
                                    <Text>運行狀態</Text>
                                    <Spacer />
                                    <Text foregroundStyle="secondaryLabel">
                                        {data.status}
                                    </Text>
                                </HStack>
                                <HStack>
                                    <Image
                                        systemName="internaldrive.fill"
                                        foregroundStyle={"systemBlue"}
                                        frame={{ width: 24 }}
                                    />
                                    <Text>磁碟空間</Text>
                                    <Spacer />
                                    <Text foregroundStyle="secondaryLabel">
                                        {data.diskAvail}
                                    </Text>
                                </HStack>
                            </Section>
                            <Section title="任務進度">
                                <HStack>
                                    <Image
                                        systemName="star.fill"
                                        foregroundStyle={"systemOrange"}
                                        frame={{ width: 24 }}
                                    />
                                    <Text>聲望</Text>
                                    <Spacer />
                                    <Text foregroundStyle="secondaryLabel">
                                        {data.reputation.toString()}
                                    </Text>
                                </HStack>
                                <HStack>
                                    <Image
                                        systemName="text.bubble.fill"
                                        foregroundStyle={"systemPurple"}
                                        frame={{ width: 24 }}
                                    />
                                    <Text>Threads 連載</Text>
                                    <Spacer />
                                    <Text foregroundStyle="secondaryLabel">
                                        Day {data.threadsDay}
                                    </Text>
                                </HStack>
                                <HStack>
                                    <Image
                                        systemName="bitcoinsign.circle"
                                        foregroundStyle={"systemYellow"}
                                        frame={{ width: 24 }}
                                    />
                                    <Text>BTC 價格</Text>
                                    <Spacer />
                                    <Text foregroundStyle="secondaryLabel">
                                        {data.btcPrice} TWD
                                    </Text>
                                </HStack>
                            </Section>
                            <Section title="API 健康度">
                                {Object.entries(data.apiHealth).map(
                                    ([name, status]) => (
                                        <HStack key={name}>
                                            <Image
                                                systemName={getApiStatusIcon(status)}
                                                foregroundStyle={getApiStatusColor(status)}
                                                frame={{ width: 24 }}
                                            />
                                            <Text>{name}</Text>
                                            <Spacer />
                                            <Text foregroundStyle="secondaryLabel">
                                                {status}
                                            </Text>
                                        </HStack>
                                    )
                                )}
                            </Section>
                        </List>
                    );
                })()}
            </VStack>
        </NavigationStack>
    );
}
