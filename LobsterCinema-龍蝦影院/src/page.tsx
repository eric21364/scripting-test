import {
    NavigationStack,
    Image,
    Text,
    List,
    HStack,
    VStack,
    Navigation,
    Spacer,
    Button,
    useState,
    useEffect,
    ProgressView,
    ZStack,
    UIImage,
    Web,
} from "scripting";

interface VideoItem {
    title: string;
    url: string;
    thumbnail: string;
    duration: string;
    category: string;
}

const DATA_URL = "https://raw.githubusercontent.com/eric21364/scripting-test/main/status.json";

function PosterCard({ video, onPlay }: { video: VideoItem, onPlay: (v: VideoItem) => void }) {
    const [image, setImage] = useState<UIImage | null>(null);

    useEffect(() => {
        // 使用 Weight 核心組件進行異步加載，解決縮圖空白問題
        void UIImage.fromURL(video.thumbnail).then(img => {
            if (img) setImage(img);
        });
    }, [video.thumbnail]);

    return (
        <VStack
            frame={{ maxWidth: "infinity" }}
            onTapGesture={() => onPlay(video)}
            spacing={6}
            padding={8}
        >
            <ZStack frame={{ maxWidth: "infinity", height: 160 }} cornerRadius={12} background="rgba(255,255,255,0.05)">
                {image ? (
                    <Image
                        image={image}
                        resizable
                        scaleToFill
                        frame={{ maxWidth: "infinity", height: 160 }}
                        cornerRadius={12}
                    />
                ) : (
                    <ProgressView progressViewStyle="circular" />
                )}
                
                <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} alignment="bottomTrailing" padding={6}>
                    <Text font={{ size: 9 }} padding={2} background="rgba(0,0,0,0.7)" cornerRadius={4} foregroundStyle="white">
                        {video.duration}
                    </Text>
                </VStack>
            </ZStack>
            
            <VStack alignment="leading" spacing={2} frame={{ maxWidth: "infinity" }}>
                <Text font={{ size: 12, name: "system-bold" }} lineLimit={2} foregroundStyle="white">
                    {video.title}
                </Text>
                <Text font={{ size: 10 }} foregroundStyle="orange">
                    #{video.category}
                </Text>
            </VStack>
        </VStack>
    );
}

export function View() {
    const dismiss = Navigation.useDismiss();
    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [currentPlayVideo, setCurrentPlayVideo] = useState<VideoItem | null>(null);

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

    // 將資料分成 2 個一組，製作海報牆
    const chunkArray = (arr: VideoItem[], size: number) => {
        const rows = [];
        for (let i = 0; i < arr.length; i += size) {
            rows.push(arr.slice(i, i + size));
        }
        return rows;
    };

    const rows = chunkArray(videos, 2);

    return (
        <NavigationStack>
            <VStack
                navigationTitle={currentPlayVideo ? "正在放映" : "龍蝦影院"}
                background="#000000"
                toolbar={{
                    topBarLeading: [
                        <Button
                            title={currentPlayVideo ? "返回" : "關閉"}
                            systemImage={currentPlayVideo ? "chevron.left" : "xmark"}
                            action={() => {
                                if (currentPlayVideo) setCurrentPlayVideo(null);
                                else dismiss();
                            }}
                        />
                    ],
                    topBarTrailing: currentPlayVideo ? [] : [
                        <Button
                            title="重新整理"
                            systemImage="arrow.clockwise"
                            action={loadData}
                        />
                    ]
                }}
            >
                {currentPlayVideo ? (
                    // 播放模式：直接在 App 的目前視圖中渲染 Web 組件
                    <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }}>
                        <Web 
                            url={currentPlayVideo.url} 
                            frame={{ maxWidth: "infinity", maxHeight: "infinity" }}
                            allowsBackForwardNavigationGestures={true}
                        />
                    </VStack>
                ) : (
                    // 列表模式：神還原海報牆
                    <List refreshable={loadData}>
                        {isLoading && videos.length === 0 ? (
                            <VStack frame={{ maxWidth: "infinity", height: 100 }} alignment="center">
                                <ProgressView />
                                <Text marginTop={10} foregroundStyle="secondaryLabel">正在同步海報牆...</Text>
                            </VStack>
                        ) : null}

                        {rows.map((row, rowIdx) => (
                            <HStack key={`row-${rowIdx}`} frame={{ maxWidth: "infinity" }} spacing={8}>
                                {row.map((vid, colIdx) => (
                                    <PosterCard 
                                        key={`poster-${rowIdx}-${colIdx}`} 
                                        video={vid} 
                                        onPlay={setCurrentPlayVideo} 
                                    />
                                ))}
                                {row.length === 1 && <Spacer frame={{ maxWidth: "infinity" }} />}
                            </HStack>
                        ))}
                        <Spacer frame={{ height: 60 }} />
                    </List>
                )}
            </VStack>
        </NavigationStack>
    );
}
