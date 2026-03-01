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
  WebViewController,
  GeometryReader,
} from "scripting";

interface Movie {
  title: string;
  url: string;
  thumbnail: string;
  duration: string;
  category: string;
}

function Thumbnail({ url }: { url: string }) {
  const [image, setImage] = useState<UIImage | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const loaded = await UIImage.fromURL(url);
        if (active && loaded) setImage(loaded);
      } catch (e) {}
    })();
    return () => { active = false; };
  }, [url]);

  if (!image) return <ProgressView progressViewStyle="circular" />;
  
  return (
    <Image
      image={image}
      resizable
      scaleToFill
      frame={{ maxWidth: "infinity", height: 100 }}
    />
  );
}

function MoviePoster({ movie, itemWidth }: { movie: Movie, itemWidth: number }) {
  const openPlayer = async () => {
    // ... 快取 M3U8 邏輯保持不變 ...
    const webView = new WebViewController();
    // ... CSS 注入邏輯保持不變 ...
  };

  const imageHeight = itemWidth * 0.5625; // 強制 16:9 比例

  return (
    <VStack frame={{ width: itemWidth }} spacing={6} onTapGesture={openPlayer}>
      <ZStack frame={{ width: itemWidth, height: imageHeight }} cornerRadius={10} background="#111" clipShape="rect">
        <Thumbnail url={movie.thumbnail} />
        <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} alignment="bottomTrailing" padding={6}>
          <Text font={{ size: 10, name: "system-bold" }} padding={3} background="rgba(0,0,0,0.75)" cornerRadius={4} foregroundStyle="white">
            {movie.duration}
          </Text>
        </VStack>
      </ZStack>
      <VStack alignment="leading" spacing={2} padding={{ leading: 2, trailing: 2 }}>
        <Text font={{ size: 12, name: "system-bold" }} lineLimit={2} foregroundStyle="white">
          {movie.title}
        </Text>
      </VStack>
    </VStack>
  );
}

export function View() {
  const dismiss = Navigation.useDismiss();
  const [list, setList] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // ... scrapeJableLivePage 邏輯保持不變 ...

  return (
    <NavigationStack>
      <GeometryReader>
        {(proxy) => {
          // 🧠 龍蝦智慧佈局：根據螢幕寬度自動決定欄數
          // 若寬度 > 600 (iPad/橫向) 則一排 4 個，否則一排 2 個
          const columns = proxy.size.width > 600 ? 4 : 2;
          const spacing = 12;
          const totalSpacing = spacing * (columns + 1);
          const itemWidth = (proxy.size.width - totalSpacing) / columns;

          const chunks = [];
          for (let i = 0; i < list.length; i += columns) {
            chunks.push(list.slice(i, i + columns));
          }

          return (
            <VStack
              navigationTitle={`龍蝦 v9・智能排版版 (P.${page})`}
              background="#000"
              toolbar={{
                topBarLeading: [
                  <Button title="離開" systemImage="xmark" action={dismiss} />
                ],
                topBarTrailing: [
                  <HStack spacing={20}>
                    {page > 1 && (
                      <Button title="後退" systemImage="chevron.left" action={() => setPage(page - 1)} />
                    )}
                    <Button title="前進" systemImage="chevron.right" action={() => setPage(page + 1)} />
                  </HStack>
                ]
              }}
            >
              <ScrollView padding={spacing}>
                {loading ? (
                  <VStack alignment="center" padding={60}>
                    <ProgressView />
                    <Text marginTop={10} foregroundStyle="secondaryLabel">正在由王者探針進行智能佈局採集...</Text>
                  </VStack>
                ) : (
                  <VStack spacing={18}>
                    {chunks.map((row, idx) => (
                      <HStack key={idx} spacing={spacing} frame={{ maxWidth: "infinity" }} alignment="top">
                        {row.map((item, cidx) => (
                          <MoviePoster key={cidx} movie={item} itemWidth={itemWidth} />
                        ))}
                        {row.length < columns && Array.from({ length: columns - row.length }).map((_, i) => (
                          <Spacer key={i} frame={{ width: itemWidth }} />
                        ))}
                      </HStack>
                    ))}
                    <Spacer frame={{ height: 120 }} />
                  </VStack>
                )}
              </ScrollView>
            </VStack>
          );
        }}
      </GeometryReader>
    </NavigationStack>
  );
}
