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

function VideoCard({ video, onPlay }: { video: VideoItem; onPlay: (v: VideoItem) => void }) {
  const [thumb, setThumb] = useState<UIImage | null>(null);

  useEffect(() => {
    let active = true;
    // 重點 1: 確保 URL 有效，並且使用對齊文檔的 UIImage.from 靜態方法
    if (video.thumbnail) {
      UIImage.from(video.thumbnail)
        .then((img) => {
          if (active && img) setThumb(img);
        })
        .catch(err => console.log("圖片載入失敗:", err));
    }
    return () => { active = false; };
  }, [video.thumbnail]);

  return (
    <VStack
      frame={{ maxWidth: "infinity" }}
      spacing={8}
      padding={12}
      background="rgba(255,255,255,0.05)"
      cornerRadius={12}
      onTapGesture={() => onPlay(video)}
    >
      <ZStack frame={{ maxWidth: "infinity", height: 180 }} cornerRadius={8} background="#111" clipShape="rect">
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
          <Text 
            font={{ size: 10, name: "system-bold" }} 
            padding={{ horizontal: 5, vertical: 2 }}
            background="rgba(0,0,0,0.7)" 
            cornerRadius={4}
            foregroundStyle="white"
          >
            {video.duration}
          </Text>
        </VStack>
        
        <Image systemName="play.circle.fill" font={34} foregroundStyle="rgba(255,255,255,0.5)" />
      </ZStack>
      
      <VStack alignment="leading" spacing={2} frame={{ maxWidth: "infinity" }}>
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
  
  // 重點 2: 使用 useState 正確持有 AVPlayer 實例
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
  }, [player]);

  // 切分兩欄設計
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
                {/* 重點 3: 確保 setSource 正確執行並觸發 play */}
                <AVPlayerView
                  player={player}
                  frame={{ maxWidth: "infinity", height: 260 }}
                  onAppear={() => {
                    console.log("正在加載 M3U8:", selectedVideo.m3u8);
                    player.setSource(selectedVideo.m3u8!);
                    player.play();
                  }}
                />
                <VStack padding={20} alignment="leading" spacing={15}>
                  <Text font="headline" foregroundStyle="white">{selectedVideo.title}</Text>
                  
                  <HStack spacing={10}>
                    <Text font="caption" foregroundStyle="orange">#{selectedVideo.category}</Text>
                    <Text font="caption" foregroundStyle="secondaryLabel">{selectedVideo.duration}</Text>
                  </HStack>

                  <Spacer frame={{ height: 10 }} />
                  
                  {/* 重點 4: 手動播放按鈕加上文字與圖示，確保可以強制觸發 */}
                  <Button
                    title={player.isPlaying ? "暫停影片" : "點擊開始播放"}
                    systemImage={player.isPlaying ? "pause.fill" : "play.fill"}
                    buttonStyle="borderedProminent"
                    action={() => {
                      if (player.isPlaying) player.pause();
                      else {
                        // 雙重保險：如果沒 source 則重新設定
                        player.setSource(selectedVideo.m3u8!);
                        player.play();
                      }
                    }}
                  />
                  
                  <Text font="caption2" foregroundStyle="secondaryLabel" marginTop={10}>
                    提示：若畫面未出現，請點選上方「開始播放」按鈕。
                  </Text>
                </VStack>
              </VStack>
            ) : (
                <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} alignment="center">
                    <Spacer />
                    <ProgressView />
                    <Text marginTop={10} foregroundStyle="secondaryLabel">高清源提取失敗，請嘗試按返回重新整理...</Text>
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
                <VStack spacing={16}>
                    {rows.map((row, rowIdx) => (
                        <HStack key={`row-${rowIdx}`} spacing={12} frame={{ maxWidth: "infinity" }}>
                            {row.map((vid, colIdx) => (
                                <VideoCard key={`col-${colIdx}`} video={vid} onSelect={setSelectedVideo} />
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
