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
    Video,
} from "scripting";

interface VideoItem {
    title: string;
    url: string;
    thumbnail: string;
    duration: string;
    category: string;
    m3u8?: string;
}

const DATA_URL = "https://raw.githubusercontent.com/eric21364/scripting-test/main/status.json";

function PosterCard({ video, onPlay }: { video: VideoItem, onPlay: (v: VideoItem) => void }) {
    const [image, setImage] = useState<UIImage | null>(null);

    useEffect(() => {
        let active = true;
        void UIImage.fromURL(video.thumbnail).then(img => {
            if (active && img) setImage(img);
        });
        return () => { active = false; };
    }, [video.thumbnail]);

    return (
        <VStack
            frame={{ maxWidth: "infinity" }}
            onTapGesture={() => onPlay(video)}
            spacing={6}
            padding={8}
        >
            <ZStack frame={{ maxWidth: "infinity", height: 160 }} cornerRadius={12} background="rgba(255,255,255,0.05)" clipShape="rect">
                {image ? (
                    <Image
                        image={image}
                        resizable
                        scaleToFill
                        frame={{ maxWidth: "infinity", height: 160 }}
                    />
                ) : (
                    <ProgressView progressViewStyle="circular" />
                )}
                
                <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} alignment="bottomTrailing" padding={6}>
                    <Text font={{ size: 9 }} padding={2} background="rgba(0,0,0,0.7)" cornerRadius={4} foregroundStyle="white">
                        {video.duration}
                    </Text>
                </VStack>
                
                <Image systemName="play.fill" font={24} foregroundStyle="rgba(255,255,255,0.5)" />
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
                            title="刷新"
                            systemImage="arrow.clockwise"
                            action={loadData}
                        />
                    ]
                }}
            >
                {currentPlayVideo ? (
                    <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} background="#000">
                        {currentPlayVideo.m3u8 ? (
                            <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }}>
                                <Video 
                                    url={currentPlayVideo.m3u8} 
                                    autoplay={true} 
                                    frame={{ maxWidth: "infinity", maxHeight: "infinity" }} 
                                />
                                <VStack padding={20} alignment="leading" spacing={12}>
                                    <Text font="headline" foregroundStyle="white">{currentPlayVideo.title}</Text>
                                    <Text font="caption" foregroundStyle="secondaryLabel">{currentPlayVideo.category} · {currentPlayVideo.duration}</Text>
                                </VStack>
                            </VStack>
                        ) : (
                            <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} alignment="center">
                                <Spacer />
                                <ProgressView />
                                <Text marginTop={10} foregroundStyle="secondaryLabel">正在提取無廣告高清源...</Text>
                                <Spacer />
                            </VStack>
                        )}
                    </VStack>
                ) : (
                    <List refreshable={loadData}>
                        {isLoading && videos.length === 0 ? (
                            <VStack frame={{ maxWidth: "infinity", height: 100 }} alignment="center">
                                <ProgressView />
                                <Text marginTop={10} foregroundStyle="secondaryLabel">影院佈置中...</Text>
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
