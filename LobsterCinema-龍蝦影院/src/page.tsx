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

// 🛡️ 播放鎖定
let GLOBAL_PLAYER_LOCK = false;

function Movies({ movie, itemWidth, currentId, setcurrentId }: any) {
  const isL = currentId === movie.url;
  const tap = async () => {
    if (GLOBAL_PLAYER_LOCK) return;
    GLOBAL_PLAYER_LOCK = true;
    setcurrentId(movie.url);
    const t = setTimeout(() => { GLOBAL_PLAYER_LOCK = false; setcurrentId(null); }, 15000);
    try {
      const resp = await fetch(movie.url);
      const html = await resp.text();
      const match = html.match(/hlsUrl\s*=\s*['"]([^'"]+\.m3u8)['"]/);
      const ctrl = new WebViewController();
      await ctrl.loadURL(match && match[1] ? match[1] : movie.url);
      await ctrl.present({ fullscreen: true });
    } catch (e) {} finally { clearTimeout(t); GLOBAL_PLAYER_LOCK = false; setcurrentId(null); }
  };

  return (
    <VStack frame={{ width: itemWidth }} spacing={6} onTapGesture={tap}>
      <ZStack frame={{ width: itemWidth, height: itemWidth * 0.56 }} cornerRadius={8} background="secondarySystemBackground" clipShape="rect">
        <Thumbnail url={movie.thumbnail} />
        {isL && <ProgressView />}
      </ZStack>
      <Text font={12} lineLimit={2}>{movie.title}</Text>
    </VStack>
  );
}

function Thumbnail({ url }: { url: string }) {
  const [img, setImg] = useState<UIImage | null>(null);
  useEffect(() => {
    UIImage.fromURL(url).then(i => { if (i) setImg(i); }).catch(() => {});
  }, [url]);
  if (!img) return <ProgressView progressViewStyle="circular" />;
  return <Image image={img} resizable scaleToFill frame={{ maxWidth: "infinity", height: "infinity" }} />;
}

export function View() {
  const dismiss = Navigation.useDismiss();
  const [list, setList] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [currentId, setcurrentId] = useState<string | null>(null);

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

  useEffect(() => { fetcher(page); }, [page]);

  return (
    <VStack spacing={0} background="systemBackground" frame={{ maxWidth: "infinity", maxHeight: "infinity" }}>
        {/* 🏔️ Debug Header: 強制顯色、大量 Padding、文字按鈕 */}
        <HStack padding={{ top: 70, leading: 20, trailing: 20, bottom: 15 }} background="systemBackground" alignment="center">
            <Button action={() => dismiss()}>
                <HStack padding={8} background="systemRed" cornerRadius={8}>
                    <Text foregroundStyle="white" font={{size: 16, name: "system-bold"}}>關閉 (X)</Text>
                </HStack>
            </Button>
            <Spacer />
            <Text font={18}>龍蝦影院 P.{page}</Text>
            <Spacer />
            <HStack spacing={15}>
                <Button action={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                    <Text font={24}>⬅️</Text>
                </Button>
                <Button action={() => setPage(p => p + 1)}>
                    <Text font={24}>➡️</Text>
                </Button>
            </HStack>
        </HStack>
        <VStack frame={{ height: 1, maxWidth: "infinity" }} background="separator" />

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
                  if (Math.abs(e.translation.width) > 100) {
                    if (e.translation.width < 0) setPage(p => p + 1);
                    else setPage(p => Math.max(1, p - 1));
                  }
                })}
              >
                <ScrollView padding={12}>
                  {loading && list.length === 0 ? <ProgressView /> : (
                    <VStack spacing={18}>
                      {chunks.map((row, i) => (
                        <HStack key={i} spacing={12} alignment="top">
                          {row.map(m => <Movies key={m.url} movie={m} itemWidth={itemWidth} currentId={currentId} setcurrentId={setcurrentId} />)}
                        </HStack>
                      ))}
                      <Spacer frame={{ height: 100 }} />
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
