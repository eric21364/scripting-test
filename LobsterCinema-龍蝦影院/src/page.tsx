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
  Script,
} from "scripting";

interface Movie {
  title: string;
  url: string;
  thumbnail: string;
  duration: string;
  category: string;
}

const DATA_SOURCE = "https://raw.githubusercontent.com/eric21364/scripting-test/main/status.json";

/**
 * 專屬縮圖展示組件：遵循 UIImage.fromURL 異步加載規範
 */
function PosterImage({ url }: { url: string }) {
  const [uiImage, setUiImage] = useState<UIImage | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        // 核心修復：正確調用官方異步 Promise 方法
        const img = await UIImage.fromURL(url);
        if (active && img) setUiImage(img);
      } catch (err) {
        console.log("UIImage.fromURL 加載失敗:", url);
      }
    })();
    return () => { active = false; };
  }, [url]);

  if (!uiImage) {
    return (
      <VStack frame={{ maxWidth: "infinity", height: 130 }} alignment="center" background="rgba(255,255,255,0.05)">
        <ProgressView />
      </VStack>
    );
  }

  return (
    <Image
      image={uiImage}
      resizable
      scaleToFill
      frame={{ maxWidth: "infinity", height: 130 }}
    />
  );
}

/**
 * 影片卡片：點擊即調用 WebViewController
 */
function MovieCard({ movie }: { movie: Movie }) {
  const handlePlay = async () => {
    // 依據用戶提供的 2.4.5 官方用法：使用 WebViewController 進行內置播放
    const webView = new WebViewController();
    
    // JS 注入優化體驗
    webView.shouldAllowRequest = async (req) => {
        return !req.url.includes("google-analytics") && !req.url.includes("ads");
    };

    const loaded = await webView.loadURL(movie.url);
    if (loaded) {
        await webView.present({
            fullscreen: true,
            navigationTitle: movie.title
        });
    }
  };

  return (
    <VStack
      frame={{ maxWidth: "infinity" }}
      spacing={8}
      onTapGesture={handlePlay}
    >
      <ZStack frame={{ maxWidth: "infinity", height: 130 }} cornerRadius={12} background="#111" clipShape="rect">
        <PosterImage url={movie.thumbnail} />
        
        {/* 懸浮時長資訊 */}
        <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} alignment="bottomTrailing" padding={6}>
          <Text 
              font={{ size: 10, name: "system-bold" }} 
              padding={{ horizontal: 5, vertical: 3 }}
              cornerRadius={5}
              background="rgba(0,0,0,0.8)" 
              foregroundStyle="white"
          >
            {movie.duration}
          </Text>
        </VStack>
        
        <Image systemName="play.fill" font={24} foregroundStyle="rgba(255,255,255,0.5)" />
      </ZStack>
      
      <VStack alignment="leading" spacing={2} frame={{ maxWidth: "infinity" }}>
        <Text font={{ size: 13, name: "system-bold" }} lineLimit={2} foregroundStyle="white">
          {movie.title}
        </Text>
        <Text font="caption2" foregroundStyle="orange" bold>
          #{movie.category}
        </Text>
      </VStack>
    </VStack>
  );
}

/**
 * 主介面
 */
export function View() {
  const dismiss = Navigation.useDismiss();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshMovies = async () => {
    setLoading(true);
    try {
      const resp = await fetch(DATA_SOURCE + "?t=" + Date.now());
      const json = await resp.json();
      if (json.kanav_list) {
        setMovies(json.kanav_list);
      }
    } catch (e) {
      console.log("Data sync failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshMovies();
  }, []);

  // 計算雙欄行列
  const listRows = [];
  for (let i = 0; i < movies.length; i += 2) {
    listRows.push(movies.slice(i, i + 2));
  }

  return (
    <NavigationStack>
      <VStack
        navigationTitle="龍蝦影院 v6.0"
        background="#000"
        toolbar={{
          // 修復按鈕：對齊官方範本語法
          cancellationAction: (
            <Button title="離開" systemImage="xmark" action={dismiss} />
          ),
          topBarTrailing: [
            <Button title="整理" systemImage="arrow.clockwise" action={refreshMovies} />
          ],
        }}
      >
        <ScrollView padding={12}>
          {loading && movies.length === 0 ? (
            <VStack alignment="center" padding={60}>
              <ProgressView />
              <Text marginTop={12} foregroundStyle="secondaryLabel">龍蝦正全力載入海報牆...</Text>
            </VStack>
          ) : (
            <VStack spacing={20}>
              {listRows.map((row, idx) => (
                <HStack key={idx} spacing={12} frame={{ maxWidth: "infinity" }}>
                  {row.map((item, cidx) => (
                    <MovieCard key={cidx} movie={item} />
                  ))}
                  {row.length === 1 && <Spacer frame={{ maxWidth: "infinity" }} />}
                </HStack>
              ))}
              <Spacer frame={{ height: 80 }} />
            </VStack>
          )}
        </ScrollView>
      </VStack>
    </NavigationStack>
  );
}
