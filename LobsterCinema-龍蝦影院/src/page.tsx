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
    Safari,
} from "scripting";

interface VideoItem {
    title: string;
    url: string;
    thumbnail: string;
    duration: string;
    category: string;
}

export function View() {
    const dismiss = Navigation.useDismiss();
    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [statusText, setStatusText] = useState<string>("龍蝦影院準備中 🍿");

    const scrapeKanav = async () => {
        try {
            const resp = await fetch("https://kanav.ad/", {
                headers: {
                    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
                },
            });
            
            if (!resp.ok) throw new Error("聯網失敗");
            
            const html = await resp.text();
            const results: VideoItem[] = [];
            
            // 使用專注於 Kanav 結構的強效正則
            const itemPattern = /<div class="col-md-3 col-sm-6 col-xs-6">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g;
            let match;
            
            while ((match = itemPattern.exec(html)) !== null) {
                const block = match[1];
                const titleM = block.match(/alt="([^"]+)"/);
                const linkM = block.match(/href="([^"]+)"/);
                const imgM = block.match(/data-original="([^"]+)"/);
                const durM = block.match(/<span class="model-view">([^<]+)<\/span>/);
                const catM = block.match(/<span class="model-view-left">([^<]+)<\/span>/);

                if (titleM && linkM) {
                    results.push({
                        title: titleM[1],
                        url: "https://kanav.ad" + linkM[1],
                        thumbnail: imgM ? imgM[1] : "",
                        duration: durM ? durM[1].trim() : "??",
                        category: catM ? catM[1].trim() : "影片"
                    });
                }
            }
            
            setVideos(results);
            setStatusText(`採集完成：${results.length} 部影片`);
        } catch (err) {
            setStatusText(`錯誤: ${String(err)}`);
        }
    };

    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            await scrapeKanav();
            setIsLoading(false);
        };
        init();
    }, []);

    return (
        <NavigationStack>
            <VStack
                navigationTitle={"龍蝦影院"}
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
                                await scrapeKanav();
                                setIsLoading(false);
                            }}>
                            <Image systemName="arrow.clockwise" />
                        </Button>,
                    ],
                }}>
                {(() => {
                    if (isLoading && videos.length === 0)
                        return (
                            <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} alignment="center">
                                <Spacer />
                                <ProgressView progressViewStyle={"circular"} />
                                <Text marginTop={10} foregroundStyle="secondaryLabel">龍蝦潛水中...</Text>
                                <Spacer />
                            </VStack>
                        );

                    return (
                        <List
                            refreshable={async () => {
                                await scrapeKanav();
                            }}>
                            <Section title={statusText}>
                                {videos.map((vid, index) => (
                                    <HStack 
                                        key={`video-${index}`} 
                                        padding={{ vertical: 8 }}
                                        onTapGesture={async () => {
                                            await Safari.present(vid.url);
                                        }}
                                    >
                                        <Image
                                            url={vid.thumbnail}
                                            frame={{ width: 100, height: 60 }}
                                            cornerRadius={8}
                                        />
                                        <VStack alignment="leading" spacing={4} marginLeft={12}>
                                            <Text font="subheadline" lineLimit={2} foregroundStyle="white">
                                                {vid.title}
                                            </Text>
                                            <HStack spacing={10}>
                                                <Text font="caption2" foregroundStyle="secondaryLabel">
                                                    {vid.duration}
                                                </Text>
                                                <Text font="caption2" foregroundStyle="orange">
                                                    #{vid.category}
                                                </Text>
                                            </HStack>
                                        </VStack>
                                    </HStack>
                                ))}
                            </Section>
                        </List>
                    );
                })()}
            </VStack>
        </NavigationStack>
    );
}
