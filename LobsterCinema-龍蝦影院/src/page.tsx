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
    Script,
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
    const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

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

    // 重新設計 Toolbar 控制
    const toolbarOptions = {
        topBarLeading: [
            <Button
                title={selectedVideo ? "返回" : "關閉"}
                systemImage={selectedVideo ? "chevron.left" : "xmark"}
                action={() => {
                    if (selectedVideo) setSelectedVideo(null);
                    else dismiss();
                }}
            />,
        ],
        topBarTrailing: selectedVideo ? [] : [
            <Button
                title="重整"
                systemImage="arrow.clockwise"
                action={loadData}
            />,
        ],
    };

    return (
        <NavigationStack>
            <VStack
                navigationTitle={selectedVideo ? "影片播放" : "龍蝦影院"}
                toolbar={toolbarOptions}
                background="#000"
            >
                {selectedVideo ? (
                    // 播放模式：使用 WebView 直接嵌入，這是 App 內最穩定的播放方式
                    <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }}>
                        <WebView 
                            url={selectedVideo.url} 
                            frame={{ maxWidth: "infinity", maxHeight: "infinity" }} 
                        />
                    </VStack>
                ) : (
                    // 列表模式：海報牆設計
                    <List refreshable={loadData}>
                        {isLoading && videos.length === 0 ? (
                            <VStack frame={{ maxWidth: "infinity", height: 200 }} alignment="center">
                                <ProgressView />
                                <Text marginTop={10} foregroundStyle="secondaryLabel">正在同步海報牆...</Text>
                            </VStack>
                        ) : null}

                        {videos.map((vid, index) => (
                            <VStack 
                                key={`cinema-item-${index}`} 
                                padding={{ vertical: 12, horizontal: 16 }}
                                spacing={10}
                                onTapGesture={() => setSelectedVideo(vid)}
                            >
                                <ZStack frame={{ maxWidth: "infinity", height: 200 }} cornerRadius={12} background="#111">
                                    <Image
                                        url={vid.thumbnail}
                                        frame={{ maxWidth: "infinity", height: 200 }}
                                        cornerRadius={12}
                                        resizable
                                        scaleToFill
                                    />
                                    {/* 播放微感按鈕 */}
                                    <VStack alignment="center">
                                        <Image systemName="play.fill" font={40} foregroundStyle="rgba(255,255,255,0.7)" />
                                    </VStack>
                                    {/* 時長標籤 */}
                                    <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} alignment="bottomTrailing" padding={8}>
                                        <Text font="caption2" padding={4} background="rgba(0,0,0,0.7)" cornerRadius={4} foregroundStyle="white">
                                            {vid.duration}
                                        </Text>
                                    </VStack>
                                </ZStack>
                                <VStack alignment="leading" spacing={4}>
                                    <Text font="headline" foregroundStyle="white" lineLimit={2}>{vid.title}</Text>
                                    <Text font="caption" foregroundStyle="orange">#{vid.category}</Text>
                                </VStack>
                            </VStack>
                        ))}
                    </List>
                )}
            </VStack>
        </NavigationStack>
    );
}
