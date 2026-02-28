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
  SharedAudioSession,
  useMemo,
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

function VideoCard({ video, onSelect }: { video: VideoItem; onSelect: (v: VideoItem) => void }) {
  const [thumb, setThumb] = useState<UIImage | null>(null);

  useEffect(() => {
    let active = true;
    // 正確的官方 API: UIImage.fromURL
    if (video.thumbnail) {
      void UIImage.fromURL(video.thumbnail).then((img) => {
        if (active && img) setThumb(img);
      });
    }
    return () => { active = false; };
  }, [video.thumbnail]);

  return (
    <VStack
      frame={{ maxWidth: "infinity" }}
      spacing={8}
      padding={4}
      onTapGesture={() => onSelect(video)}
    >
      <ZStack 
        frame={{ maxWidth: "infinity", height: 160 }} 
        cornerRadius={12} 
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
        <Text font="caption2" foregroundStyle="orange">
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

  // 依照 2.4.5 文檔，正確初始化 AVPlayer 與音訊會話
  const player = useMemo(() => {
    const p = new AVPlayer();
    SharedAudioSession.setActive(true);
    SharedAudioSession.setCategory("playback", ["defaultToSpeaker"]);
    return p;
  }, []);

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
    return () => player.dispose();
  }, []);

  // 切分兩欄數據
  const chunkedVideos = [];
  for (let i = 0; i < videos.length; i += 2) {
    chunkedVideos.push(videos.slice(i, i + 2));
  }

  return (
    <NavigationStack>
      <VStack
        navigationTitle={selectedVideo ? "正在放映" : "龍蝦影院"}
        background="#000"
        toolbar={selectedVideo ? {
          topBarLeading: [
            <Button
              title="返回"
              systemImage="chevron.left"
              action={() => {
                player.pause();
                setSelectedVideo(null);
              }}
            />,
          ]
        } : {
          topBarLeading: [
            <Button
              title="關閉"
              systemImage="xmark"
              action={dismiss}
            />,
          ],
          topBarTrailing: [
            <Button 
                title="重新整理"
                systemImage="arrow.clockwise" 
                action={loadData} 
            />
          ]
        }}
      >
        {selectedVideo ? (
          <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} background="#000">
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
                <VStack padding={20} alignment="leading" spacing={15}>
                  <Text font="headline" foregroundStyle="white" bold>{selectedVideo.title}</Text>
                  
                  <HStack spacing={10}>
                    <Text font="caption" foregroundStyle="orange">#{selectedVideo.category}</Text>
                    <Text font="caption" foregroundStyle="secondaryLabel">{selectedVideo.duration}</Text>
                  </HStack>

                  <Spacer frame={{ height: 20 }} />
                  
                  <Button
                    title={player.isPlaying ? "暫停放映" : "播放影片"}
                    systemImage={player.isPlaying ? "pause.fill" : "play.fill"}
                    buttonStyle="borderedProminent"
                    action={() => {
                      if (player.isPlaying) player.pause();
                      else {
                        player.setSource(selectedVideo.m3u8!);
                        player.play();
                      }
                    }}
                  />
                </VStack>
              </VStack>
            ) : (
                <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} alignment="center">
                    <Spacer />
                    <ProgressView />
                    <Text marginTop={10} foregroundStyle="secondaryLabel">高清串流加載失敗。</Text>
                    <Spacer />
                </VStack>
            )}
          </VStack>
        ) : (
          <ScrollView padding={12}>
            {isLoading && videos.length === 0 ? (
                 <VStack alignment="center" padding={40}>
                    <ProgressView />
                    <Text marginTop={10} foregroundStyle="secondaryLabel">同步海報中...</Text>
                 </VStack>
            ) : (
                <VStack spacing={16}>
                    {chunkedVideos.map((row, rowIdx) => (
                        <HStack key={rowIdx} spacing={12} frame={{ maxWidth: "infinity" }}>
                            {row.map((vid, colIdx) => (
                                <VideoCard key={colIdx} video={vid} onSelect={setSelectedVideo} />
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
