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
    Script,
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
    const [statusText, setStatusText] = useState<string>("龍蝦影院 v1.5 - 極速模式 🍿");
    const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

    // 改用「本地讀取」模式：從專案根目錄的 status.json 讀取由伺服器抓好的數據
    const loadVideosFromStatus = async () => {
        try {
            // Weight 環境下，可以直接 fetch 同目錄或專案內的檔案
            const resp = await fetch("./status.json");
            if (!resp.ok) throw new Error("讀取本地數據失敗");
            
            const data = await resp.json();
            if (data.kanav_list && data.kanav_list.length > 0) {
                setVideos(data.kanav_list);
                setStatusText(`同步完成：${data.kanav_list.length} 部影片`);
            } else {
                setStatusText("伺服器端暫無影片數據，請稍後再試");
            }
        } catch (err) {
            setStatusText(`同步失敗: ${String(err)}`);
        }
    };

    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            await loadVideosFromStatus();
            setIsLoading(false);
        };
        init();
    }, []);

    return (
        <NavigationStack>
            <VStack
                navigationTitle={selectedVideo ? "影片詳情" : "龍蝦影院"}
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
                                await loadVideosFromStatus();
                                setIsLoading(false);
                            }}>
                            <Image systemName="arrow.clockwise" />
                        </Button>,
                    ],
                }}>
                
                {selectedVideo ? (
                    <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} background="#000">
                        <Spacer />
                        <ZStack frame={{ maxWidth: "infinity", height: 211 }}>
                            <Image url={selectedVideo.thumbnail} frame={{ maxWidth: "infinity", height: "100%" }} cornerRadius={12} contentMode="cover" />
                            <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} background="rgba(0,0,0,0.3)" alignment="center">
                                <Image systemName="play.circle.fill" font={64} foregroundStyle="white" />
                            </VStack>
                        </ZStack>
                        
                        <VStack padding={20} alignment="leading" spacing={12}>
                            <Text font="title2" foregroundStyle="white" bold>{selectedVideo.title}</Text>
                            <HStack spacing={12}>
                                <Text font="subheadline" foregroundStyle="orange">#{selectedVideo.category}</Text>
                                <Text font="subheadline" foregroundStyle="secondaryLabel">{selectedVideo.duration}</Text>
                            </HStack>
                            <Spacer frame={{ height: 24 }} />
                            <Button 
                                title="立即播放 🎬" 
                                buttonStyle="borderedProminent" 
                                frame={{ maxWidth: "infinity", height: 50 }}
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
                                    <Text marginTop={10} foregroundStyle="secondaryLabel">正在同步雲端資源...</Text>
                                    <Spacer />
                                </VStack>
                            );

                        return (
                            <List refreshable={loadVideosFromStatus}>
                                <Section title={statusText}>
                                    {videos.map((vid, index) => (
                                        <HStack 
                                            key={`v15-video-${index}`} 
                                            padding={{ vertical: 10 }}
                                            onTapGesture={() => setSelectedVideo(vid)}
                                        >
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
