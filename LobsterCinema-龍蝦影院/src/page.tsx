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

// 🛡️ 龍蝦物理全域鎖定
let LOBSTER_GLOBAL_PLAYER_LOCK = false;

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

function MoviePoster({ movie, itemWidth, globalLoadingId, setGlobalLoadingId }: { 
    movie: Movie, 
    itemWidth: number,
    globalLoadingId: string | null,
    setGlobalLoadingId: (id: string | null) => void 
}) {
  const movieId = movie.url;
  const isThisOpening = globalLoadingId === movieId;

  const openPlayer = async () => {
    if (LOBSTER_GLOBAL_PLAYER_LOCK) return;
    LOBSTER_GLOBAL_PLAYER_LOCK = true;
    setGlobalLoadingId(movieId);

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
        LOBSTER_GLOBAL_PLAYER_LOCK = false;
        setGlobalLoadingId(null);
        return;
      }
    } catch (e) {}

    const webView = new WebViewController();
    const css = `
      header, footer, nav, .navbar, .sidebar, .m-footer, .header-mobile,
      body { background: black !important; }
      #player, video, #dplayer { width: 100vw !important; height: 56.25vw !important; position: fixed !important; top: 0; left: 0; z-index: 99999; }
    `;
    await webView.loadURL(movie.url);
    await webView.evaluateJavaScript(`
        const style = document.createElement('style');
        style.innerHTML = \`${css}\`;
        document.head.appendChild(style);
    `);
    await webView.present({ fullscreen: true, navigationTitle: movie.title });
    LOBSTER_GLOBAL_PLAYER_LOCK = false;
    setGlobalLoadingId(null);
  };

  return (
    <VStack frame={{ width: itemWidth }} spacing={6} onTapGesture={openPlayer}>
      <ZStack frame={{ width: itemWidth, height: itemWidth * 0.5625 }} cornerRadius={10} background="secondarySystemBackground" clipShape="rect">
        <Thumbnail url={movie.thumbnail} />
        {isThisOpening && (
          <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} alignment="center" background="rgba(0,0,0,0.5)">
            <ProgressView />
          </VStack>
        )}
        <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} alignment="bottomTrailing" padding={6}>
          <Text font={{ size: 10, name: "system-bold" }} padding={3} background="rgba(0,0,0,0.75)" cornerRadius={4} foregroundStyle="white">
            {movie.duration}
          </Text>
        </VStack>
      </ZStack>
      <Text font={{ size: 12, name: "system-bold" }} lineLimit={2} opacity={(LOBSTER_GLOBAL_PLAYER_LOCK && !isThisOpening) ? 0.3 : 1}>
        {movie.title}
      </Text>
    </VStack>
  );
}

export function View() {
  const dismiss = Navigation.useDismiss();
  const [list, setList] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [globalLoadingId, setGlobalLoadingId] = useState<string | null>(null);

  const scrape = async (p: number) => {
    setLoading(true);
    setList([]);
    try {
      const resp = await fetch(`https://jable.tv/hot/?mode=async&function=get_block&block_id=list_videos_common_videos_list&sort_by=post_date&from=${(p - 1) * 24}&_=${Date.now()}`, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      const html = await resp.text();
      const cardRegex = /<div class="video-img-box[^>]*>[\s\S]*?<a href="([^"]+)"[^>]*>[\s\S]*?<img[^>]*?data-src="([^"]+)"[^>]*?>[\s\S]*?<span class="label">([^<]+)<\/span>[\s\S]*?<(?:div|h6) class="title">[\s\S]*?<a[^>]*>([^<]+)<\/a>/g;
      const results: Movie[] = [];
      let m;
      while ((m = cardRegex.exec(html)) !== null) {
        if (m[2] && !m[2].includes('placeholder')) results.push({ url: m[1], thumbnail: m[2], duration: m[3], title: m[4], category: "LIVE" });
      }
      setList(results);
    } catch (e) {} finally { setLoading(false); }
  };

  useEffect(() => { scrape(page); LOBSTER_GLOBAL_PLAYER_LOCK = false; setGlobalLoadingId(null); }, [page]);

  const handleNext = () => { if (!LOBSTER_GLOBAL_PLAYER_LOCK) setPage(p => p + 1); };
  const handlePrev = () => { if (!LOBSTER_GLOBAL_PLAYER_LOCK) setPage(p => Math.max(1, p - 1)); };

  return (
    <VStack background="systemBackground" frame={{ maxWidth: "infinity", maxHeight: "infinity" }}>
      {/* 🛠️ 鋼鐵防護 Header：完全獨立，不被任何手勢覆蓋 */}
      <HStack padding={16} alignment="center" background="systemBackground">
        <Button title="關閉" systemImage="xmark" action={dismiss} />
        <Spacer />
        <VStack alignment="center">
          <Text font={{ size: 17, name: "system-bold" }}>龍蝦影院 v9</Text>
          <Text font={{ size: 11 }} foregroundStyle="secondaryLabel">第 {page} 頁</Text>
        </VStack>
        <Spacer />
        <HStack spacing={20}>
          <Button systemImage="chevron.left" action={handlePrev} />
          <Button systemImage="chevron.right" action={handleNext} />
        </HStack>
      </HStack>

      <GeometryReader>
        {(proxy) => {
          const columns = proxy.size.width > 600 ? 4 : 2;
          const spacing = 12;
          const itemWidth = (proxy.size.width - spacing * (columns + 1)) / columns;
          const chunks = [];
          for (let i = 0; i < list.length; i += columns) chunks.push(list.slice(i, i + columns));

          return (
            /* 🛡️ 物理手勢限縮：DragGesture 只掛載在 ScrollView 上，絕不干擾 Header */
            <ScrollView 
                padding={spacing}
                simultaneousGesture={DragGesture({ minDistance: 60 }).onEnded((event) => {
                    const dx = event.translation.width;
                    if (Math.abs(dx) > 100) {
                        if (dx < 0) handleNext();
                        else handlePrev();
                    }
                })}
            >
                {loading && list.length === 0 ? (
                    <VStack alignment="center" padding={60}><ProgressView /><Text marginTop={10}>龍蝦領航中...</Text></VStack>
                ) : (
                    <VStack spacing={18}>
                        {chunks.map((row, idx) => (
                            <HStack key={'r' + page + idx} spacing={spacing} frame={{ maxWidth: "infinity" }} alignment="top">
                                {row.map((item, cidx) => (
                                    <MoviePoster 
                                        key={'m' + page + idx + cidx} 
                                        movie={item} 
                                        itemWidth={itemWidth} 
                                        globalLoadingId={globalLoadingId}
                                        setGlobalLoadingId={setGlobalLoadingId}
                                    />
                                ))}
                                {row.length < columns && Array.from({ length: columns - row.length }).map((_, i) => (
                                    <Spacer key={'s' + i} frame={{ width: itemWidth }} />
                                ))}
                            </HStack>
                        ))}
                        <Spacer frame={{ height: 120 }} />
                    </VStack>
                )}
            </ScrollView>
          );
        }}
      </GeometryReader>
    </VStack>
  );
}
