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
    ZStack,
    Video,
    UIImage,
} from "scripting";

interface VideoItem {
    title: string;
    url: string;
    thumbnail: string;
    m3u8?: string;
    duration: string;
    category: string;
}

const DATA_URL = "https://raw.githubusercontent.com/eric21364/scripting-test/main/status.json";

function VideoCard({ video, onSelect }: { video: VideoItem, onSelect: (v: VideoItem) => void }) {
    const [thumb, setThumb] = useState<UIImage | null>(null);

    useEffect(() => {
        // 核心修復：使用 UIImage.fromURL 異步加載縮圖，解決無法顯示問題
        void UIImage.fromURL(video.thumbnail).then(img => {
            if (img) setThumb(img);
        });
    }, [video.thumbnail]);

    return (
        <VStack
            spacing={8}
            frame={{ maxWidth: "infinity" }}
            onTapGesture={() => onSelect(video)}
            padding={12}
            background="rgba(255,255,255,0.05)"
            cornerRadius={12}
        >
            <ZStack frame={{ maxWidth: "infinity", height: 180 }} cornerRadius={8} background="#111">
                {thumb ? (
                    <Image
                        image={thumb}
                        resizable
                        scaleToFill
                        frame={{ maxWidth: "infinity", height: 180 }}
                    />
                ) : (
                    <ProgressView />
                )}
                
                <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} alignment="bottomTrailing" padding={6}>
                    <Text font={{ size: 10 }} padding={3} background="rgba(0,0,0,0.7)" cornerRadius={4} foregroundStyle="white">
                        {video.duration}
                    </Text>
                </VStack>
                <Image systemName="play.circle" font={40} foregroundStyle="rgba(255,255,255,0.5)" />
            </ZStack>
            <VStack alignment="leading" spacing={2}>
                <Text font="subheadline" bold lineLimit={2} foregroundStyle="white">{video.title}</Text>
                <Text font="caption" foregroundStyle="orange">#{video.category}</Text>
            </VStack>
        </VStack>
    );
}

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

    return (
        <NavigationStack>
            <VStack
                navigationTitle={selectedVideo ? "正在播放" : "龍蝦影院"}
                background="#000"
                toolbar={{
                    topBarLeading: [
                        <Button action={() => {
                            if (selectedVideo) setSelectedVideo(null);
                            else dismiss();
                        }}>
                            <Image systemName={selectedVideo ? "chevron.left" : "xmark"} />
                        </Button>
                    ],
                    topBarTrailing: selectedVideo ? [] : [
                        <Button action={loadData}>
                            <Image systemName="arrow.clockwise" />
                        </Button>
                    ]
                }}
            >
                {selectedVideo ? (
                    <VStack spacing={20} padding={16}>
                        {selectedVideo.m3u8 ? (
                            <VStack cornerRadius={12} clipShape="rect" background="#111">
                                <Video 
                                    url={selectedVideo.m3u8} 
                                    autoplay={true} 
                                    frame={{ maxWidth: "infinity", height: 240 }} 
                                />
                            </VStack>
                        ) : (
                            <Text foregroundStyle="secondaryLabel">正在提取原始碼...</Text>
                        )}
                        
                        <VStack alignment="leading" spacing={10}>
                            <Text font="title3" bold foregroundStyle="white">{selectedVideo.title}</Text>
                            <HStack spacing={10}>
                                <Text font="caption" foregroundStyle="orange">#{selectedVideo.category}</Text>
                                <Text font="caption" foregroundStyle="secondaryLabel">{selectedVideo.duration}</Text>
                            </HStack>
                            <Spacer frame={{ height: 20 }} />
                            <Text font="body" foregroundStyle="secondaryLabel">
                                龍蝦註：如上方播放器無法載入，請確認網路環境。系統已自動抓取最強 M3U8 訊號。
                            </Text>
                        </VStack>
                    </VStack>
                ) : (
                    <List refreshable={loadData}>
                        {isLoading && <ProgressView padding />}
                        {videos.map((vid, idx) => (
                            <VideoCard key={idx} video={vid} onSelect={setSelectedVideo} />
                        ))}
                        <Spacer frame={{ height: 50 }} />
                    </List>
                )}
            </VStack>
        </NavigationStack>
    );
}
