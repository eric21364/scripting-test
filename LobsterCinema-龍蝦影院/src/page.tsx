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
  Circle,
  NavigationStack
} from "scripting";

interface Movie {
  title: string;
  url: string;
  thumbnail: string;
  duration: string;
  category: string;
}

// 🛡️ 播放鎖定單例
let PLAY_LOCK = false;

function CircleIconButton({ icon, action, size = 34, iconSize = 18, fill = "rgba(0,0,0,0.3)", foregroundStyle = "white" }: any) {
  return (
    <Button action={action} buttonStyle="plain">
      <ZStack frame={{ width: size, height: size }}>
        <Circle fill={fill} />
        <Image systemName={icon} font={iconSize} foregroundStyle={foregroundStyle} />
      </ZStack>
    </Button>
  )
}

function Thumbnail({ url }: { url: string }) {
  const [img, setImg] = useState<UIImage | null>(null);
  useEffect(() => {
    UIImage.fromURL(url).then(i => { if (i) setImg(i); }).catch(() => {});
  }, [url]);
  if (!img) return <ProgressView progressViewStyle="circular" />;
  return <Image image={img} resizable scaleToFill frame={{ maxWidth: "infinity", height: "infinity" }} />;
}

function MoviePoster({ movie, itemWidth, loadingUid, setloadingUid }: any) {
  const isL = loadingUid === movie.url;
  const tap = async () => {
    if (PLAY_LOCK) return;
    PLAY_LOCK = true;
    setloadingUid(movie.url);
    const t = setTimeout(() => { PLAY_LOCK = false; setloadingUid(null); }, 15000);
    try {
      const resp = await fetch(movie.url);
      const html = await resp.text();
      const match = html.match(/hlsUrl\s*=\s*['"]([^'"]+\.m3u8)['"]/);
      const ctrl = new WebViewController();
      await ctrl.loadURL(match && match[1] ? match[1] : movie.url);
      await ctrl.present({ fullscreen: true, navigationTitle: movie.title });
    } catch (e) {} finally { clearTimeout(t); PLAY_LOCK = false; setloadingUid(null); }
  };

  return (
    <VStack frame={{ width: itemWidth }} spacing={6} onTapGesture={tap}>
      <ZStack frame={{ width: itemWidth, height: itemWidth * 0.56 }} cornerRadius={10} background="secondarySystemBackground" clipShape="rect">
        <Thumbnail url={movie.thumbnail} />
        {isL && <ProgressView />}
        <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} alignment="bottomTrailing" padding={4}>
           <Text font={{size: 9, name: "system-bold"}} background="rgba(0,0,0,0.6)" padding={2} cornerRadius={4} foregroundStyle="white">{movie.duration}</Text>
        </VStack>
      </ZStack>
      <Text font={{size: 12, name: "system-bold"}} lineLimit={2} opacity={PLAY_LOCK && !isL ? 0.4 : 1}>{movie.title}</Text>
    </VStack>
  );
}

export function View() {
  const dismiss = Navigation.useDismiss();
  const [list, setList] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingUid, setloadingUid] = useState<string | null>(null);

  const fetcher = async (p: number) => {
    setLoading(true);
    setList([]);
    try {
      const r = await fetch(`https://jable.tv/hot/?mode=async&function=get_block&block_id=list_videos_common_videos_list&sort_by=post_date&from=${(p - 1) * 24}&_=${Date.now()}`);
      const h = await r.text();
      const reg = /<div class="video-img-box[^>]*>[\s\S]*?<a href="([^"]+)"[^>]*>[\s\S]*?<img[^>]*?data-src="([^"]+)"[^>]*?>[\s\S]*?<span class="label">([^<]+)<\/span>[\s\S]*?<(?:div|h6) class="title">[\s\S]*?<a[^>]*>([^<]+)<\/a>/g;
      const res: Movie[] = [];
      let m;
      while ((m = reg.exec(h)) !== null) res.push({ url: m[1], thumbnail: m[2], duration: m[3], title: m[4], category: "" });
      setList(res);
    } catch (e) {} finally { setLoading(false); }
  };

  useEffect(() => { fetcher(page); PLAY_LOCK = false; }, [page]);

  const goNext = () => setPage(p => p + 1);
  const goPrev = () => setPage(p => Math.max(1, p - 1));

  return (
    <NavigationStack>
      <ZStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} background="systemBackground">
        
        {/* 🏔️ 內容區域 */}
        <VStack spacing={0} frame={{ maxWidth: "infinity", maxHeight: "infinity" }}>
          
          {/* 🏔️ 範本級別 Header (固定於頂部) */}
          <VStack spacing={0} background="systemBackground" zIndex={100}>
            <HStack padding={{ top: 56, leading: 16, trailing: 16, bottom: 12 }} alignment="center">
              <CircleIconButton icon="xmark" action={dismiss} fill="rgba(0,0,0,0.08)" foregroundStyle="label" />
              <Spacer />
              <VStack alignment="center">
                <Text font={{ size: 17, name: "system-bold" }}>龍蝦影院 v9</Text>
                <Text font={{ size: 10 }} foregroundStyle="secondaryLabel">Page {page}</Text>
              </VStack>
              <Spacer />
              <HStack spacing={12}>
                <CircleIconButton icon="chevron.left" action={goPrev} disabled={page === 1} fill="rgba(0,0,0,0.05)" foregroundStyle={page === 1 ? "tertiaryLabel" : "label"} />
                <CircleIconButton icon="chevron.right" action={goNext} fill="rgba(0,0,0,0.05)" foregroundStyle="label" />
              </HStack>
            </HStack>
            <VStack frame={{ height: 0.5, maxWidth: "infinity" }} background="separator" />
          </VStack>

          <GeometryReader>
            {(proxy) => {
              const columns = proxy.size.width > 600 ? 4 : 2;
              const itemWidth = (proxy.size.width - 12 * (columns + 1)) / columns;
              const chunks = [];
              for (let i = 0; i < list.length; i += columns) chunks.push(list.slice(i, i + columns));

              return (
                <ZStack
                  frame={{ maxWidth: "infinity", maxHeight: "infinity" }}
                  simultaneousGesture={DragGesture({ minDistance: 50 }).onEnded(e => {
                    const dx = e.translation.width;
                    const dy = e.translation.height;
                    // 🖐️ 手勢判定校準：橫移門檻 100 像素
                    if (Math.abs(dx) > 100 && Math.abs(dx) > Math.abs(dy)) {
                      if (dx < 0) goNext();
                      else goPrev();
                    }
                  })}
                >
                  <ScrollView padding={12}>
                    {loading && list.length === 0 ? (
                      <VStack alignment="center" padding={60}><ProgressView /><Text marginTop={10} font={12} foregroundStyle="secondaryLabel">龍蝦深潛中...</Text></VStack>
                    ) : (
                      <VStack spacing={18}>
                        {chunks.map((row, i) => (
                          <HStack key={`p${page}r${i}`} spacing={12} alignment="top">
                            {row.map(m => (
                              <MoviePoster key={m.url} movie={m} itemWidth={itemWidth} loadingUid={loadingUid} setloadingUid={setloadingUid} />
                            ))}
                            {row.length < columns && Array.from({ length: columns - row.length }).map((_, si) => (
                              <Spacer key={si} frame={{ width: itemWidth }} />
                            ))}
                          </HStack>
                        ))}
                        <Spacer frame={{ height: 150 }} />
                      </VStack>
                    )}
                  </ScrollView>
                </ZStack>
              );
            }}
          </GeometryReader>
        </VStack>
      </ZStack>
    </NavigationStack>
  );
}
