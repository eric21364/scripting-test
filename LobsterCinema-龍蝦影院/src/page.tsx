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

function VideoCard({ video, onSelect }: { video: VideoItem; onSelect: (v: VideoItem) => void }) {
  const [thumb, setThumb] = useState<UIImage | null>(null);

  useEffect(() => {
    let active = true;
    // 依據官方文件，UIImage.from(url) 是正確加載外部縮圖的靜態方法
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
        cornerRadius={12} 
        background="rgba(255,255,255,0.05)"
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
        
        <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} alignment="bottomTrailing" padding={8}>
          <Text 
            font={{ size: 10, name: "system-bold" }} 
            padding={{ horizontal: 6, vertical: 3 }}
            background="rgba(0,0,0,0.75)" 
            cornerRadius={4}
            foregroundStyle="white"
          >
            {video.duration}
          </Text>
        </VStack>

        <Image systemName="play.circle.fill" font={34} foregroundStyle="rgba(255,255,255,0.6)" />
      </ZStack>
      
      <VStack alignment="leading" spacing={2} padding={{ horizontal: 4 }}>
        <Text font={{ size: 13, name: "system-bold" }} lineLimit={2} foregroundStyle="white">
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
  const [player] = useState(() => new AVPlayer());

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 加上快取破壞參數
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
  }, [player]);

  // 切分兩欄數據
  const rows = [];
  for (let i = 0; i < videos.length; i += 2) {
    rows.push(videos.slice(i, i + 2));
  }

  return (
    <NavigationStack>
      <VStack
        navigationTitle={selectedVideo ? "正在放映" : "龍蝦影院"}
        background="#000"
        toolbar={{
          topBarLeading: [
            <Button
              title={selectedVideo ? "返回" : "關閉"}
              systemImage={selectedVideo ? "chevron.left" : "xmark"}
              action={() => {
                if (selectedVideo) {
                  player.pause();
                  setSelectedVideo(null);
                } else {
                  dismiss();
                }
              }}
            />,
          ],
          topBarTrailing: selectedVideo ? [] : [
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
                <VStack padding={20} alignment="leading" spacing={12}>
                  <Text font="headline" foregroundStyle="white">{selectedVideo.title}</Text>
                  <HStack spacing={10}>
                    <Text font="caption" foregroundStyle="orange">#{selectedVideo.category}</Text>
                    <Text font="caption" foregroundStyle="secondaryLabel">{selectedVideo.duration}</Text>
                  </HStack>
                  <Spacer frame={{ height: 20 }} />
                  <Button
                    title={player.isPlaying ? "暫停放映" : "繼續播放"}
                    systemImage={player.isPlaying ? "pause.fill" : "play.fill"}
                    buttonStyle="borderedProminent"
                    action={() => {
                      if (player.isPlaying) player.pause();
                      else player.play();
                    }}
                  />
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
          <ScrollView padding={12}>
            {isLoading && videos.length === 0 ? (
                 <VStack alignment="center" padding={40}>
                    <ProgressView />
                    <Text marginTop={10} foregroundStyle="secondaryLabel">海報牆同步中...</Text>
                 </VStack>
            ) : (
                <VStack spacing={20}>
                    {rows.map((row, rowIdx) => (
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
