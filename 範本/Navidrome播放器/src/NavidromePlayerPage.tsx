import {
  Button,
  Circle,
  HStack,
  Image,
  List,
  Navigation,
  NavigationStack,
  RoundedRectangle,
  ScrollView,
  Section,
  Spacer,
  Text,
  VStack,
  ZStack,
  DragGesture,
  fetch,
  useEffect,
  useMemo,
  useRef,
  useState
} from "scripting"

import {
  ALL_SONGS_ALBUM_BATCH_SIZE,
  ALL_SONGS_ALBUM_PAGE_SIZE,
  MAX_COVER_CACHE_ENTRIES,
  allSongsCacheScope,
  buildAlbumFingerprint,
  buildLyricsRequestUrl,
  buildSubsonicUrl,
  isConfigReady,
  loadConfig,
  loadPlaybackSnapshot,
  loadLikedSongsSnapshot,
  normalizeAlbums,
  normalizePlaylists,
  normalizeSongs,
  parseLyricsResponseText,
  parseTimedLyrics,
  readAllSongsCache,
  isRecord,
  requestSubsonic,
  sanitizeConfig,
  saveConfig,
  saveLikedSongsSnapshot,
  savePlaybackSnapshot,
  stripLyricTimeTags,
  writeAllSongsCache,
  type AllSongsAlbumCacheEntry,
  type ConnectionFeedback,
  type ConnectionState,
  type NavidromeAlbum,
  type NavidromeConfig,
  type NavidromePlaylist,
  type NavidromeSong,
  type PlaybackState,
  type TimedLyricLine
} from "./core"

import {
  AllSongsCatalogPage,
  ArtistCatalogPage,
  ArtistSongsPage,
  LikedSongsCatalogPage,
  NavidromeSettingsPage,
  PlaylistSongsPage,
  PlaylistsCatalogPage
} from "./pages"

import {
  CircleIconButton,
  LibraryTabContent,
  LyricsTabContent,
  NowPlayingBar,
  PlayerTabContent
} from "./player_views"

function QueueSheetPage({
  queueLabel,
  songs,
  currentIndex,
  onSelectSong,
  onClearPlayed,
  onClearUpcoming
}: {
  queueLabel: string
  songs: NavidromeSong[]
  currentIndex: number
  onSelectSong: (index: number) => void
  onClearPlayed: () => void
  onClearUpcoming: () => void
}) {
  const dismiss = Navigation.useDismiss()

  const renderRow = (song: NavidromeSong, index: number, isCurrent = false) => (
    <Button
      key={`queue-song-${song.id}-${index}`}
      action={() => {
        onSelectSong(index)
        dismiss()
      }}
      buttonStyle="plain"
      frame={{ maxWidth: "infinity", alignment: "leading" }}
    >
      <HStack alignment="center" spacing={8} frame={{ maxWidth: "infinity", alignment: "leading" }}>
        <VStack alignment="leading" spacing={2} frame={{ maxWidth: "infinity", alignment: "leading" }}>
          <Text lineLimit={1} foregroundStyle={isCurrent ? "systemGreen" : "label"}>
            {song.title}
          </Text>
          <Text lineLimit={1} font="caption" foregroundStyle="secondaryLabel">
            {song.artist} · {song.album}
          </Text>
        </VStack>
        {isCurrent ? <Image systemName="speaker.wave.2.fill" font={14} foregroundStyle="systemGreen" /> : null}
      </HStack>
    </Button>
  )

  const hasCurrent = currentIndex >= 0 && currentIndex < songs.length
  const currentSong = hasCurrent ? songs[currentIndex] : null
  const upcoming = hasCurrent ? songs.slice(currentIndex + 1) : songs
  const played = hasCurrent ? songs.slice(0, currentIndex) : []

  return (
    <List navigationTitle="当前播放列表" navigationBarTitleDisplayMode="inline">
      {songs.length > 0 ? (
        <Section>
          <HStack spacing={8} frame={{ maxWidth: "infinity" }}>
            <Button
              title="清空已播放"
              action={onClearPlayed}
              buttonStyle="bordered"
              disabled={!hasCurrent || played.length === 0}
              frame={{ maxWidth: "infinity" }}
            />
            <Button
              title="清空待播放"
              action={onClearUpcoming}
              buttonStyle="bordered"
              disabled={!hasCurrent || upcoming.length === 0}
              frame={{ maxWidth: "infinity" }}
            />
          </HStack>
        </Section>
      ) : null}

      <Section title={`${queueLabel}（${songs.length}首）`}>
        {songs.length === 0 ? <Text foregroundStyle="secondaryLabel">暂无播放列表</Text> : null}
      </Section>

      {currentSong ? <Section title="正在播放">{renderRow(currentSong, currentIndex, true)}</Section> : null}

      {upcoming.length > 0 ? (
        <Section title={currentSong ? "即将播放" : "队列内容"}>
          {upcoming.map((song, offset) => {
            const index = currentSong ? currentIndex + 1 + offset : offset
            return renderRow(song, index)
          })}
        </Section>
      ) : null}

      {played.length > 0 ? (
        <Section title="已播放">
          {played.map((song, index) => renderRow(song, index))}
        </Section>
      ) : null}
    </List>
  )
}

function SongSearchPage({
  keyword,
  songs,
  onPlaySong,
  onQueueSingleSong
}: {
  keyword: string
  songs: NavidromeSong[]
  onPlaySong: (songs: NavidromeSong[], startIndex: number) => void
  onQueueSingleSong: (song: NavidromeSong, mode: "next" | "tail") => void
}) {
  const dismiss = Navigation.useDismiss()

  return (
    <List navigationTitle="搜索结果" navigationBarTitleDisplayMode="inline">
      <Section title={`关键词：${keyword}`}>
        <Text foregroundStyle="secondaryLabel">匹配歌曲 {songs.length} 首</Text>
      </Section>
      <Section title={`结果（${songs.length}）`}>
        {songs.length === 0 ? (
          <Text foregroundStyle="secondaryLabel">没有匹配歌曲</Text>
        ) : (
          songs.map((song, index) => (
            <HStack
              key={`search-song-${song.id}-${index}`}
              alignment="center"
              spacing={8}
              frame={{ maxWidth: "infinity", alignment: "leading" }}
              contentShape="rect"
              onTapGesture={() => {
                onPlaySong(songs, index)
                dismiss()
              }}
            >
              <VStack alignment="leading" spacing={2} frame={{ maxWidth: "infinity", alignment: "leading" }}>
                <Text lineLimit={1} foregroundStyle="label">{song.title}</Text>
                <Text lineLimit={1} font="caption" foregroundStyle="secondaryLabel">
                  {song.artist} - {song.album}
                </Text>
              </VStack>
              <Button
                title=""
                systemImage="ellipsis"
                action={() => {
                  void (async () => {
                    const selected = await Dialog.actionSheet({
                      title: song.title,
                      message: `${song.artist} - ${song.album}`,
                      actions: [
                        { label: "立即播放" },
                        { label: "下一首播放" },
                        { label: "加入队列末尾" }
                      ]
                    })
                    if (selected === 0) {
                      onPlaySong(songs, index)
                      dismiss()
                    } else if (selected === 1) {
                      onQueueSingleSong(song, "next")
                    } else if (selected === 2) {
                      onQueueSingleSong(song, "tail")
                    }
                  })()
                }}
                buttonStyle="plain"
              />
            </HStack>
          ))
        )}
      </Section>
    </List>
  )
}

function ModuleSongsListPage({
  title,
  songs,
  onPlaySong
}: {
  title: string
  songs: NavidromeSong[]
  onPlaySong: (index: number) => void
}) {
  const dismiss = Navigation.useDismiss()

  return (
    <List navigationTitle={title} navigationBarTitleDisplayMode="inline">
      <Section title={`共 ${songs.length} 首`}>
        {songs.length === 0 ? <Text foregroundStyle="secondaryLabel">暂无歌曲</Text> : null}
      </Section>

      {songs.length > 0 ? (
        <Section title="歌曲列表">
          {songs.map((song, index) => (
            <HStack
              key={`module-song-${title}-${song.id}-${index}`}
              alignment="center"
              spacing={8}
              frame={{ maxWidth: "infinity", alignment: "leading" }}
              contentShape="rect"
              onTapGesture={() => {
                onPlaySong(index)
                dismiss()
              }}
            >
              <VStack alignment="leading" spacing={2} frame={{ maxWidth: "infinity", alignment: "leading" }}>
                <Text lineLimit={1}>{song.title}</Text>
                <Text lineLimit={1} font="caption" foregroundStyle="secondaryLabel">
                  {song.artist} - {song.album}
                </Text>
              </VStack>
              <Button
                title=""
                systemImage="play.fill"
                action={() => {
                  onPlaySong(index)
                  dismiss()
                }}
                buttonStyle="plain"
                foregroundStyle="systemBlue"
              />
            </HStack>
          ))}
        </Section>
      ) : null}
    </List>
  )
}

function PresentedPageWithNowPlayingBar({
  children,
  currentCoverImage,
  currentSong,
  playbackHint,
  isPlaying,
  onTogglePlayPause,
  onBackToPlayer
}: {
  children: any
  currentCoverImage: UIImage | null
  currentSong: NavidromeSong | null
  playbackHint: string
  isPlaying: boolean
  onTogglePlayPause: () => void
  onBackToPlayer: () => void
}) {
  const dismiss = Navigation.useDismiss()

  return (
    <ZStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }}>
      <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} padding={{ bottom: 90 }}>
        {children}
      </VStack>
      <NowPlayingBar
        isLibraryTab={false}
        currentCoverImage={currentCoverImage}
        currentSong={currentSong}
        playbackHint={playbackHint}
        isPlaying={isPlaying}
        onTogglePlayPause={onTogglePlayPause}
        onOpenPlayerTab={() => {
          dismiss()
          onBackToPlayer()
        }}
      />
    </ZStack>
  )
}

function NavidromePlayerPage() {
  type AudioCacheEntry = {
    songId: string
    path: string
    sizeBytes: number
    lastPlayedAt: number
  }

  const dismiss = Navigation.useDismiss()
  const player = useMemo(() => new AVPlayer(), [])

  const [config, setConfig] = useState<NavidromeConfig>(() => loadConfig())
  const [songs, setSongs] = useState<NavidromeSong[]>([])
  const [allSongsLibrary, setAllSongsLibrary] = useState<NavidromeSong[]>([])
  const [playlists, setPlaylists] = useState<NavidromePlaylist[]>([])
  const [queueLabel, setQueueLabel] = useState("当前队列")
  const [songSearchQuery, setSongSearchQuery] = useState("")
  const [latestSongsQueue, setLatestSongsQueue] = useState<NavidromeSong[]>([])
  const [recentSongsQueue, setRecentSongsQueue] = useState<NavidromeSong[]>([])
  const [uiTab, setUiTab] = useState<"player" | "library" | "lyrics">("player")

  const [currentIndex, setCurrentIndex] = useState(-1)
  const [playbackMode, setPlaybackMode] = useState<"sequence" | "repeat_one" | "shuffle">("sequence")
  const [playbackState, setPlaybackState] = useState<PlaybackState>("idle")
  const [positionSec, setPositionSec] = useState(0)
  const [durationSec, setDurationSec] = useState(0)
  const [isSeeking, setIsSeeking] = useState(false)
  const [discRotationDeg, setDiscRotationDeg] = useState(0)
  const [currentCoverImage, setCurrentCoverImage] = useState<UIImage | null>(null)

  const [connectionState, setConnectionState] = useState<ConnectionState>("idle")
  const [connectionMessage, setConnectionMessage] = useState("尚未测试连接")
  const [loadingSongs, setLoadingSongs] = useState(false)
  const [loadingPlaylists, setLoadingPlaylists] = useState(false)

  const [lyricsText, setLyricsText] = useState("")
  const [lyricsLoading, setLyricsLoading] = useState(false)
  const [lyricsMessage, setLyricsMessage] = useState("未配置歌词 API 地址")

  const [likedSongIds, setLikedSongIds] = useState<Set<string>>(() => new Set())
  const [likedSongsCatalog, setLikedSongsCatalog] = useState<NavidromeSong[]>([])
  const [favoritePendingSongId, setFavoritePendingSongId] = useState<string | null>(null)

  const configRef = useRef(config)
  const songsRef = useRef(songs)
  const currentIndexRef = useRef(currentIndex)
  const playbackModeRef = useRef<"sequence" | "repeat_one" | "shuffle">("sequence")
  const lyricsRequestIdRef = useRef(0)
  const coverCacheRef = useRef<Map<string, UIImage | null>>(new Map())
  const seekPositionRef = useRef(0)
  const lastManualSeekAtRef = useRef(0)
  const lastSnapshotSavedAtRef = useRef(0)
  const audioCacheEntriesRef = useRef<Map<string, AudioCacheEntry>>(new Map())
  const audioCacheInFlightRef = useRef<Set<string>>(new Set())
  const audioCacheLoadedScopeRef = useRef("")

  const recentSongsStorageKey = (targetConfig: NavidromeConfig): string => {
    return `navidrome_recent_songs_v1:${allSongsCacheScope(targetConfig)}`
  }

  const loadRecentSongs = (targetConfig: NavidromeConfig): NavidromeSong[] => {
    const key = recentSongsStorageKey(targetConfig)
    return (
      Storage.get<NavidromeSong[]>(key, { shared: true }) ??
      Storage.get<NavidromeSong[]>(key) ??
      []
    )
  }

  const saveRecentSongs = (targetConfig: NavidromeConfig, songsToSave: NavidromeSong[]): void => {
    const key = recentSongsStorageKey(targetConfig)
    Storage.set(key, songsToSave, { shared: true })
    Storage.set(key, songsToSave)
  }

  const audioCacheScopeKey = (targetConfig: NavidromeConfig): string => {
    return `navidrome_audio_cache_meta_v1:${allSongsCacheScope(targetConfig)}`
  }

  const ensureAudioCacheDirectory = async (): Promise<string> => {
    const dirPath = `${FileManager.documentsDirectory}/navidrome_audio_cache`
    try {
      await FileManager.createDirectory(dirPath, true)
    } catch {
      // Ignore create failures here, write path will fail later if unavailable.
    }
    return dirPath
  }

  const loadAudioCacheEntries = (targetConfig: NavidromeConfig): Map<string, AudioCacheEntry> => {
    const key = audioCacheScopeKey(targetConfig)
    const raw =
      Storage.get<AudioCacheEntry[]>(key, { shared: true }) ??
      Storage.get<AudioCacheEntry[]>(key) ??
      []

    const map = new Map<string, AudioCacheEntry>()
    for (const item of raw) {
      if (!item || !item.songId || !item.path) continue
      map.set(item.songId, {
        songId: item.songId,
        path: item.path,
        sizeBytes: Number(item.sizeBytes) > 0 ? Number(item.sizeBytes) : 0,
        lastPlayedAt: Number(item.lastPlayedAt) > 0 ? Number(item.lastPlayedAt) : 0
      })
    }
    return map
  }

  const saveAudioCacheEntries = (targetConfig: NavidromeConfig, entries: Map<string, AudioCacheEntry>): void => {
    const key = audioCacheScopeKey(targetConfig)
    const payload = Array.from(entries.values())
    Storage.set(key, payload)
    Storage.set(key, payload, { shared: true })
  }

  const ensureAudioCacheLoaded = (targetConfig: NavidromeConfig): void => {
    const scope = allSongsCacheScope(targetConfig)
    if (audioCacheLoadedScopeRef.current === scope) return
    audioCacheEntriesRef.current = loadAudioCacheEntries(targetConfig)
    audioCacheLoadedScopeRef.current = scope
  }

  const pruneAudioCacheIfNeeded = async (targetConfig: NavidromeConfig): Promise<void> => {
    ensureAudioCacheLoaded(targetConfig)
    const entries = audioCacheEntriesRef.current
    const maxBytes = Math.max(128, targetConfig.cacheLimitMB) * 1024 * 1024
    let totalBytes = 0
    for (const entry of entries.values()) {
      totalBytes += entry.sizeBytes
    }
    if (totalBytes <= maxBytes) return

    const sorted = Array.from(entries.values()).sort((a, b) => a.lastPlayedAt - b.lastPlayedAt)
    for (const entry of sorted) {
      if (totalBytes <= maxBytes) break
      try {
        await FileManager.remove(entry.path)
      } catch {
        // Ignore removal failure and keep trying others.
      }
      entries.delete(entry.songId)
      totalBytes -= entry.sizeBytes
    }
    saveAudioCacheEntries(targetConfig, entries)
  }

  const markCachedSongPlayed = (targetConfig: NavidromeConfig, songId: string): void => {
    ensureAudioCacheLoaded(targetConfig)
    const entry = audioCacheEntriesRef.current.get(songId)
    if (!entry) return
    entry.lastPlayedAt = Date.now()
    audioCacheEntriesRef.current.set(songId, entry)
    saveAudioCacheEntries(targetConfig, audioCacheEntriesRef.current)
  }

  const resolveCachedSongPath = (targetConfig: NavidromeConfig, songId: string): string | null => {
    ensureAudioCacheLoaded(targetConfig)
    const entry = audioCacheEntriesRef.current.get(songId)
    if (!entry) return null
    try {
      FileManager.statSync(entry.path)
      return entry.path
    } catch {
      audioCacheEntriesRef.current.delete(songId)
      saveAudioCacheEntries(targetConfig, audioCacheEntriesRef.current)
      return null
    }
  }

  const cacheSongInBackground = async (targetConfig: NavidromeConfig, song: NavidromeSong): Promise<void> => {
    if (!targetConfig.cacheWhilePlaying) return
    ensureAudioCacheLoaded(targetConfig)
    if (audioCacheEntriesRef.current.has(song.id)) return
    if (audioCacheInFlightRef.current.has(song.id)) return

    audioCacheInFlightRef.current.add(song.id)
    try {
      const dirPath = await ensureAudioCacheDirectory()
      const filePath = `${dirPath}/${allSongsCacheScope(targetConfig)}_${song.id}.mp3`
      const response = await fetch(buildSubsonicUrl(targetConfig, "stream", { id: song.id }), {
        timeout: 120,
        allowInsecureRequest: true,
        debugLabel: "NavidromeAudioCache"
      })
      if (!response.ok) return
      const data = await response.data()
      await FileManager.writeAsData(filePath, data)

      const entry: AudioCacheEntry = {
        songId: song.id,
        path: filePath,
        sizeBytes: data.size,
        lastPlayedAt: Date.now()
      }
      audioCacheEntriesRef.current.set(song.id, entry)
      saveAudioCacheEntries(targetConfig, audioCacheEntriesRef.current)
      await pruneAudioCacheIfNeeded(targetConfig)
    } catch {
      // Ignore cache failures to keep playback flow smooth.
    } finally {
      audioCacheInFlightRef.current.delete(song.id)
    }
  }

  const persistPlaybackSnapshot = (
    targetConfig: NavidromeConfig,
    song: NavidromeSong,
    position: number,
    duration: number
  ): void => {
    savePlaybackSnapshot({
      scope: allSongsCacheScope(targetConfig),
      songId: song.id,
      positionSec: Math.max(0, position),
      durationSec: Math.max(0, duration),
      updatedAt: Date.now()
    })
  }

  const tryRestorePlaybackFromSnapshot = (songsSource: NavidromeSong[], targetConfig: NavidromeConfig): void => {
    if (songsRef.current.length > 0 && currentIndexRef.current >= 0) return
    if (songsSource.length === 0) return

    const snapshot = loadPlaybackSnapshot()
    if (!snapshot) return
    if (snapshot.scope !== allSongsCacheScope(targetConfig)) return

    const matchedSong = songsSource.find((song) => song.id === snapshot.songId)
    if (!matchedSong) return

    const restoredQueue = [matchedSong]
    setSongs(restoredQueue)
    songsRef.current = restoredQueue
    setQueueLabel("继续播放")
    setCurrentIndex(0)
    const safePosition = Math.max(0, snapshot.positionSec)
    setPositionSec(safePosition)
    seekPositionRef.current = safePosition
    setDurationSec(Math.max(snapshot.durationSec, matchedSong.duration))
    setPlaybackState("paused")
  }

  const formatLyricTimestamp = (ms: number): string => {
    const total = Math.max(0, Math.floor(ms))
    const minutes = Math.floor(total / 60000)
    const seconds = Math.floor((total % 60000) / 1000)
    const centiseconds = Math.floor((total % 1000) / 10)
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`
  }

  const extractLyricsFromServerPayload = (payload: unknown): string | null => {
    if (typeof payload === "string") {
      const text = payload.trim()
      return text.length > 0 ? text : null
    }

    if (Array.isArray(payload)) {
      const structured = payload
        .filter((item) => isRecord(item))
        .map((item) => {
          const linesRaw = item.line
          if (!Array.isArray(linesRaw)) return null
          const synced = item.synced !== false
          const lines = linesRaw
            .map((line) => {
              if (!isRecord(line)) return ""
              const text = String(line.value ?? line.text ?? line.lyric ?? "").trim()
              if (!text) return ""
              if (!synced) return text
              const startMs = Number(line.start ?? line.time ?? line.timestamp ?? line.ms)
              if (!Number.isFinite(startMs) || startMs < 0) return text
              return `[${formatLyricTimestamp(startMs)}]${text}`
            })
            .filter((line) => line.length > 0)
          if (lines.length === 0) return null
          const text = lines.join("\n")
          return {
            text,
            synced,
            lang: String(item.lang ?? item.language ?? "").toLowerCase()
          }
        })
        .filter((item): item is { text: string; synced: boolean; lang: string } => item !== null)

      if (structured.length > 0) {
        const preferred =
          structured.find((item) => item.synced && (item.lang.startsWith("zh") || item.lang.startsWith("cn"))) ??
          structured.find((item) => item.synced) ??
          structured.find((item) => item.lang.startsWith("zh") || item.lang.startsWith("cn")) ??
          structured[0]
        return preferred?.text ?? null
      }

      const joined = payload
        .map((item) => extractLyricsFromServerPayload(item))
        .filter((text): text is string => Boolean(text))
        .join("\n")
        .trim()
      return joined.length > 0 ? joined : null
    }

    if (!isRecord(payload)) return null

    const directKeys = [
      "lyrics",
      "lyric",
      "lrc",
      "text",
      "content",
      "value",
      "line",
      "structuredLyrics",
      "lyricsList"
    ]
    for (const key of directKeys) {
      if (key in payload) {
        const extracted = extractLyricsFromServerPayload(payload[key])
        if (extracted) return extracted
      }
    }

    return null
  }

  const fetchServerLyrics = async (song: NavidromeSong): Promise<string | null> => {
    const currentConfig = configRef.current

    try {
      const bySongId = await requestSubsonic(currentConfig, "getLyricsBySongId", { id: song.id })
      const parsed = extractLyricsFromServerPayload(bySongId)
      if (parsed) return parsed
    } catch {
      // Ignore and fallback to legacy endpoint.
    }

    try {
      const byMeta = await requestSubsonic(currentConfig, "getLyrics", {
        artist: song.artist,
        title: song.title
      })
      return extractLyricsFromServerPayload(byMeta)
    } catch {
      return null
    }
  }

  useEffect(() => {
    configRef.current = config
  }, [config])

  useEffect(() => {
    songsRef.current = songs
  }, [songs])

  useEffect(() => {
    currentIndexRef.current = currentIndex
  }, [currentIndex])

  useEffect(() => {
    playbackModeRef.current = playbackMode
  }, [playbackMode])

  useEffect(() => {
    if (!isConfigReady(config)) {
      setLikedSongIds(new Set())
      setLikedSongsCatalog([])
      setRecentSongsQueue([])
      return
    }
    const likedSongs = loadLikedSongsSnapshot(allSongsCacheScope(config))
    setLikedSongIds(new Set(likedSongs.map((song) => song.id)))
    setLikedSongsCatalog(likedSongs)

    const recentSongs = loadRecentSongs(config)
    setRecentSongsQueue(recentSongs)
  }, [config.serverUrl, config.username, config.password])

  useEffect(() => {
    const song = currentIndex >= 0 ? songs[currentIndex] ?? null : null
    if (!song || !song.coverArt) {
      setCurrentCoverImage(null)
      return
    }

    const cached = coverCacheRef.current.get(song.coverArt)
    if (cached !== undefined) {
      setCurrentCoverImage(cached)
      return
    }

    const songId = song.id
    void UIImage.fromURL(buildSubsonicUrl(configRef.current, "getCoverArt", { id: song.coverArt, size: 512 }))
      .then((image) => {
        if (currentIndexRef.current < 0) return
        const latest = songsRef.current[currentIndexRef.current]
        if (!latest || latest.id !== songId) return
        const normalized = image ?? null
        coverCacheRef.current.set(song.coverArt as string, normalized)
        while (coverCacheRef.current.size > MAX_COVER_CACHE_ENTRIES) {
          const oldest = coverCacheRef.current.keys().next().value
          if (!oldest) break
          coverCacheRef.current.delete(oldest)
        }
        setCurrentCoverImage(normalized)
      })
      .catch(() => {
        coverCacheRef.current.set(song.coverArt as string, null)
        setCurrentCoverImage(null)
      })
  }, [currentIndex, songs, config.serverUrl, config.username])

  async function testConnection(nextConfig?: NavidromeConfig): Promise<ConnectionFeedback> {
    const ready = sanitizeConfig(nextConfig ?? configRef.current)
    setConfig(ready)
    configRef.current = ready
    if (!isConfigReady(ready)) {
      const message = "请先填写服务器地址、用户名和密码"
      setConnectionState("error")
      setConnectionMessage(message)
      return { state: "error", message }
    }

    setConnectionState("loading")
    setConnectionMessage("连接测试中...")
    try {
      await requestSubsonic(ready, "ping")
      const message = "连接成功"
      setConnectionState("ok")
      setConnectionMessage(message)
      return { state: "ok", message }
    } catch (error) {
      const message = `连接失败：${String(error)}`
      setConnectionState("error")
      setConnectionMessage(message)
      return { state: "error", message }
    }
  }

  async function loadAllSongsFromServer(nextConfig?: NavidromeConfig): Promise<NavidromeSong[]> {
    const ready = sanitizeConfig(nextConfig ?? configRef.current)
    setConfig(ready)
    configRef.current = ready

    if (!isConfigReady(ready)) {
      setConnectionState("error")
      setConnectionMessage("请先填写服务器地址、用户名和密码")
      return allSongsLibrary
    }

    setLoadingSongs(true)
    setConnectionState("loading")
    setConnectionMessage("同步歌曲中...")

    const cacheData = await readAllSongsCache(ready)
    if (cacheData && cacheData.songs.length > 0) {
      setAllSongsLibrary(cacheData.songs)
      setLatestSongsQueue(cacheData.songs.slice(-12).reverse())
      tryRestorePlaybackFromSnapshot(cacheData.songs, ready)
    }

    try {
      const songsById = new Map<string, NavidromeSong>()
      const albumMap = new Map<string, AllSongsAlbumCacheEntry>()
      let offset = 0
      const ALBUM_FETCH_CONCURRENCY = 4

      const fetchAlbumsWithConcurrency = async (albums: NavidromeAlbum[]): Promise<Array<{ album: NavidromeAlbum; songs: NavidromeSong[] }>> => {
        if (albums.length === 0) return []
        const result: Array<{ album: NavidromeAlbum; songs: NavidromeSong[] }> = new Array(albums.length)
        let cursor = 0

        const worker = async () => {
          while (true) {
            const current = cursor
            cursor += 1
            if (current >= albums.length) break
            const album = albums[current]
            const detail = await requestSubsonic(ready, "getAlbum", { id: album.id })
            const albumSongs = normalizeSongs(detail.album?.song)
            result[current] = { album, songs: albumSongs }
          }
        }

        const workers = new Array(Math.min(ALBUM_FETCH_CONCURRENCY, albums.length)).fill(0).map(() => worker())
        await Promise.all(workers)
        return result
      }

      while (true) {
        const listData = await requestSubsonic(ready, "getAlbumList2", {
          type: "alphabeticalByName",
          size: ALL_SONGS_ALBUM_PAGE_SIZE,
          offset
        })

        const albums = normalizeAlbums(listData.albumList2?.album)
        if (albums.length === 0) break

        const result = await fetchAlbumsWithConcurrency(albums)

        for (const row of result) {
          albumMap.set(row.album.id, {
            fingerprint: buildAlbumFingerprint(row.album),
            songs: row.songs
          })
          for (const song of row.songs) {
            if (!songsById.has(song.id)) songsById.set(song.id, song)
          }
        }

        offset += albums.length
        setConnectionMessage(`同步歌曲中... 已收集 ${songsById.size} 首`)
        if (albums.length < ALL_SONGS_ALBUM_PAGE_SIZE) break
      }

      const allSongs = Array.from(songsById.values())
      setAllSongsLibrary(allSongs)
      tryRestorePlaybackFromSnapshot(allSongs, ready)
      void loadLatestSongsModule(ready, allSongs)
      await writeAllSongsCache(ready, allSongs, albumMap)
      setConnectionState("ok")
      setConnectionMessage(`全部歌曲同步成功：${allSongs.length} 首`)
      return allSongs
    } catch (error) {
      setConnectionState("error")
      setConnectionMessage(`全部歌曲同步失败：${String(error)}`)
      return allSongsLibrary
    } finally {
      setLoadingSongs(false)
    }
  }

  async function loadPlaylistsFromServer(nextConfig?: NavidromeConfig): Promise<void> {
    const ready = sanitizeConfig(nextConfig ?? configRef.current)
    setConfig(ready)
    configRef.current = ready

    if (!isConfigReady(ready)) {
      setConnectionState("error")
      setConnectionMessage("请先填写服务器地址、用户名和密码")
      return
    }

    setLoadingPlaylists(true)
    try {
      const data = await requestSubsonic(ready, "getPlaylists")
      const rows = normalizePlaylists(data.playlists?.playlist)
      setPlaylists(rows)
    } finally {
      setLoadingPlaylists(false)
    }
  }

  async function loadLatestSongsModule(nextConfig?: NavidromeConfig, fallbackSongs?: NavidromeSong[]): Promise<void> {
    const ready = sanitizeConfig(nextConfig ?? configRef.current)
    if (!isConfigReady(ready)) {
      setLatestSongsQueue([])
      return
    }

    try {
      const albumsRaw = await requestSubsonic(ready, "getAlbumList2", {
        type: "newest",
        size: 10
      })
      const newestAlbums = normalizeAlbums(albumsRaw.albumList2?.album)

      if (newestAlbums.length === 0) {
        const fallback = (fallbackSongs ?? allSongsLibrary).slice(-12).reverse()
        setLatestSongsQueue(fallback)
        return
      }

      const songsById = new Map<string, NavidromeSong>()
      const ALBUM_DETAIL_CONCURRENCY = 3
      let cursor = 0

      const worker = async () => {
        while (true) {
          const current = cursor
          cursor += 1
          if (current >= newestAlbums.length) break
          const album = newestAlbums[current]
          const detail = await requestSubsonic(ready, "getAlbum", { id: album.id })
          const songs = normalizeSongs(detail.album?.song)
          for (const song of songs) {
            if (!songsById.has(song.id)) songsById.set(song.id, song)
          }
        }
      }

      await Promise.all(new Array(Math.min(ALBUM_DETAIL_CONCURRENCY, newestAlbums.length)).fill(0).map(() => worker()))

      const latestSongs = Array.from(songsById.values()).slice(0, 12)
      if (latestSongs.length > 0) {
        setLatestSongsQueue(latestSongs)
      } else {
        const fallback = (fallbackSongs ?? allSongsLibrary).slice(-12).reverse()
        setLatestSongsQueue(fallback)
      }
    } catch {
      const fallback = (fallbackSongs ?? allSongsLibrary).slice(-12).reverse()
      setLatestSongsQueue(fallback)
    }
  }

  function playSong(index: number): void {
    if (index < 0 || index >= songsRef.current.length) return
    const song = songsRef.current[index]
    const readyConfig = configRef.current

    setRecentSongsQueue((prev) => {
      const deduped = [song, ...prev.filter((item) => item.id !== song.id)].slice(0, 30)
      saveRecentSongs(configRef.current, deduped)
      return deduped
    })

    const cachedPath = resolveCachedSongPath(readyConfig, song.id)
    const source = cachedPath ? `file://${cachedPath}` : buildSubsonicUrl(readyConfig, "stream", { id: song.id })

    if (cachedPath) {
      markCachedSongPlayed(readyConfig, song.id)
    }

    persistPlaybackSnapshot(readyConfig, song, 0, song.duration)
    lastSnapshotSavedAtRef.current = Date.now()
    const prepared = player.setSource(source)
    if (!prepared) {
      setPlaybackState("error")
      return
    }
    setCurrentIndex(index)
    setPositionSec(0)
    seekPositionRef.current = 0
    setDurationSec(song.duration)
    setPlaybackState("loading")

    if (!cachedPath) {
      void cacheSongInBackground(readyConfig, song)
    }
  }

  function playNext(fromEnded = false): void {
    if (songsRef.current.length === 0) return
    const mode = playbackModeRef.current
    const length = songsRef.current.length
    const current = currentIndexRef.current
    let next = 0

    if (current < 0) {
      next = 0
    } else if (fromEnded && mode === "repeat_one") {
      next = current
    } else if (mode === "shuffle") {
      if (length <= 1) {
        next = 0
      } else {
        next = current
        while (next === current) {
          next = Math.floor(Math.random() * length)
        }
      }
    } else {
      next = (current + 1) % length
    }

    playSong(next)
  }

  function playPrevious(): void {
    if (songsRef.current.length === 0) return
    const mode = playbackModeRef.current
    const length = songsRef.current.length
    const current = currentIndexRef.current
    let prev = 0

    if (current < 0) {
      prev = 0
    } else if (mode === "shuffle") {
      if (length <= 1) {
        prev = 0
      } else {
        prev = current
        while (prev === current) {
          prev = Math.floor(Math.random() * length)
        }
      }
    } else {
      prev = (current - 1 + length) % length
    }

    playSong(prev)
  }

  function cyclePlaybackMode(): void {
    setPlaybackMode((prev) => {
      if (prev === "sequence") return "repeat_one"
      if (prev === "repeat_one") return "shuffle"
      return "sequence"
    })
  }

  function pausePlayback(): void {
    player.pause()
    setPlaybackState("paused")
  }

  function resumePlayback(): void {
    if (songsRef.current.length === 0) {
      if (allSongsLibrary.length > 0) {
        replaceQueue(allSongsLibrary, "全部歌曲", 0)
      }
      return
    }
    if (currentIndexRef.current < 0) {
      playSong(0)
      return
    }
    const song = songsRef.current[currentIndexRef.current]
    if (!song) {
      setPlaybackState("error")
      return
    }

    const readyConfig = configRef.current
    const cachedPath = resolveCachedSongPath(readyConfig, song.id)
    const source = cachedPath ? `file://${cachedPath}` : buildSubsonicUrl(readyConfig, "stream", { id: song.id })
    const prepared = player.setSource(source)
    if (!prepared) {
      setPlaybackState("error")
      return
    }

    if (cachedPath) {
      markCachedSongPlayed(readyConfig, song.id)
    }

    const targetPosition = Math.max(0, Math.min(seekPositionRef.current, Math.max(durationSec, song.duration)))
    if (targetPosition > 0) {
      player.currentTime = targetPosition
    }

    persistPlaybackSnapshot(readyConfig, song, targetPosition, Math.max(durationSec, song.duration))
    lastSnapshotSavedAtRef.current = Date.now()
    setPlaybackState("loading")

    if (!cachedPath) {
      void cacheSongInBackground(readyConfig, song)
    }
  }

  function replaceQueue(nextSongs: NavidromeSong[], label: string, startIndex?: number): void {
    setSongs(nextSongs)
    songsRef.current = nextSongs
    setQueueLabel(label)
    if (typeof startIndex === "number") {
      if (nextSongs.length === 0) {
        setCurrentIndex(-1)
        return
      }
      const safeIndex = Math.min(Math.max(startIndex, 0), nextSongs.length - 1)
      playSong(safeIndex)
    }
  }

  function queueSingleSong(song: NavidromeSong, mode: "next" | "tail"): void {
    const currentQueue = songsRef.current
    const current = currentIndexRef.current

    if (currentQueue.length === 0 || current < 0 || current >= currentQueue.length) {
      replaceQueue([song], "当前队列", 0)
      return
    }

    setSongs((prev) => {
      const next = prev.slice()
      if (mode === "next") {
        next.splice(current + 1, 0, song)
      } else {
        next.push(song)
      }
      songsRef.current = next
      return next
    })
    setQueueLabel("当前队列")
  }

  async function toggleSongFavorite(song: NavidromeSong): Promise<void> {
    const ready = sanitizeConfig(configRef.current)
    if (!isConfigReady(ready)) return
    if (favoritePendingSongId === song.id) return

    const next = new Set(likedSongIds)
    const liked = next.has(song.id)
    if (liked) next.delete(song.id)
    else next.add(song.id)
    setLikedSongIds(next)

    const optimistic = liked
      ? likedSongsCatalog.filter((row) => row.id !== song.id)
      : [song, ...likedSongsCatalog]
    setLikedSongsCatalog(optimistic)
    saveLikedSongsSnapshot({ scope: allSongsCacheScope(ready), updatedAt: Date.now(), songs: optimistic })

    setFavoritePendingSongId(song.id)
    try {
      await requestSubsonic(ready, liked ? "unstar" : "star", { id: song.id })
    } catch {
      // rollback from snapshot on failure
      const rollbackSongs = loadLikedSongsSnapshot(allSongsCacheScope(ready))
      setLikedSongIds(new Set(rollbackSongs.map((row) => row.id)))
      setLikedSongsCatalog(rollbackSongs)
    } finally {
      setFavoritePendingSongId((prev) => (prev === song.id ? null : prev))
    }
  }

  function toggleCurrentSongFavorite(): void {
    const song = currentIndex >= 0 ? songs[currentIndex] ?? null : null
    if (!song) return
    void toggleSongFavorite(song)
  }

  async function fetchLyricsForSong(song: NavidromeSong, manual = false): Promise<void> {
    const requestId = lyricsRequestIdRef.current + 1
    lyricsRequestIdRef.current = requestId

    setLyricsLoading(true)
    setLyricsMessage(manual ? "正在刷新歌词..." : `正在获取歌词：${song.title}`)
    try {
      if (lyricsRequestIdRef.current !== requestId) return

      const serverLyrics = await fetchServerLyrics(song)
      if (lyricsRequestIdRef.current !== requestId) return
      if (serverLyrics) {
        setLyricsText(serverLyrics)
        setLyricsMessage("")
        return
      }

      const lyricsApiUrl = configRef.current.lyricsApiUrl.trim()
      if (!lyricsApiUrl) {
        setLyricsText("")
        setLyricsMessage("未找到内嵌歌词，且未配置歌词 API 地址")
        return
      }

      const response = await fetch(buildLyricsRequestUrl(lyricsApiUrl, song), {
        timeout: 15,
        allowInsecureRequest: true,
        debugLabel: "NavidromeLyrics"
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const text = await response.text()
      const parsed = parseLyricsResponseText(text)
      if (lyricsRequestIdRef.current !== requestId) return
      if (!parsed) {
        setLyricsText("")
        setLyricsMessage("歌词接口返回为空")
      } else {
        setLyricsText(parsed)
        setLyricsMessage(`歌词已更新：${song.title}`)
      }
    } catch (error) {
      if (lyricsRequestIdRef.current !== requestId) return
      setLyricsText("")
      setLyricsMessage(`歌词获取失败：${String(error)}`)
    } finally {
      if (lyricsRequestIdRef.current === requestId) {
        setLyricsLoading(false)
      }
    }
  }

  useEffect(() => {
    const song = currentIndex >= 0 ? songs[currentIndex] ?? null : null
    if (!song) {
      setLyricsLoading(false)
      setLyricsMessage("")
      return
    }
    void fetchLyricsForSong(song)
  }, [currentIndex, songs, config.lyricsApiUrl])

  useEffect(() => {
    player.onReadyToPlay = () => {
      const current = songsRef.current[currentIndexRef.current]
      if (!current) return
      const ok = player.play()
      if (!ok) {
        setPlaybackState("error")
        return
      }
      setPlaybackState("playing")
      setDurationSec(player.duration > 0 ? player.duration : current.duration)
    }

    player.onTimeControlStatusChanged = (status) => {
      if (status === TimeControlStatus.playing) {
        setPlaybackState("playing")
      } else if (status === TimeControlStatus.waitingToPlayAtSpecifiedRate) {
        setPlaybackState("loading")
      } else {
        setPlaybackState("paused")
      }
    }

    player.onEnded = () => {
      playNext(true)
    }

    player.onError = (message) => {
      setPlaybackState("error")
      setConnectionState("error")
      setConnectionMessage(`播放失败：${message}`)
    }

    return () => {
      player.stop()
      player.dispose()
    }
  }, [player])

  useEffect(() => {
    let stopped = false
    let timerId = 0
    const PROGRESS_TICK_MS = 300

    const tick = () => {
      if (stopped) return
      const isUserInteractingSeek = isSeeking || Date.now() - lastManualSeekAtRef.current < 900
      if (!isUserInteractingSeek && currentIndexRef.current >= 0) {
        const current = player.currentTime
        if (Number.isFinite(current)) {
          const safeCurrent = Math.max(0, current)
          setPositionSec(safeCurrent)
          seekPositionRef.current = safeCurrent

          const currentSong = songsRef.current[currentIndexRef.current]
          if (currentSong && Date.now() - lastSnapshotSavedAtRef.current > 1800) {
            persistPlaybackSnapshot(
              configRef.current,
              currentSong,
              safeCurrent,
              player.duration > 0 ? player.duration : currentSong.duration
            )
            lastSnapshotSavedAtRef.current = Date.now()
          }
        }
      }
      timerId = setTimeout(tick, PROGRESS_TICK_MS)
    }

    timerId = setTimeout(tick, PROGRESS_TICK_MS)
    return () => {
      stopped = true
      clearTimeout(timerId)
    }
  }, [player, isSeeking])

  useEffect(() => {
    let stopped = false
    let timerId = 0
    const FRAME_MS = 50
    const ROTATION_PER_SECOND = 15

    const spin = () => {
      if (stopped) return
      if (playbackState === "playing" && uiTab === "player") {
        setDiscRotationDeg((prev) => (prev + (ROTATION_PER_SECOND * FRAME_MS) / 1000) % 360)
      }
      timerId = setTimeout(spin, FRAME_MS)
    }

    timerId = setTimeout(spin, FRAME_MS)
    return () => {
      stopped = true
      clearTimeout(timerId)
    }
  }, [playbackState, uiTab])

  useEffect(() => {
    const ready = sanitizeConfig(config)
    if (!isConfigReady(ready)) return
    void loadAllSongsFromServer(ready)
    void loadPlaylistsFromServer(ready)
  }, [config.serverUrl, config.username, config.password])

  function applyConfig(nextConfig: NavidromeConfig): void {
    const normalized = sanitizeConfig(nextConfig)
    setConfig(normalized)
    configRef.current = normalized
    saveConfig(normalized)
  }

  function openSettings(): void {
    void Navigation.present(
      <NavigationStack>
        <PresentedPageWithNowPlayingBar
          currentCoverImage={currentCoverImage}
          currentSong={currentIndex >= 0 ? songs[currentIndex] ?? null : null}
          playbackHint={playbackHint}
          isPlaying={playbackState === "playing"}
          onTogglePlayPause={() => {
            if (playbackState === "playing") pausePlayback()
            else resumePlayback()
          }}
          onBackToPlayer={() => setUiTab("player")}
        >
          <NavidromeSettingsPage
            config={config}
            connectionState={connectionState}
            connectionMessage={connectionMessage}
            loadingSongs={loadingSongs}
            onSave={applyConfig}
            onTestConnection={testConnection}
            onSyncSongs={loadAllSongsFromServer}
          />
        </PresentedPageWithNowPlayingBar>
      </NavigationStack>
    )
  }

  function openPlaylist(playlist: NavidromePlaylist): void {
    void Navigation.present(
      <NavigationStack>
        <PresentedPageWithNowPlayingBar
          currentCoverImage={currentCoverImage}
          currentSong={currentIndex >= 0 ? songs[currentIndex] ?? null : null}
          playbackHint={playbackHint}
          isPlaying={playbackState === "playing"}
          onTogglePlayPause={() => {
            if (playbackState === "playing") pausePlayback()
            else resumePlayback()
          }}
          onBackToPlayer={() => setUiTab("player")}
        >
          <PlaylistSongsPage
            playlist={playlist}
            config={configRef.current}
            onQueueSingleSong={async (song, mode) => {
              queueSingleSong(song, mode)
            }}
            onPlayPlaylistQueue={async (nextPlaylist, tracks, startIndex) => {
              replaceQueue(tracks, `歌单：${nextPlaylist.name}`, startIndex)
            }}
          />
        </PresentedPageWithNowPlayingBar>
      </NavigationStack>
    )
  }

  function openSongSearch(): void {
    const keyword = songSearchQuery.trim()
    if (!keyword) return
    const query = keyword.toLowerCase()
    const filtered = allSongsLibrary.filter((song) => {
      return (
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query) ||
        song.album.toLowerCase().includes(query)
      )
    })

    void Navigation.present(
      <NavigationStack>
        <PresentedPageWithNowPlayingBar
          currentCoverImage={currentCoverImage}
          currentSong={currentIndex >= 0 ? songs[currentIndex] ?? null : null}
          playbackHint={playbackHint}
          isPlaying={playbackState === "playing"}
          onTogglePlayPause={() => {
            if (playbackState === "playing") pausePlayback()
            else resumePlayback()
          }}
          onBackToPlayer={() => setUiTab("player")}
        >
          <SongSearchPage
            keyword={keyword}
            songs={filtered}
            onPlaySong={(matchedSongs, startIndex) => {
              replaceQueue(matchedSongs, `搜索：${keyword}`, startIndex)
              setUiTab("player")
            }}
            onQueueSingleSong={queueSingleSong}
          />
        </PresentedPageWithNowPlayingBar>
      </NavigationStack>
    )
  }

  function openAllSongsCatalog(): void {
    void Navigation.present(
      <NavigationStack>
        <PresentedPageWithNowPlayingBar
          currentCoverImage={currentCoverImage}
          currentSong={currentIndex >= 0 ? songs[currentIndex] ?? null : null}
          playbackHint={playbackHint}
          isPlaying={playbackState === "playing"}
          onTogglePlayPause={() => {
            if (playbackState === "playing") pausePlayback()
            else resumePlayback()
          }}
          onBackToPlayer={() => setUiTab("player")}
        >
          <AllSongsCatalogPage
            config={configRef.current}
            initialSongs={allSongsLibrary}
            currentSongId={currentIndex >= 0 ? songs[currentIndex]?.id ?? null : null}
            onSyncSongs={loadAllSongsFromServer}
            getLatestSongs={() => allSongsLibrary}
            onQueueSingleSong={async (song, mode) => {
              queueSingleSong(song, mode)
            }}
            onPlaySong={async (librarySongs, startIndex) => {
              replaceQueue(librarySongs, "全部歌曲", startIndex)
            }}
          />
        </PresentedPageWithNowPlayingBar>
      </NavigationStack>
    )
  }

  function openLikedSongsCatalog(): void {
    void Navigation.present(
      <NavigationStack>
        <PresentedPageWithNowPlayingBar
          currentCoverImage={currentCoverImage}
          currentSong={currentIndex >= 0 ? songs[currentIndex] ?? null : null}
          playbackHint={playbackHint}
          isPlaying={playbackState === "playing"}
          onTogglePlayPause={() => {
            if (playbackState === "playing") pausePlayback()
            else resumePlayback()
          }}
          onBackToPlayer={() => setUiTab("player")}
        >
          <LikedSongsCatalogPage
            initialSongs={likedSongsCatalog}
            currentSongId={currentIndex >= 0 ? songs[currentIndex]?.id ?? null : null}
            onRefreshFavorites={async () => {
              if (!isConfigReady(configRef.current)) return
              const data = await requestSubsonic(configRef.current, "getStarred2")
              const list = normalizeSongs(data.starred2?.song ?? data.starred?.song)
              setLikedSongIds(new Set(list.map((row) => row.id)))
              setLikedSongsCatalog(list)
              saveLikedSongsSnapshot({ scope: allSongsCacheScope(configRef.current), updatedAt: Date.now(), songs: list })
            }}
            getLatestSongs={() => likedSongsCatalog}
            onQueueSingleSong={async (song, mode) => {
              queueSingleSong(song, mode)
            }}
            onPlaySong={async (nextSongs, startIndex) => {
              replaceQueue(nextSongs, "我喜欢的", startIndex)
            }}
          />
        </PresentedPageWithNowPlayingBar>
      </NavigationStack>
    )
  }

  function openPlaylistsCatalog(): void {
    void Navigation.present(
      <NavigationStack>
        <PresentedPageWithNowPlayingBar
          currentCoverImage={currentCoverImage}
          currentSong={currentIndex >= 0 ? songs[currentIndex] ?? null : null}
          playbackHint={playbackHint}
          isPlaying={playbackState === "playing"}
          onTogglePlayPause={() => {
            if (playbackState === "playing") pausePlayback()
            else resumePlayback()
          }}
          onBackToPlayer={() => setUiTab("player")}
        >
          <PlaylistsCatalogPage
            config={configRef.current}
            initialPlaylists={playlists}
            onSyncPlaylists={async () => {
              await loadPlaylistsFromServer()
            }}
            getLatestPlaylists={() => playlists}
            onQueueSingleSong={async (song, mode) => {
              queueSingleSong(song, mode)
            }}
            onPlayPlaylistQueue={async (playlist, tracks, startIndex) => {
              replaceQueue(tracks, `歌单：${playlist.name}`, startIndex)
            }}
          />
        </PresentedPageWithNowPlayingBar>
      </NavigationStack>
    )
  }

  function openArtistSongs(artistName: string, artistSongs: NavidromeSong[]): void {
    void Navigation.present(
      <NavigationStack>
        <PresentedPageWithNowPlayingBar
          currentCoverImage={currentCoverImage}
          currentSong={currentIndex >= 0 ? songs[currentIndex] ?? null : null}
          playbackHint={playbackHint}
          isPlaying={playbackState === "playing"}
          onTogglePlayPause={() => {
            if (playbackState === "playing") pausePlayback()
            else resumePlayback()
          }}
          onBackToPlayer={() => setUiTab("player")}
        >
          <ArtistSongsPage
            config={configRef.current}
            artistName={artistName}
            songs={artistSongs}
            onQueueSingleSong={async (song, mode) => {
              queueSingleSong(song, mode)
            }}
            onPlayArtistQueue={async (name, tracks, startIndex) => {
              replaceQueue(tracks, `歌手：${name}`, startIndex)
            }}
          />
        </PresentedPageWithNowPlayingBar>
      </NavigationStack>
    )
  }

  function openArtistCatalog(): void {
    void Navigation.present(
      <NavigationStack>
        <PresentedPageWithNowPlayingBar
          currentCoverImage={currentCoverImage}
          currentSong={currentIndex >= 0 ? songs[currentIndex] ?? null : null}
          playbackHint={playbackHint}
          isPlaying={playbackState === "playing"}
          onTogglePlayPause={() => {
            if (playbackState === "playing") pausePlayback()
            else resumePlayback()
          }}
          onBackToPlayer={() => setUiTab("player")}
        >
          <ArtistCatalogPage
            initialSongs={allSongsLibrary}
            onSyncSongs={loadAllSongsFromServer}
            getLatestSongs={() => allSongsLibrary}
            onOpenArtist={openArtistSongs}
          />
        </PresentedPageWithNowPlayingBar>
      </NavigationStack>
    )
  }

  function openQueueSheet(): void {
    void Navigation.present(
      <NavigationStack>
        <PresentedPageWithNowPlayingBar
          currentCoverImage={currentCoverImage}
          currentSong={currentIndex >= 0 ? songs[currentIndex] ?? null : null}
          playbackHint={playbackHint}
          isPlaying={playbackState === "playing"}
          onTogglePlayPause={() => {
            if (playbackState === "playing") pausePlayback()
            else resumePlayback()
          }}
          onBackToPlayer={() => setUiTab("player")}
        >
          <QueueSheetPage
            queueLabel={queueLabel}
            songs={songs}
            currentIndex={currentIndex}
            onClearPlayed={() => {
              const latestIndex = currentIndexRef.current
              setSongs((prev) => {
                if (latestIndex <= 0 || latestIndex >= prev.length) return prev
                const next = prev.slice(latestIndex)
                songsRef.current = next
                return next
              })
              if (latestIndex > 0) {
                setCurrentIndex(0)
              }
            }}
            onClearUpcoming={() => {
              const latestIndex = currentIndexRef.current
              setSongs((prev) => {
                if (latestIndex < 0 || latestIndex >= prev.length) return prev
                const next = prev.slice(0, latestIndex + 1)
                songsRef.current = next
                return next
              })
            }}
            onSelectSong={(index) => {
              playSong(index)
              setUiTab("player")
            }}
          />
        </PresentedPageWithNowPlayingBar>
      </NavigationStack>
    )
  }

  function openModuleSongsList(title: string, songsInModule: NavidromeSong[], queueLabelTitle: string): void {
    void Navigation.present(
      <NavigationStack>
        <PresentedPageWithNowPlayingBar
          currentCoverImage={currentCoverImage}
          currentSong={currentIndex >= 0 ? songs[currentIndex] ?? null : null}
          playbackHint={playbackHint}
          isPlaying={playbackState === "playing"}
          onTogglePlayPause={() => {
            if (playbackState === "playing") pausePlayback()
            else resumePlayback()
          }}
          onBackToPlayer={() => setUiTab("player")}
        >
          <ModuleSongsListPage
            title={title}
            songs={songsInModule}
            onPlaySong={(index) => {
              if (songsInModule.length === 0) return
              replaceQueue(songsInModule, queueLabelTitle, index)
              setUiTab("player")
            }}
          />
        </PresentedPageWithNowPlayingBar>
      </NavigationStack>
    )
  }

  function switchTabBySwipe(deltaX: number): void {
    const tabs: Array<"library" | "player" | "lyrics"> = ["library", "player", "lyrics"]
    const current = tabs.indexOf(uiTab)
    if (current < 0) return

    if (deltaX < 0 && current < tabs.length - 1) {
      setUiTab(tabs[current + 1])
      return
    }
    if (deltaX > 0 && current > 0) {
      setUiTab(tabs[current - 1])
    }
  }

  const timedLyricLines = useMemo(() => parseTimedLyrics(lyricsText), [lyricsText])
  const lyricLines = useMemo(
    () => lyricsText.split(/\r?\n/).map((line) => stripLyricTimeTags(line)).filter((line) => line.length > 0),
    [lyricsText]
  )

  const currentSong = currentIndex >= 0 ? songs[currentIndex] ?? null : null
  const isCurrentSongLiked = currentSong ? likedSongIds.has(currentSong.id) : false
  const isCurrentSongFavoriteSyncing = currentSong ? favoritePendingSongId === currentSong.id : false
  const sliderMax = Math.max(durationSec, 1)
  const sliderValue = Math.min(Math.max(positionSec, 0), sliderMax)
  const renderedLyricLines = lyricLines.slice(0, 140)

  const currentTimedLyricIndex = useMemo(() => {
    if (timedLyricLines.length === 0) return -1
    const currentTime = Math.max(0, positionSec)
    let low = 0
    let high = timedLyricLines.length - 1
    let answer = -1
    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      if (timedLyricLines[mid].time <= currentTime) {
        answer = mid
        low = mid + 1
      } else {
        high = mid - 1
      }
    }
    return answer
  }, [timedLyricLines, positionSec])

  const playerSyncedLyricWindow = useMemo(() => {
    if (timedLyricLines.length === 0) return [] as Array<TimedLyricLine | null>
    const center = currentTimedLyricIndex >= 0 ? currentTimedLyricIndex : 0
    return [
      timedLyricLines[center - 1] ?? null,
      timedLyricLines[center] ?? null,
      timedLyricLines[center + 1] ?? null
    ]
  }, [timedLyricLines, currentTimedLyricIndex])

  const featuredPlaylists = playlists.slice(0, 30)

  const dailyMixQueue = useMemo(() => {
    if (allSongsLibrary.length === 0) return [] as NavidromeSong[]

    const dayKey = new Date().toISOString().slice(0, 10)
    let seed = 0
    const source = `${dayKey}:${config.serverUrl}:${config.username}`
    for (let i = 0; i < source.length; i += 1) {
      seed = (seed * 131 + source.charCodeAt(i)) >>> 0
    }
    const nextRandom = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0
      return seed / 4294967296
    }

    const list = allSongsLibrary.slice()
    for (let i = list.length - 1; i > 0; i -= 1) {
      const j = Math.floor(nextRandom() * (i + 1))
      const tmp = list[i]
      list[i] = list[j]
      list[j] = tmp
    }
    return list.slice(0, Math.min(12, list.length))
  }, [allSongsLibrary, config.serverUrl, config.username])

  const isLibraryTab = uiTab === "library"
  const playbackHint =
    playbackState === "playing"
      ? "正在播放"
      : playbackState === "paused"
        ? "暂停中"
          : playbackState === "loading"
            ? "缓冲中"
            : "待播放"
  const playbackModeIcon = playbackMode === "repeat_one" ? "repeat.1" : playbackMode === "shuffle" ? "shuffle" : "repeat"

  const contentBottomPadding = uiTab === "player" ? 72 : 120
  const backgroundGradient: any = {
    colors: ["#072444", "#0C4A77", "#A445A5"],
    startPoint: "topLeading" as const,
    endPoint: "bottomTrailing" as const
  }
  const tabButtonFill = (active: boolean) => (active ? "rgba(255,255,255,0.24)" : "clear")

  const libraryActions = [
    { title: "全部歌曲", icon: "music.note.list", action: openAllSongsCatalog },
    { title: "我喜欢的", icon: "heart.fill", action: openLikedSongsCatalog },
    { title: "歌单", icon: "music.note.list", action: openPlaylistsCatalog },
    { title: "歌手", icon: "person.2.fill", action: openArtistCatalog }
  ]

  return (
    <NavigationStack>
      <ZStack
        frame={{ maxWidth: "infinity", maxHeight: "infinity" }}
        simultaneousGesture={DragGesture({ minDistance: 24 }).onEnded((event) => {
          const startY = event.startLocation.y
          const dx = event.translation.width
          const dy = event.translation.height
          if (uiTab === "library" && startY > 260 && Math.abs(dx) < 110) return
          if (Math.abs(dx) < 64) return
          if (Math.abs(dx) < Math.abs(dy) * 1.35) return
          switchTabBySwipe(dx)
        })}
      >
        <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} background={backgroundGradient} />
        <Circle frame={{ width: 360, height: 360 }} fill="rgba(132,208,255,0.24)" blur={80} offset={{ x: -120, y: -200 }} />
        <Circle frame={{ width: 320, height: 320 }} fill="rgba(255,123,200,0.20)" blur={90} offset={{ x: 145, y: 260 }} />

        <ScrollView scrollIndicator="hidden">
          <VStack spacing={16} padding={{ horizontal: 16, top: 10, bottom: contentBottomPadding }}>
            <ZStack frame={{ maxWidth: "infinity" }}>
              <Text font={{ name: "system-bold", size: 20 }} foregroundStyle="white" lineLimit={1}>Navidrome</Text>
              <HStack alignment="center" spacing={10} frame={{ maxWidth: "infinity" }}>
                <CircleIconButton icon="xmark" action={dismiss} fill="rgba(0,0,0,0.24)" foregroundStyle="white" />
                <Spacer />
                <HStack spacing={6}>
                  <CircleIconButton
                    icon={loadingSongs || loadingPlaylists ? "arrow.triangle.2.circlepath.circle.fill" : "arrow.clockwise"}
                    action={() => {
                      if (loadingSongs || loadingPlaylists) return
                      void loadAllSongsFromServer()
                      void loadPlaylistsFromServer()
                    }}
                    fill="rgba(0,0,0,0.24)"
                    foregroundStyle="rgba(255,255,255,0.9)"
                  />
                  <CircleIconButton icon="gearshape" action={openSettings} fill="rgba(0,0,0,0.24)" foregroundStyle="rgba(255,255,255,0.9)" />
                </HStack>
              </HStack>
            </ZStack>

            <VStack spacing={10}>
              <HStack spacing={8} alignment="center" frame={{ maxWidth: "infinity" }} padding={4}>
                <Button action={() => setUiTab("library")} buttonStyle="plain" frame={{ maxWidth: "infinity" }}>
                  <Text
                    font={14}
                    foregroundStyle={uiTab === "library" ? "white" : "rgba(255,255,255,0.75)"}
                    frame={{ maxWidth: "infinity" }}
                    padding={{ vertical: 8 }}
                    background={<RoundedRectangle cornerRadius={999} style="continuous" fill={tabButtonFill(uiTab === "library")} />}
                  >推荐</Text>
                </Button>
                <Button action={() => setUiTab("player")} buttonStyle="plain" frame={{ maxWidth: "infinity" }}>
                  <Text
                    font={14}
                    foregroundStyle={uiTab === "player" ? "white" : "rgba(255,255,255,0.75)"}
                    frame={{ maxWidth: "infinity" }}
                    padding={{ vertical: 8 }}
                    background={<RoundedRectangle cornerRadius={999} style="continuous" fill={tabButtonFill(uiTab === "player")} />}
                  >歌曲</Text>
                </Button>
                <Button action={() => setUiTab("lyrics")} buttonStyle="plain" frame={{ maxWidth: "infinity" }}>
                  <Text
                    font={14}
                    foregroundStyle={uiTab === "lyrics" ? "white" : "rgba(255,255,255,0.75)"}
                    frame={{ maxWidth: "infinity" }}
                    padding={{ vertical: 8 }}
                    background={<RoundedRectangle cornerRadius={999} style="continuous" fill={tabButtonFill(uiTab === "lyrics")} />}
                  >歌词</Text>
                </Button>
              </HStack>
            </VStack>

            {uiTab === "player" ? (
              <PlayerTabContent
                currentCoverImage={currentCoverImage}
                discRotationDeg={discRotationDeg}
                currentSong={currentSong}
                lyricsLoading={lyricsLoading}
                timedLyricLines={timedLyricLines}
                playerSyncedLyricWindow={playerSyncedLyricWindow}
                currentTimedLyricIndex={currentTimedLyricIndex}
                lyricLines={lyricLines}
                isCurrentSongLiked={isCurrentSongLiked}
                isCurrentSongFavoriteSyncing={isCurrentSongFavoriteSyncing}
                onToggleCurrentSongFavorite={toggleCurrentSongFavorite}
                onOpenSettings={openSettings}
                sliderMax={sliderMax}
                sliderValue={sliderValue}
                positionSec={positionSec}
                durationSec={durationSec}
                onPositionChanged={(value) => {
                  lastManualSeekAtRef.current = Date.now()
                  setPositionSec(value)
                  seekPositionRef.current = value
                  player.currentTime = value
                }}
                onEditingChanged={(editing) => {
                  lastManualSeekAtRef.current = Date.now()
                  setIsSeeking(editing)
                  player.currentTime = seekPositionRef.current
                }}
                playbackModeIcon={playbackModeIcon}
                onTogglePlaybackMode={cyclePlaybackMode}
                onPrevious={playPrevious}
                onTogglePlayPause={() => {
                  if (playbackState === "playing") pausePlayback()
                  else resumePlayback()
                }}
                onNext={playNext}
                onOpenQueue={openQueueSheet}
                isPlaying={playbackState === "playing"}
              />
            ) : null}

            {uiTab === "library" ? (
              <LibraryTabContent
                config={config}
                queueLabel={queueLabel}
                currentSong={currentSong}
                positionSec={positionSec}
                durationSec={durationSec}
                onContinuePlayback={() => {
                  if (playbackState === "playing") {
                    setUiTab("player")
                    return
                  }
                  resumePlayback()
                  setUiTab("player")
                }}
                libraryActions={libraryActions}
                latestSongsQueue={latestSongsQueue}
                onOpenLatestSongsList={() => openModuleSongsList("最新歌曲", latestSongsQueue, "最新歌曲")}
                onPlayLatestSong={(index) => {
                  if (latestSongsQueue.length === 0) return
                  replaceQueue(latestSongsQueue, "最新歌曲", index)
                  setUiTab("player")
                }}
                dailyMixQueue={dailyMixQueue}
                onOpenDailyMixList={() => openModuleSongsList("每日推荐", dailyMixQueue, "每日推荐")}
                onPlayDailyMixSong={(index) => {
                  if (dailyMixQueue.length === 0) return
                  replaceQueue(dailyMixQueue, "每日推荐", index)
                  setUiTab("player")
                }}
                recentSongsQueue={recentSongsQueue}
                onOpenRecentSongsList={() => openModuleSongsList("最近播放", recentSongsQueue, "最近播放")}
                onPlayRecentSong={(index) => {
                  if (recentSongsQueue.length === 0) return
                  replaceQueue(recentSongsQueue, "最近播放", index)
                  setUiTab("player")
                }}
                songSearchQuery={songSearchQuery}
                onSongSearchQueryChange={setSongSearchQuery}
                onOpenSongSearch={openSongSearch}
                loadingPlaylists={loadingPlaylists}
                onSyncPlaylists={() => {
                  void loadPlaylistsFromServer()
                }}
                featuredPlaylists={featuredPlaylists}
                onOpenPlaylist={openPlaylist}
              />
            ) : null}

            {uiTab === "lyrics" ? (
              <LyricsTabContent
                currentSong={currentSong}
                lyricsLoading={lyricsLoading}
                timedLyricLines={timedLyricLines}
                currentTimedLyricIndex={currentTimedLyricIndex}
                renderedLyricLines={renderedLyricLines}
                totalLyricLines={lyricLines.length}
              />
            ) : null}
          </VStack>
        </ScrollView>

        <NowPlayingBar
          isLibraryTab={isLibraryTab}
          currentCoverImage={currentCoverImage}
          currentSong={currentSong}
          playbackHint={playbackHint}
          isPlaying={playbackState === "playing"}
          onTogglePlayPause={() => {
            if (playbackState === "playing") pausePlayback()
            else resumePlayback()
          }}
          onOpenPlayerTab={() => setUiTab("player")}
        />
      </ZStack>
    </NavigationStack>
  )
}

export { NavidromePlayerPage }
