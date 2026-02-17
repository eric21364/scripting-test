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
import { LobsterStatusData, lobsterStatusUrl } from "../widgets/type";

export function View() {
    const dismiss = Navigation.useDismiss();

    const [data, setData] = useState<LobsterStatusData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const fetchStatus = async () => {
        const response = await fetch(lobsterStatusUrl);
        if (response.ok) {
            const parsed = (await response.json()) as LobsterStatusData;
            setData(parsed);
        }
    };

    useEffect(() => {
        const load = async () => {
            await fetchStatus();
            setIsLoading(false);
        };
        load();
    }, []);

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
                                        {data.disk}
                                    </Text>
                                </HStack>
                                <HStack>
                                    <Image
                                        systemName="clock.fill"
                                        foregroundStyle={"systemIndigo"}
                                        frame={{ width: 24 }}
                                    />
                                    <Text>最後更新</Text>
                                    <Spacer />
                                    <Text foregroundStyle="secondaryLabel">
                                        {data.lastUpdate}
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
                                        {data.threads}
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
                                        {data.btc} TWD
                                    </Text>
                                </HStack>
                            </Section>
                        </List>
                    );
                })()}
            </VStack>
        </NavigationStack>
    );
}
