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
    Video,
} from "scripting";

interface VideoItem {
    title: string;
    url: string;
    thumbnail: string;
    duration: string;
    category: string;
    streamUrl?: string; // 預備未來擴充 M3U8
}

export function View() {
    const dismiss = Navigation.useDismiss();
    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [statusText, setStatusText] = useState<string>("龍蝦影院 v1.3 - 準備中 🍿");
    const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

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
            
            // 抓取精選視頻區塊
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
                navigationTitle={selectedVideo ? "正在播放" : "龍蝦影院"}
                toolbar={{
                    topBarLeading: [
                        <Button
                            action={() => {
                                if (selectedVideo) setSelectedVideo(null);
                                else dismiss();
                            }}>
                            <Image systemName={selectedVideo ? "chevron.left" : "xmark"} />
                        </Button>,
                    ],
                    topBarTrailing: [
                        <Button
                            action={async () => {
                                setIsLoading(true);
                                setVideos([]);
                                await scrapeKanav();
                                setIsLoading(false);
                            }}>
                            <Image systemName="arrow.clockwise" />
                        </Button>,
                    ],
                }}>
                
                {selectedVideo ? (
                    /* 播放模式：直接顯示封面縮圖並提示跳轉 */
                    <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} background="#000">
                        <Spacer />
                        <ZStack frame={{ width: "infinity", height: 211 }}>
                            <Image url={selectedVideo.thumbnail} contentMode="cover" frame={{ maxWidth: "infinity" }} cornerRadius={12} />
                            <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} background="rgba(0,0,0,0.4)" alignment="center">
                                <Button action={async () => { /* 這裡目前依賴跳轉，未來找到 m3u8 後改為 Video 組件 */ }}>
                                    <Image systemName="play.circle.fill" font={64} foregroundStyle="white" />
                                </Button>
                            </VStack>
                        </ZStack>
                        
                        <VStack padding={20} alignment="leading" spacing={10}>
                            <Text font="title2" foregroundStyle="white" bold>{selectedVideo.title}</Text>
                            <HStack spacing={12}>
                                <Text font="subheadline" foregroundStyle="orange">#{selectedVideo.category}</Text>
                                <Text font="subheadline" foregroundStyle="secondaryLabel">{selectedVideo.duration}</Text>
                            </HStack>
                            <Spacer frame={{ height: 20 }} />
                            <Button 
                                title="點擊進入播放頁面" 
                                buttonStyle="borderedProminent" 
                                frame={{ maxWidth: "infinity" }}
                                action={async () => {
                                    // 由於 Kanav 採用 iframe 內嵌且有加密，目前最穩定的播放方式是透過 Safari WebView
                                    await Navigation.present({
                                        element: (
                                            <NavigationStack>
                                                <VStack navigationTitle={selectedVideo.title}>
                                                    {/* 使用 Weight 的網頁組件直接呈現 */}
                                                    <WebView url={selectedVideo.url} frame={{ maxWidth: "infinity", maxHeight: "infinity" }} />
                                                </VStack>
                                            </NavigationStack>
                                        ),
                                        modalPresentationStyle: "fullScreen"
                                    });
                                }}
                            />
                        </VStack>
                        <Spacer />
                    </VStack>
                ) : (
                    /* 列表模式 */
                    (() => {
                        if (isLoading && videos.length === 0)
                            return (
                                <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} alignment="center">
                                    <Spacer />
                                    <ProgressView progressViewStyle={"circular"} />
                                    <Text marginTop={10} foregroundStyle="secondaryLabel">龍蝦正潛入極深海域...</Text>
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
                                            key={`v13-video-${index}`} 
                                            padding={{ vertical: 10 }}
                                            onTapGesture={() => setSelectedVideo(vid)}
                                        >
                                            {/* 加入縮圖海報層次感 */}
                                            <ZStack frame={{ width: 120, height: 75 }}>
                                                <Image
                                                    url={vid.thumbnail}
                                                    frame={{ width: 120, height: 75 }}
                                                    cornerRadius={8}
                                                    contentMode="cover"
                                                />
                                                <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} alignment="bottomTrailing" padding={4}>
                                                    <Text font={{ size: 9 }} padding={2} background="rgba(0,0,0,0.6)" cornerRadius={4} foregroundStyle="white">
                                                        {vid.duration}
                                                    </Text>
                                                </VStack>
                                            </ZStack>
                                            
                                            <VStack alignment="leading" spacing={6} marginLeft={12} frame={{ maxWidth: "infinity" }}>
                                                <Text font="subheadline" lineLimit={2} foregroundStyle="white" bold>
                                                    {vid.title}
                                                </Text>
                                                <Text font="caption2" foregroundStyle="orange">
                                                    #{vid.category}
                                                </Text>
                                            </VStack>
                                        </HStack>
                                    ))}
                                </Section>
                            </List>
                        );
                    })()
                )}
            </VStack>
        </NavigationStack>
    );
}
