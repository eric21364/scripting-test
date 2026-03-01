import {
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

let LOBSTER_READY_LOCK = false;

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

function MoviePoster({ movie, itemWidth, currentLoadingId, setcurrentLoadingId }: any) {
  const isOpening = currentLoadingId === movie.url;
  const openPlayer = async () => {
    if (LOBSTER_READY_LOCK) return;
    LOBSTER_READY_LOCK = true;
    setcurrentLoadingId(movie.url);
    const safeRelease = setTimeout(() => { LOBSTER_READY_LOCK = false; setcurrentLoadingId(null); }, 15000);
    try {
      const resp = await fetch(movie.url, { headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1' } });
      const html = await resp.text();
      const match = html.match(/hlsUrl\s*=\s*['"]([^'"]+\.m3u8)['"]/);
      if (match && match[1]) {
        const player = new WebViewController();
        await player.loadURL(match[1]);
        await player.present({ fullscreen: true, navigationTitle: movie.title });
      } else {
        const webView = new WebViewController();
        await webView.loadURL(movie.url);
        await webView.present({ fullscreen: true, navigationTitle: movie.title });
      }
    } catch (e) {} finally { clearTimeout(safeRelease); LOBSTER_READY_LOCK = false; setcurrentLoadingId(null); }
  };
  return (
    <VStack frame={{ width: itemWidth }} spacing={6} onTapGesture={openPlayer}>
      <ZStack frame={{ width: itemWidth, height: itemWidth * 0.5625 }} cornerRadius={10} background="secondarySystemBackground" clipShape="rect">
        <Thumbnail url={movie.thumbnail} />
        {isOpening && <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} alignment="center" background="rgba(0,0,0,0.5)"><ProgressView /></VStack>}
        <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} alignment="bottomTrailing" padding={6}>
          <Text font={{ size: 10, name: "system-bold" }} padding={3} background="rgba(0,0,0,0.8)" cornerRadius={4} foregroundStyle="white">{movie.duration}</Text>
        </VStack>
      </ZStack>
      <Text font={{ size: 12, name: "system-bold" }} lineLimit={2}>{movie.title}</Text>
    </VStack>
  );
}

export function View() {
  const dismiss = Navigation.useDismiss();
  const [list, setList] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [currentLoadingId, setcurrentLoadingId] = useState<string | null>(null);

  const fetchData = async (p: number) => {
    setLoading(true);
    setList([]);
    try {
      const resp = await fetch(`https://jable.tv/hot/?mode=async&function=get_block&block_id=list_videos_common_videos_list&sort_by=post_date&from=${(p - 1) * 24}&_=${Date.now()}`, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
      const html = await resp.text();
      const cardRegex = /<div class="video-img-box[^>]*>[\s\S]*?<a href="([^"]+)"[^>]*>[\s\S]*?<img[^>]*?data-src="([^"]+)"[^>]*?>[\s\S]*?<span class="label">([^<]+)<\/span>[\s\S]*?<(?:div|h6) class="title">[\s\S]*?<a[^>]*>([^<]+)<\/a>/g;
      const res: Movie[] = [];
      let m;
      while ((m = cardRegex.exec(html)) !== null) if (m[2] && !m[2].includes('placeholder')) res.push({ url: m[1], thumbnail: m[2], duration: m[3], title: m[4], category: "LIVE" });
      setList(res);
    } catch (e) {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(page); LOBSTER_READY_LOCK = false; }, [page]);

  return (
    <VStack background="systemBackground" frame={{ maxWidth: "infinity", maxHeight: "infinity" }} spacing={0}>
        
        {/* 🏔️ 物理極致 Header (手寫導航列) - 改用 Button(systemImage) 原生樣式 */}
        <HStack padding={{ leading: 16, trailing: 16, top: 64, bottom: 8 }} alignment="center" background="systemBackground">
            <Button systemImage="xmark.circle.fill" font={28} foregroundStyle="secondaryLabel" action={() => dismiss()} />
            <Spacer />
            <VStack alignment="center">
                <Text font={{ size: 17, name: "system-bold" }}>龍蝦影院 P.{page}</Text>
            </VStack>
            <Spacer />
            <HStack spacing={12}>
                <Button systemImage="chevron.left.circle" font={24} action={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} />
                <Button systemImage="chevron.right.circle" font={24} action={() => setPage(p => p + 1)} />
            </HStack>
        </HStack>
        <VStack frame={{ height: 1, maxWidth: "infinity" }} background="separator" />

        <GeometryReader>
          {(proxy) => {
            const columns = proxy.size.width > 600 ? 4 : 2;
            const itemWidth = (proxy.size.width - 12 * (columns + 1)) / columns;
            const groups = [];
            for (let i = 0; i < list.length; i += columns) groups.push(list.slice(i, i + columns));

            return (
              <ZStack
                frame={{ maxWidth: "infinity", maxHeight: "infinity" }}
                simultaneousGesture={DragGesture({ minDistance: 50 }).onEnded((event) => {
                    if (Math.abs(event.translation.width) > 100 && Math.abs(event.translation.width) > Math.abs(event.translation.height)) {
                        if (event.translation.width < 0) setPage(p => p + 1);
                        else setPage(p => Math.max(1, p - 1));
                    }
                })}
              >
                <ScrollView padding={12}>
                  {loading && list.length === 0 ? (
                    <VStack alignment="center" padding={60}><ProgressView /></VStack>
                  ) : (
                    <VStack spacing={18}>
                      {groups.map((row, idx) => (
                        <HStack key={`p${page}r${idx}`} spacing={12} frame={{ maxWidth: "infinity" }} alignment="top">
                          {row.map((item) => (
                            <MoviePoster key={item.url} movie={item} itemWidth={itemWidth} currentLoadingId={currentLoadingId} setcurrentLoadingId={setcurrentLoadingId} />
                          ))}
                          {row.length < columns && Array.from({ length: columns - row.length }).map((_, i) => (
                            <Spacer key={`p${page}s${i}`} frame={{ width: itemWidth }} />
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
  );
}
