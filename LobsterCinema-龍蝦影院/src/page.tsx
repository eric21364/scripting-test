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
  DragGesture,
} from "scripting";

interface Movie {
  title: string;
  url: string;
  thumbnail: string;
  duration: string;
  category: string;
}

// 🛡️ 龍蝦單例鎖：防止重複開啟
let GLOBAL_PLAYER_OPENING = false;

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
      frame={{ maxWidth: "infinity", height: "infinity" }}
    />
  );
}

function MoviePoster({ movie, itemWidth, currentLoadingId, setcurrentLoadingId }: any) {
  const isOpening = currentLoadingId === movie.url;

  const openPlayer = async () => {
    if (GLOBAL_PLAYER_OPENING) return;
    GLOBAL_PLAYER_OPENING = true;
    setcurrentLoadingId(movie.url);

    try {
      const resp = await fetch(movie.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1' }
      });
      const html = await resp.text();
      const match = html.match(/hlsUrl\s*=\s*['"]([^'"]+\.m3u8)['"]/);

      if (match && match[1]) {
        const player = new WebViewController();
        await player.loadURL(match[1]);
        await player.present({ fullscreen: true, navigationTitle: movie.title });
        GLOBAL_PLAYER_OPENING = false;
        setcurrentLoadingId(null);
        return;
      }
    } catch (e) {}

    const webView = new WebViewController();
    const css = `header, footer, nav, .navbar, .sidebar { display: none !important; } body { background: black !important; } #player, video { width: 100vw !important; height: 56.25vw !important; }`;
    await webView.loadURL(movie.url);
    await webView.evaluateJavaScript(`const s = document.createElement('style'); s.innerHTML = \`${css}\`; document.head.appendChild(s);`);
    await webView.present({ fullscreen: true, navigationTitle: movie.title });
    GLOBAL_PLAYER_OPENING = false;
    setcurrentLoadingId(null);
  };

  return (
    <VStack frame={{ width: itemWidth }} spacing={6} onTapGesture={openPlayer}>
      <ZStack frame={{ width: itemWidth, height: itemWidth * 0.5625 }} cornerRadius={10} background="secondarySystemBackground" clipShape="rect">
        <Thumbnail url={movie.thumbnail} />
        {isOpening && <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} alignment="center" background="rgba(0,0,0,0.4)"><ProgressView /></VStack>}
        <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} alignment="bottomTrailing" padding={6}>
          <Text font={{ size: 10, name: "system-bold" }} padding={3} background="rgba(0,0,0,0.75)" cornerRadius={4} foregroundStyle="white">{movie.duration}</Text>
        </VStack>
      </ZStack>
      <Text font={{ size: 12, name: "system-bold" }} lineLimit={2} opacity={(GLOBAL_PLAYER_OPENING && !isOpening) ? 0.3 : 1}>{movie.title}</Text>
    </VStack>
  );
}

export function View() {
  const [list, setList] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [currentLoadingId, setcurrentLoadingId] = useState<string | null>(null);

  const scrape = async (p: number) => {
    setLoading(true);
    setList([]);
    try {
      const resp = await fetch(`https://jable.tv/hot/?mode=async&function=get_block&block_id=list_videos_common_videos_list&sort_by=post_date&from=${(p - 1) * 24}&_=${Date.now()}`, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      const html = await resp.text();
      const cardRegex = /<div class="video-img-box[^>]*>[\s\S]*?<a href="([^"]+)"[^>]*>[\s\S]*?<img[^>]*?data-src="([^"]+)"[^>]*?>[\s\S]*?<span class="label">([^<]+)<\/span>[\s\S]*?<(?:div|h6) class="title">[\s\S]*?<a[^>]*>([^<]+)<\/a>/g;
      const res: Movie[] = [];
      let m;
      while ((m = cardRegex.exec(html)) !== null) {
        if (m[2] && !m[2].includes('placeholder')) res.push({ url: m[1], thumbnail: m[2], duration: m[3], title: m[4], category: "LIVE" });
      }
      setList(res);
    } catch (e) {} finally { setLoading(false); }
  };

  useEffect(() => { 
    scrape(page); 
    GLOBAL_PLAYER_OPENING = false;
    setcurrentLoadingId(null);
  }, [page]);

  const handleNext = () => { if (!GLOBAL_PLAYER_OPENING) setPage(p => p + 1); };
  const handlePrev = () => { if (!GLOBAL_PLAYER_OPENING) setPage(p => Math.max(1, p - 1)); };

  return (
    <NavigationStack>
      <VStack
        navigationTitle={`龍蝦影院 (P.${page})`}
        toolbar={{
          topBarLeading: [
            <Button key="close" systemImage="xmark" action={() => Navigation.dismiss()} />
          ],
          topBarTrailing: [
            <Button key="prev" systemImage="chevron.left" action={handlePrev} disabled={page === 1} />,
            <Button key="next" systemImage="chevron.right" action={handleNext} />
          ]
        }}
      >
        <GeometryReader>
          {(proxy) => {
            const columns = proxy.size.width > 600 ? 4 : 2;
            const spacing = 12;
            const itemWidth = (proxy.size.width - spacing * (columns + 1)) / columns;
            const chunks = [];
            for (let i = 0; i < list.length; i += columns) chunks.push(list.slice(i, i + columns));

            return (
              <ScrollView 
                padding={spacing}
                simultaneousGesture={DragGesture({ minDistance: 100 }).onEnded((event) => {
                    const dx = event.translation.width;
                    const dy = event.translation.height;
                    // 🛡️ 龍蝦手勢標校：必須是明確的橫向大動作 (角度過濾)
                    if (Math.abs(dx) > 150 && Math.abs(dx) > Math.abs(dy) * 1.5) {
                        if (dx < 0) handleNext();
                        else handlePrev();
                    }
                })}
              >
                {loading && list.length === 0 ? (
                  <VStack alignment="center" padding={60}><ProgressView /><Text marginTop={10} foregroundStyle="secondaryLabel">龍蝦正在換檔...</Text></VStack>
                ) : (
                  <VStack spacing={18}>
                    {chunks.map((row, idx) => (
                      <HStack key={`r${page}_${idx}`} spacing={spacing} frame={{ maxWidth: "infinity" }} alignment="top">
                        {row.map((item, cidx) => (
                          <MoviePoster key={item.url} movie={item} itemWidth={itemWidth} currentLoadingId={currentLoadingId} setcurrentLoadingId={setcurrentLoadingId} />
                        ))}
                        {row.length < columns && Array.from({ length: columns - row.length }).map((_, i) => (
                          <Spacer key={`s${i}`} frame={{ width: itemWidth }} />
                        ))}
                      </HStack>
                    ))}
                    {list.length > 0 && (
                        <VStack alignment="center" padding={30} spacing={15}>
                            <HStack spacing={40}>
                                <Button title="上一頁" action={handlePrev} disabled={page === 1} buttonStyle="bordered" />
                                <Button title="下一頁" action={handleNext} buttonStyle="bordered" />
                            </HStack>
                            <Text font={{ size: 10 }} foregroundStyle="quaternaryLabel">💡 由側邊大範圍橫向滑動可翻頁 (第 {page} 頁)</Text>
                        </VStack>
                    )}
                    <Spacer frame={{ height: 120 }} />
                  </VStack>
                )}
              </ScrollView>
            );
          }}
        </GeometryReader>
      </VStack>
    </NavigationStack>
  );
}
