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
  ZStack,
  UIImage,
  AVPlayer,
  AVPlayerView,
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

function VideoPoster({ video, onSelect }: { video: VideoItem; onSelect: (v: VideoItem) => void }) {
  const [thumb, setThumb] = useState<UIImage | null>(null);

  useEffect(() => {
    let active = true;
    // 官方 2.4.5 標準 UIImage.from 用法
    UIImage.from(video.thumbnail).then((img) => {
      if (active && img) setThumb(img);
    });
    return () => { active = false; };
  }, [video.thumbnail]);

  return (
    <VStack
      frame={{ maxWidth: "infinity" }}
      spacing={8}
      onTapGesture={() => onSelect(video)}
    >
      <ZStack 
        frame={{ maxWidth: "infinity", height: 160 }} 
        cornerRadius={10} 
        background="rgba(255,255,255,0.08)"
        clipShape="rect"
      >
        {thumb ? (
          <Image
            image={thumb}
            resizable
            scaleToFill
            frame={{ maxWidth: "infinity", height: 160 }}
          />
        ) : (
          <ProgressView />
        )}
        
        {/* 底部浮動時長標籤 */}
        <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} alignment="bottomTrailing" padding={6}>
            <Text 
                font={{ size: 9, name: "system-bold" }} 
                padding={{ horizontal: 5, vertical: 2 }}
                background="rgba(0,0,0,0.7)" 
                cornerRadius={4}
                foregroundStyle="white"
            >
                {video.duration}
            </Text>
        </VStack>
        
        <Image systemName="play.fill" font={20} foregroundStyle="rgba(255,255,255,0.4)" />
      </ZStack>
      
      <VStack alignment="leading" spacing={2} frame={{ maxWidth: "infinity" }}>
        <Text font={{ size: 12, name: "system-medium" }} lineLimit={2} foregroundStyle="white">
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
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [player] = useState(() => new AVPlayer());

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
    return () => player.pause();
  }, []);

  // 將資料切成 2 欄方便展示
  const chunkedVideos = [];
  for (let i = 0; i < videos.length; i += 2) {
    chunkedVideos.push(videos.slice(i, i + 2));
  }

  return (
    <NavigationStack>
      <VStack
        navigationTitle={selectedVideo ? "正在播放" : "龍蝦影院"}
        background="#000"
        toolbar={{
          topBarLeading: [
            <Button
              action={() => {
                if (selectedVideo) {
                  player.pause();
                  setSelectedVideo(null);
                } else {
                  dismiss();
                }
              }}
            >
              <Image systemName={selectedVideo ? "chevron.left" : "xmark"} />
            </Button>,
          ],
          topBarTrailing: selectedVideo ? [] : [
            <Button action={loadData}>
              <Image systemName="arrow.clockwise" />
            </Button>
          ]
        }}
      >
        {selectedVideo ? (
          <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }}>
            {selectedVideo.m3u8 ? (
              <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }}>
                <AVPlayerView
                  player={player}
                  frame={{ maxWidth: "infinity", height: 260 }}
                  onAppear={() => {
                    player.setSource(selectedVideo.m3u8!);
                    player.play();
                  }}
                />
                <VStack padding={20} alignment="leading" spacing={12}>
                  <Text font="headline" foregroundStyle="white">{selectedVideo.title}</Text>
                  <Text font="caption" foregroundStyle="secondaryLabel">{selectedVideo.category} · {video_info_text(selectedVideo)}</Text>
                  <Spacer frame={{ height: 10 }} />
                  <Button
                    title={player.isPlaying ? "暫停" : "播放"}
                    systemImage={player.isPlaying ? "pause.fill" : "play.fill"}
                    buttonStyle="borderedProminent"
                    action={() => {
                      if (player.isPlaying) player.pause();
                      else player.play();
                    }}
                  />
                  <Text font="body" foregroundStyle="secondaryLabel" marginTop={20}>
                    龍蝦提示：已成功加載原生串流，若連線不順可點選重整。
                  </Text>
                </VStack>
              </VStack>
            ) : (
                <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} alignment="center">
                    <Spacer />
                    <ProgressView />
                    <Text marginTop={10} foregroundStyle="secondaryLabel">正在提取高清串流源...</Text>
                    <Spacer />
                </VStack>
            )}
          </VStack>
        ) : (
          <ScrollView padding={12}>
            {isLoading && videos.length === 0 ? (
                 <VStack alignment="center" padding={40}>
                    <ProgressView />
                    <Text marginTop={10} foregroundStyle="secondaryLabel">影院同步中...</Text>
                 </VStack>
            ) : (
                <VStack spacing={20}>
                    {chunkedVideos.map((row, rowIdx) => (
                        <HStack key={rowIdx} spacing={12} frame={{ maxWidth: "infinity" }}>
                            {row.map((vid, colIdx) => (
                                <VideoPoster key={colIdx} video={vid} onSelect={setSelectedVideo} />
                            ))}
                            {row.length === 1 && <Spacer frame={{ maxWidth: "infinity" }} />}
                        </HStack>
                    ))}
                    <Spacer frame={{ height: 60 }} />
                </VStack>
            )}
          </ScrollView>
        )}
      </VStack>
    </NavigationStack>
  );
}

function video_info_text(v: any) {
    return `${v.duration || "未知"}`;
}
