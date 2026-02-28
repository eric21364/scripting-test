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

// 使用龍蝦哨兵驗證過的 GitHub RAW 地址模式
const JSON_URL = "https://raw.githubusercontent.com/eric21364/scripting-test/main/status.json";

export function View() {
    const dismiss = Navigation.useDismiss();
    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [statusText, setStatusText] = useState<string>("龍蝦影院 v1.6 - 精簡模式 🍿");
    const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

    const loadVideosFromGitHub = async () => {
        setIsLoading(true);
        setStatusText("正在聯網同步... 🛰️");
        try {
            // 使用絕對 URL 繞過相對路徑解析問題
            const resp = await fetch(JSON_URL);
            if (!resp.ok) throw new Error("GitHub 數據尚未同步");
            
            const data = await resp.json();
            if (data.kanav_list && data.kanav_list.length > 0) {
                // 優先取前 5 個
                setVideos(data.kanav_list.slice(0, 5));
                setStatusText(`極速獲取 5 部精選影片! ✨`);
            } else {
                setStatusText("暫無數據，龍蝦正在加緊採集...");
            }
        } catch (err) {
            setStatusText(`同步失敗，請重試 ❌`);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadVideosFromGitHub();
    }, []);

    return (
        <NavigationStack>
            <VStack
                navigationTitle={selectedVideo ? "觀看準備" : "龍蝦影院"}
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
                            action={loadVideosFromGitHub}>
                            <Image systemName="arrow.clockwise" />
                        </Button>,
                    ],
                }}>
                
                {selectedVideo ? (
                    <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} background="#000">
                        <Spacer />
                        <ZStack frame={{ maxWidth: "infinity", height: 200 }}>
                            <Image url={selectedVideo.thumbnail} frame={{ maxWidth: "infinity", height: "100%" }} cornerRadius={12} contentMode="cover" />
                            <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} background="rgba(0,0,0,0.4)" alignment="center">
                                <Image systemName="play.circle.fill" font={60} foregroundStyle="white" />
                            </VStack>
                        </ZStack>
                        
                        <VStack padding={16} alignment="leading" spacing={8}>
                            <Text font="headline" foregroundStyle="white" lineLimit={2}>{selectedVideo.title}</Text>
                            <HStack spacing={10}>
                                <Text font="caption" foregroundStyle="orange">#{selectedVideo.category}</Text>
                                <Text font="caption" foregroundStyle="secondaryLabel">{selectedVideo.duration}</Text>
                            </HStack>
                            <Spacer frame={{ height: 30 }} />
                            <Button 
                                title="點擊直接播放 🎬" 
                                buttonStyle="borderedProminent" 
                                frame={{ maxWidth: "infinity", height: 44 }}
                                action={async () => {
                                    await Safari.present(selectedVideo.url);
                                }}
                            />
                        </VStack>
                        <Spacer />
                    </VStack>
                ) : (
                    (() => {
                        if (isLoading && videos.length === 0)
                            return (
                                <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} alignment="center">
                                    <Spacer />
                                    <ProgressView />
                                    <Text marginTop={10} foregroundStyle="secondaryLabel">同步中...</Text>
                                    <Spacer />
                                </VStack>
                            );

                        return (
                            <List refreshable={loadVideosFromGitHub}>
                                <Section title={statusText}>
                                    {videos.map((vid, index) => (
                                        <HStack 
                                            key={`v16-video-${index}`} 
                                            padding={{ vertical: 8 }}
                                            onTapGesture={() => setSelectedVideo(vid)}
                                        >
                                            <ZStack frame={{ width: 110, height: 70 }}>
                                                <Image
                                                    url={vid.thumbnail}
                                                    frame={{ width: 110, height: 70 }}
                                                    cornerRadius={6}
                                                    contentMode="cover"
                                                />
                                                <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} alignment="bottomTrailing" padding={4}>
                                                    <Text font={{ size: 8 }} padding={2} background="rgba(0,0,0,0.7)" cornerRadius={3} foregroundStyle="white">
                                                        {vid.duration}
                                                    </Text>
                                                </VStack>
                                            </ZStack>
                                            
                                            <VStack alignment="leading" spacing={4} marginLeft={10} frame={{ maxWidth: "infinity" }}>
                                                <Text font="subheadline" lineLimit={2} foregroundStyle="white">
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
