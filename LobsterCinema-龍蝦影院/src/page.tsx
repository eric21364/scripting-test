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
  Circle
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

function CircleIconButton({ icon, action, size = 32, iconSize = 16, fill = "rgba(0,0,0,0.06)", foregroundStyle = "label" }: any) {
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
    let active = true;
    UIImage.fromURL(url).then(i => { if (i && active) setImg(i); }).catch(() => {});
    return () => { active = false; };
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
      <Text font={{size: 11, name: "system-bold"}} lineLimit={2} opacity={PLAY_LOCK && !isL ? 0.35 : 1}>{movie.title}</Text>
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
    <VStack spacing={0} background="systemBackground" frame={{ maxWidth: "infinity", maxHeight: "infinity" }}>
        
        {/* 🏔️ 物理 Header：移除頂部過大空白，提升緊湊度 */}
        <VStack spacing={0} background="systemBackground" zIndex={100}>
          <HStack padding={{ top: 8, leading: 16, trailing: 16, bottom: 8 }} alignment="center">
            <CircleIconButton icon="xmark" action={dismiss} />
            <Spacer />
            <VStack alignment="center">
              <Text font={{ size: 16, name: "system-bold" }}>龍蝦影院 v9</Text>
              <Text font={{ size: 9 }} foregroundStyle="secondaryLabel">當前第 {page} 頁</Text>
            </VStack>
            <Spacer />
            <HStack spacing={12}>
              <CircleIconButton icon="chevron.left" action={goPrev} disabled={page === 1} foregroundStyle={page === 1 ? "tertiaryLabel" : "label"} />
              <CircleIconButton icon="chevron.right" action={goNext} />
            </HStack>
          </HStack>
          <VStack frame={{ height: 0.5, maxWidth: "infinity" }} background="separator" />
        </VStack>

        <GeometryReader>
          {(proxy) => {
            const columns = proxy.size.width > 600 ? 4 : 2;
            const space = 12;
            const itemWidth = (proxy.size.width - space * (columns + 1)) / columns;
            const chunks = [];
            for (let i = 0; i < list.length; i += columns) chunks.push(list.slice(i, i + columns));

            return (
              <ZStack
                frame={{ maxWidth: "infinity", maxHeight: "infinity" }}
                simultaneousGesture={DragGesture({ minDistance: 50 }).onEnded(e => {
                  if (Math.abs(e.translation.width) > 100 && Math.abs(e.translation.width) > Math.abs(e.translation.height)) {
                    if (e.translation.width < 0) goNext();
                    else goPrev();
                  }
                })}
              >
                <ScrollView padding={space}>
                  {loading && list.length === 0 ? (
                    <VStack alignment="center" padding={60}><ProgressView /></VStack>
                  ) : (
                    <VStack spacing={18}>
                      {chunks.map((row, i) => (
                        <HStack key={`p${page}r${i}`} spacing={space} alignment="top">
                          {row.map(m => (
                            <MoviePoster key={m.url} movie={m} itemWidth={itemWidth} loadingUid={loadingUid} setloadingUid={setloadingUid} />
                          ))}
                          {row.length < columns && Array.from({ length: columns - row.length }).map((_, si) => (
                            <Spacer key={si} frame={{ width: itemWidth }} />
                          ))}
                        </HStack>
                      ))}
                      {/* 🏔️ 內容底部空白優化 */}
                      <Spacer frame={{ height: 40 }} />
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
