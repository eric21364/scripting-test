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
    Link,
} from "scripting";

interface VideoItem {
    title: string;
    url: string;
    thumbnail: string;
    duration: string;
    category: string;
}

const DATA_URL = "https://raw.githubusercontent.com/eric21364/scripting-test/main/status.json";

export function View() {
    const dismiss = Navigation.useDismiss();
    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const resp = await fetch(DATA_URL + "?t=" + Date.now());
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

    return (
        <NavigationStack>
            <VStack
                navigationTitle="龍蝦豪華影院 🍿"
                background="#000000"
                toolbar={{
                    topBarLeading: [<Button action={dismiss} systemImage="xmark" />],
                    topBarTrailing: [<Button action={loadData} systemImage="arrow.clockwise" />]
                }}
            >
                {isLoading && videos.length === 0 ? (
                    <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} alignment="center">
                        <Spacer />
                        <ProgressView />
                        <Text marginTop={12} foregroundStyle="secondaryLabel">龍蝦正從雲端搬運海報...</Text>
                        <Spacer />
                    </VStack>
                ) : (
                    <ScrollView padding={12}>
                        <VStack spacing={20}>
                            {videos.map((vid, idx) => (
                                <VStack
                                    key={idx}
                                    spacing={10}
                                    frame={{ maxWidth: "infinity" }}
                                    onTapGesture={async () => {
                                        // 使用最直接的連結開啟方式
                                        await Safari.present(vid.url);
                                    }}
                                >
                                    {/* 滿版大縮圖設計 */}
                                    <ZStack 
                                        frame={{ maxWidth: "infinity", height: 210 }} 
                                        cornerRadius={12} 
                                        background="#1A1A1A"
                                    >
                                        <Image 
                                            url={vid.thumbnail} 
                                            frame={{ maxWidth: "infinity", height: 210 }} 
                                            contentMode="cover"
                                        />
                                        
                                        {/* 右下角時長標籤 */}
                                        <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} alignment="bottomTrailing" padding={8}>
                                            <Text 
                                                font={{ size: 10, name: "system-bold" }} 
                                                padding={{ horizontal: 6, vertical: 3 }}
                                                background="rgba(0,0,0,0.75)" 
                                                cornerRadius={4}
                                                foregroundStyle="white"
                                            >
                                                {vid.duration}
                                            </Text>
                                        </VStack>

                                        {/* 中央大型播放圖示 */}
                                        <VStack alignment="center">
                                            <Image systemName="play.circle.fill" font={50} foregroundStyle="rgba(255,255,255,0.8)" />
                                        </VStack>
                                    </ZStack>
                                    
                                    {/* 文字資訊區 */}
                                    <VStack alignment="leading" spacing={4} padding={{ horizontal: 4 }}>
                                        <Text font={{ size: 15, name: "system-bold" }} lineLimit={2} foregroundStyle="white">
                                            {vid.title}
                                        </Text>
                                        <HStack>
                                            <Text font="caption" foregroundStyle="orange" bold>#{vid.category}</Text>
                                            <Spacer />
                                            <Text font="caption" foregroundStyle="secondaryLabel">點擊海報立即觀看</Text>
                                        </HStack>
                                    </VStack>
                                </VStack>
                            ))}
                            <Spacer frame={{ height: 50 }} />
                        </VStack>
                    </ScrollView>
                )}
            </VStack>
        </NavigationStack>
    );
}
