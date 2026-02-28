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
  Web,
} from "scripting";

interface Movie {
  title: string;
  url: string;
  thumbnail: string;
  duration: string;
  category: string;
}

const API_URL = "https://raw.githubusercontent.com/eric21364/scripting-test/main/status.json";

function MovieCard({ video, onSelect }: { video: Movie; onSelect: (v: Movie) => void }) {
  const [thumbnailImage, setThumbnailImage] = useState<UIImage | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const img = await UIImage.fromURL(video.thumbnail);
        if (active && img) setThumbnailImage(img);
      } catch (e) {
        console.log("Image load fail:", video.thumbnail);
      }
    })();
    return () => { active = false; };
  }, [video.thumbnail]);

  return (
    <VStack 
        frame={{ maxWidth: "infinity" }} 
        spacing={8}
        onTapGesture={() => onSelect(video)}
    >
      <ZStack frame={{ maxWidth: "infinity", height: 110 }} cornerRadius={8} background="#111" clipShape="rect">
        {thumbnailImage ? (
           <Image image={thumbnailImage} resizable scaleToFill frame={{ maxWidth: "infinity", height: 110 }} />
        ) : (
           <ProgressView progressViewStyle="circular" />
        )}
        <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} alignment="bottomTrailing" padding={4}>
           <Text font={{ size: 9 }} padding={3} background="rgba(0,0,0,0.7)" cornerRadius={4} foregroundStyle="white">
            {video.duration}
           </Text>
        </VStack>
      </ZStack>
      <Text font={{ size: 12, name: "system-medium" }} lineLimit={2} foregroundStyle="white" frame={{ height: 32 }}>
        {video.title}
      </Text>
    </VStack>
  );
}

export function View() {
  const dismiss = Navigation.useDismiss();
  const [data, setData] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Movie | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL + "?t=" + Date.now());
      const json = await res.json();
      if (json.kanav_list) setData(json.kanav_list);
    } catch (e) {
      console.log("Fetch data failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  // 注入 CSS 隱藏電站多餘 UI，只留播放器
  const css = `
    header, footer, .sidebar, .nav-main, .home-featured, .category-count, .m-footer, .header-mobile, #LowerRightAd, #dialog-kanav {
        display: none !important;
    }
    body, .main {
        background: black !important;
        margin: 0 !important;
        padding: 0 !important;
    }
    .video-holder, #player {
        width: 100vw !important;
        height: 56.25vw !important;
    }
  `;
  const js = `
    const style = document.createElement('style');
    style.innerHTML = \`${css}\`;
    document.head.appendChild(style);
  `;

  // 海報牆：每 3 個一組
  const chunks = [];
  for (let i = 0; i < data.length; i += 2) {
    chunks.push(data.slice(i, i + 2));
  }

  return (
    <NavigationStack>
      <VStack
        navigationTitle={selected ? "播放中" : "龍蝦影院"}
        background="#000"
        toolbar={{
          topBarLeading: [
            <Button
              title={selected ? "返回" : "離開"}
              systemImage={selected ? "chevron.left" : "xmark"}
              action={() => {
                if (selected) setSelected(null);
                else dismiss();
              }}
            />,
          ],
          topBarTrailing: selected ? [] : [
            <Button
              title="刷新"
              systemImage="arrow.clockwise"
              action={refresh}
            />,
          ],
        }}
      >
        {selected ? (
          <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }}>
            <Web 
                url={selected.url} 
                frame={{ maxWidth: "infinity", height: 260 }} 
                injectedJavaScript={js}
            />
            <ScrollView padding={16}>
                <VStack alignment="leading" spacing={8}>
                    <Text font="headline" foregroundStyle="white" bold>{selected.title}</Text>
                    <Text font="caption" foregroundStyle="orange">#{selected.category} · {selected.duration}</Text>
                    <Spacer frame={{ height: 20 }} />
                    <Text font="body" foregroundStyle="secondaryLabel">
                        龍蝦註：已啟用沉浸式放映模式，自動屏蔽側邊雜訊。
                    </Text>
                </VStack>
            </ScrollView>
          </VStack>
        ) : (
          <ScrollView padding={12}>
            {loading && data.length === 0 ? (
              <VStack alignment="center" padding={60}>
                <ProgressView />
                <Text marginTop={10} foregroundStyle="secondaryLabel">正在同步 Jable 數據...</Text>
              </VStack>
            ) : (
              <VStack spacing={16}>
                {chunks.map((row, ridx) => (
                  <HStack key={ridx} spacing={12}>
                    {row.map((item, cidx) => (
                      <MovieCard key={cidx} video={item} onSelect={setSelected} />
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
