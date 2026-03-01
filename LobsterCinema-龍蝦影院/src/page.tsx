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

// 🛡️ 龍蝦物理單例鎖
let GLOBAL_PLAYER_LOCK = false;

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
  return <Image image={image} resizable scaleToFill frame={{ maxWidth: "infinity", height: "infinity" }} />;
}

function MoviePoster({ movie, itemWidth, loadingId, setLoadingId }: any) {
  const isThisLoading = loadingId === movie.url;
  const openPlayer = async () => {
    if (GLOBAL_PLAYER_LOCK) return;
    GLOBAL_PLAYER_LOCK = true;
    setLoadingId(movie.url);
    const safeRelease = setTimeout(() => { GLOBAL_PLAYER_LOCK = false; setLoadingId(null); }, 12000);

    try {
      const resp = await fetch(movie.url, { headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1' } });
      const html = await resp.text();
      const match = html.match(/hlsUrl\s*=\s*['"]([^'"]+\.m3u8)['"]/);
      if (match && match[1]) {
        const player = new WebViewController();
        await player.loadURL(match[1]);
        await player.present({ fullscreen: true, navigationTitle: movie.title });
        return;
      }
      const webView = new WebViewController();
      await webView.loadURL(movie.url);
      await webView.present({ fullscreen: true, navigationTitle: movie.title });
    } catch (e) {
    } finally {
      clearTimeout(safeRelease);
      GLOBAL_PLAYER_LOCK = false;
      setLoadingId(null);
    }
  };

  return (
    <VStack frame={{ width: itemWidth }} spacing={6} onTapGesture={openPlayer}>
      <ZStack frame={{ width: itemWidth, height: itemWidth * 0.5625 }} cornerRadius={10} background="secondarySystemBackground" clipShape="rect">
        <Thumbnail url={movie.thumbnail} />
        {isThisLoading && <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} alignment="center" background="rgba(0,0,0,0.5)"><ProgressView /></VStack>}
        <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} alignment="bottomTrailing" padding={6}>
          <Text font={{ size: 10, name: "system-bold" }} padding={3} background="rgba(0,0,0,0.7)" cornerRadius={4} foregroundStyle="white">{movie.duration}</Text>
        </VStack>
      </ZStack>
      <Text font={{ size: 12, name: "system-bold" }} lineLimit={2} opacity={(GLOBAL_PLAYER_LOCK && !isThisLoading) ? 0.3 : 1}>{movie.title}</Text>
    </VStack>
  );
}

export function View() {
  const dismiss = Navigation.useDismiss();
  const [list, setList] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const fetchData = async (p: number) => {
    setLoading(true);
    setList([]);
    try {
      const resp = await fetch(`https://jable.tv/hot/?mode=async&function=get_block&block_id=list_videos_common_videos_list&sort_by=post_date&from=${(p - 1) * 24}&_=${Date.now()}`, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
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

  useEffect(() => { fetchData(page); LOBSTER_PLAYER_LOCK = false; }, [page]);

  const goNext = () => setPage(p => p + 1);
  const goPrev = () => setPage(p => Math.max(1, p - 1));

  return (
    <NavigationStack>
      <VStack
        background="systemBackground"
        frame={{ maxWidth: "infinity", maxHeight: "infinity" }}
        navigationTitle={`龍蝦影院 P.${page}`}
        navigationBarTitleDisplayMode="inline"
        toolbar={{
          topBarLeading: [
            <Button key="close_btn" systemImage="xmark" action={() => dismiss()} />
          ],
          topBarTrailing: [
            <HStack key="page_nav" spacing={15}>
              <Button systemImage="chevron.left" action={goPrev} disabled={page === 1} />
              <Button systemImage="chevron.right" action={goNext} />
            </HStack>
          ]
        }}
      >
        <GeometryReader>
          {(proxy) => {
            const columns = proxy.size.width > 600 ? 4 : 2;
            const itemWidth = (proxy.size.width - 12 * (columns + 1)) / columns;
            const chunks = [];
            for (let i = 0; i < list.length; i += columns) chunks.push(list.slice(i, i + columns));

            return (
              <ZStack
                frame={{ maxWidth: "infinity", maxHeight: "infinity" }}
                simultaneousGesture={DragGesture({ minDistance: 40 }).onEnded((event) => {
                    const dx = event.translation.width;
                    const dy = event.translation.height;
                    // 🖐️ 手勢判定標校：回到上一版經典 100 像素門檻
                    if (Math.abs(dx) > 100 && Math.abs(dx) > Math.abs(dy)) {
                        if (dx < 0) goNext();
                        else goPrev();
                    }
                })}
              >
                <ScrollView padding={12}>
                  {loading && list.length === 0 ? (
                    <VStack alignment="center" padding={60}><ProgressView /><Text marginTop={10}>龍蝦正在加載...</Text></VStack>
                  ) : (
                    <VStack spacing={18}>
                      {chunks.map((row, idx) => (
                        <HStack key={`r${page}_${idx}`} spacing={12} frame={{ maxWidth: "infinity" }} alignment="top">
                          {row.map((item) => (
                            <MoviePoster key={item.url} movie={item} itemWidth={itemWidth} loadingId={loadingId} setLoadingId={setLoadingId} />
                          ))}
                          {row.length < columns && Array.from({ length: columns - row.length }).map((_, i) => (
                            <Spacer key={`s${i}`} frame={{ width: itemWidth }} />
                          ))}
                        </HStack>
                      ))}
                      <Spacer frame={{ height: 120 }} />
                    </VStack>
                  )}
                </ScrollView>
              </ZStack>
            );
          }}
        </GeometryReader>
      </VStack>
    </NavigationStack>
  );
}
