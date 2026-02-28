import {
    NavigationStack,
    Image,
    Text,
    ScrollView,
    HStack,
    VStack,
    Navigation,
    Spacer,
    Button,
    useState,
    useEffect,
    ProgressView,
    Safari,
    ZStack,
} from "scripting";

interface VideoItem {
    title: string;
    url: string;
    thumbnail: string;
    duration: string;
    category: string;
}

// 數據來源位址
const DATA_URL = "https://raw.githubusercontent.com/eric21364/scripting-test/main/status.json";

export function View() {
    const dismiss = Navigation.useDismiss();
    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const resp = await fetch(DATA_URL);
            const json = await resp.json();
            if (json.kanav_list) {
                setVideos(json.kanav_list);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // 輔助函式：將列表切成每 2 個一組，方便做海報牆
    const chunkVideos = (arr: VideoItem[], size: number) => {
        const result = [];
        for (let i = 0; i < arr.length; i += size) {
            result.push(arr.slice(i, i + size));
        }
        return result;
    };

    const videoRows = chunkVideos(videos, 2);

    return (
        <NavigationStack>
            <VStack
                navigationTitle="龍蝦豪華影院 🍿"
                background="#0A0A0A"
                toolbar={{
                    topBarLeading: [<Button action={dismiss} systemImage="xmark" />],
                    topBarTrailing: [<Button action={loadData} systemImage="arrow.clockwise" />]
                }}
            >
                {isLoading && videos.length === 0 ? (
                    <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} alignment="center">
                        <Spacer />
                        <ProgressView />
                        <Text marginTop={12} foregroundStyle="secondaryLabel">正在部署海報牆...</Text>
                        <Spacer />
                    </VStack>
                ) : (
                    <ScrollView padding={12}>
                        <VStack spacing={16}>
                            {videoRows.map((row, rowIdx) => (
                                <HStack key={rowIdx} spacing={12} frame={{ maxWidth: "infinity" }}>
                                    {row.map((vid, colIdx) => (
                                        <VStack
                                            key={colIdx}
                                            spacing={8}
                                            frame={{ maxWidth: "infinity" }}
                                            onTapGesture={async () => {
                                                // 在 App 內直接以 Safari 模式開啟 (這是最穩定的 In-App 播放方式)
                                                await Safari.present(vid.url);
                                            }}
                                        >
                                            {/* 海報外框 */}
                                            <ZStack 
                                                frame={{ maxWidth: "infinity", height: 220 }} 
                                                cornerRadius={12} 
                                                background="#1A1A1A"
                                            >
                                                <Image 
                                                    url={vid.thumbnail} 
                                                    frame={{ maxWidth: "infinity", height: "100%" }} 
                                                    contentMode="cover"
                                                />
                                                {/* 底部資訊遮蓋 */}
                                                <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} alignment="bottom">
                                                     <HStack 
                                                        frame={{ maxWidth: "infinity" }} 
                                                        padding={4} 
                                                        background="linear-gradient(to top, rgba(0,0,0,0.8), transparent)"
                                                    >
                                                        <Text font={{ size: 10 }} foregroundStyle="white">{vid.duration}</Text>
                                                        <Spacer />
                                                        <Text font={{ size: 10 }} foregroundStyle="orange" bold>HD</Text>
                                                    </HStack>
                                                </VStack>
                                                
                                                {/* 播放按鈕圖示 */}
                                                <VStack alignment="center">
                                                    <Image systemName="play.fill" font={24} foregroundStyle="rgba(255,255,255,0.6)" />
                                                </VStack>
                                            </ZStack>
                                            
                                            {/* 標題與分類 */}
                                            <VStack alignment="leading" spacing={2}>
                                                <Text font={{ size: 13, name: "system-medium" }} lineLimit={2} foregroundStyle="white">
                                                    {vid.title}
                                                </Text>
                                                <Text font="caption2" foregroundStyle="secondaryLabel">
                                                    #{vid.category}
                                                </Text>
                                            </VStack>
                                        </HStack>
                                    ))}
                                    {/* 如果最後一行只有一個，補位用的 Spacer */}
                                    {row.length === 1 && <Spacer frame={{ maxWidth: "infinity" }} />}
                                </HStack>
                            ))}
                            <Spacer frame={{ height: 40 }} />
                        </VStack>
                    </ScrollView>
                )}
            </VStack>
        </NavigationStack>
    );
}
