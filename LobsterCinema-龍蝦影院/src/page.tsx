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

function VideoCard({ video, onPlay }: { video: VideoItem; onPlay: (v: VideoItem) => void }) {
  const [thumb, setThumb] = useState<UIImage | null>(null);

  useEffect(() => {
    let active = true;
    // 正確的 UIImage.from 靜態方法用法
    void UIImage.from(video.thumbnail).then((img) => {
      if (active && img) setThumb(img);
    });
    return () => {
      active = false;
    };
  }, [video.thumbnail]);

  return (
    <VStack
      spacing={8}
      frame={{ maxWidth: "infinity" }}
      onTapGesture={() => onPlay(video)}
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
        <Image systemName="play.circle.fill" font={40} foregroundStyle="rgba(255,255,255,0.5)" />
      </ZStack>
      <VStack alignment="leading" spacing={2}>
        <Text font="subheadline" bold lineLimit={2} foregroundStyle="white">
          {video.title}
        </Text>
        <Text font="caption" foregroundStyle="orange">
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

  // 1. 初始化 AVPlayer
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
    // 組件卸載時自動停止播放
    return () => player.pause();
  }, [player]);

  return (
    <NavigationStack>
      <VStack
        navigationTitle={selectedVideo ? "正在放映" : "龍蝦影院"}
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
          topBarTrailing: selectedVideo
            ? []
            : [
                <Button action={loadData}>
                  <Image systemName="arrow.clockwise" />
                </Button>,
              ],
        }}
      >
        {selectedVideo ? (
          <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} background="#000">
            {selectedVideo.m3u8 ? (
              <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }}>
                {/* 2. 使用 AVPlayerView 調用 AVPlayer 進行原生播放 */}
                <AVPlayerView
                  player={player}
                  frame={{ maxWidth: "infinity", height: 240 }}
                  onAppear={() => {
                    player.setSource(selectedVideo.m3u8!);
                    player.play();
                  }}
                />
                <VStack padding={20} alignment="leading" spacing={12}>
                  <Text font="title3" bold foregroundStyle="white">
                    {selectedVideo.title}
                  </Text>
                  <Text font="caption" foregroundStyle="secondaryLabel">
                    {selectedVideo.category} · {selectedVideo.duration}
                  </Text>
                  <Spacer frame={{ height: 10 }} />
                  <HStack spacing={12}>
                    <Button
                      title={player.isPlaying ? "暫停" : "播放"}
                      systemImage={player.isPlaying ? "pause.fill" : "play.fill"}
                      buttonStyle="bordered"
                      action={() => {
                        if (player.isPlaying) player.pause();
                        else player.play();
                      }}
                    />
                  </HStack>
                </VStack>
              </VStack>
            ) : (
              <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} alignment="center">
                <Spacer />
                <ProgressView />
                <Text marginTop={10} foregroundStyle="secondaryLabel">
                  正在提取串流源...
                </Text>
                <Spacer />
              </VStack>
            )}
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
