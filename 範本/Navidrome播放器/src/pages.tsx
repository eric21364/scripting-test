import {
  Button,
  Circle,
  HStack,
  Image,
  List,
  Navigation,
  NavigationLink,
  NavigationStack,
  ProgressView,
  Section,
  Spacer,
  Text,
  TextField,
  Toggle,
  SecureField,
  VStack,
  ZStack,
  useEffect,
  useMemo,
  useRef,
  useState
} from "scripting"

import {
  SongSquareCover,
  buildArtistCatalog,
  connectionColor,
  formatDuration,
  getErrorMessage,
  isConfigReady,
  isRecord,
  normalizeFolders,
  normalizeMusicDirectoryChildren,
  normalizePlaylists,
  normalizeSongs,
  requestSubsonic,
  sanitizeConfig
} from "./core"

import type {
  ConnectionFeedback,
  ConnectionState,
  NavidromeConfig,
  NavidromeFolder,
  NavidromePlaylist,
  NavidromeSong
} from "./core"

type QueueActionMode = "replace" | "next" | "tail"

async function presentSongQueueActions(options: {
  song: NavidromeSong
  onSelect: (mode: QueueActionMode) => void
}): Promise<void> {
  const { song, onSelect } = options
  const selected = await Dialog.actionSheet({
    title: song.title,
    message: `${song.artist} - ${song.album}`,
    actions: [
      { label: "立即播放" },
      { label: "下一首播放" },
      { label: "加入队列末尾" }
    ]
  })

  if (selected === 0) onSelect("replace")
  else if (selected === 1) onSelect("next")
  else if (selected === 2) onSelect("tail")
}

function PlaylistSongsPage({
  playlist,
  config,
  onPlayPlaylistQueue,
  onQueueSingleSong
}: {
  playlist: NavidromePlaylist
  config: NavidromeConfig
  onPlayPlaylistQueue: (playlist: NavidromePlaylist, tracks: NavidromeSong[], startIndex: number) => Promise<void>
  onQueueSingleSong: (song: NavidromeSong, mode: "next" | "tail") => Promise<void>
}) {
  const [tracks, setTracks] = useState<NavidromeSong[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("点击刷新加载歌单歌曲")

  async function loadPlaylistTracks(): Promise<void> {
    if (!isConfigReady(config)) {
      setMessage("请先在上一页配置账号")
      return
    }

    setLoading(true)
    setMessage("正在加载歌单歌曲...")
    try {
      const data = await requestSubsonic(config, "getPlaylist", {
        id: playlist.id
      })
      const songs = normalizeSongs(data.playlist?.entry)
      setTracks(songs)
      setMessage(songs.length > 0 ? `共 ${songs.length} 首` : "该歌单暂无歌曲")
    } catch (error) {
      setMessage(`加载失败：${getErrorMessage(error)}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadPlaylistTracks()
  }, [playlist.id, config.serverUrl, config.username, config.password])

  return (
    <List
      navigationTitle={playlist.name}
      navigationBarTitleDisplayMode="inline"
    >
      <Section title="歌单信息">
        <Text>{playlist.name}</Text>
        <Text font="caption" foregroundStyle="secondaryLabel">
          {playlist.songCount > 0 ? `${playlist.songCount} 首` : "曲目未知"}
        </Text>
        <Button
          title={loading ? "刷新中..." : "刷新歌曲"}
          action={() => {
            void loadPlaylistTracks()
          }}
          buttonStyle="bordered"
        />
        <Text font="caption" foregroundStyle="secondaryLabel">
          {message}
        </Text>
      </Section>

      <Section title="歌曲">
        {loading ? (
          <Text foregroundStyle="secondaryLabel">正在加载...</Text>
        ) : tracks.length === 0 ? (
          <Text foregroundStyle="secondaryLabel">暂无歌曲</Text>
        ) : (
          tracks.map((track, index) => (
            <HStack
              key={`${playlist.id}-${track.id}-${index}`}
              alignment="center"
              spacing={8}
              frame={{ maxWidth: "infinity", alignment: "leading" }}
              contentShape="rect"
              onTapGesture={() => {
                void onPlayPlaylistQueue(playlist, tracks, index)
              }}
            >
              <VStack alignment="leading" spacing={2} frame={{ maxWidth: "infinity" }}>
                <Text lineLimit={1}>
                  {index + 1}. {track.title}
                </Text>
                <Text lineLimit={1} font="caption" foregroundStyle="secondaryLabel">
                  {track.artist}
                </Text>
              </VStack>
              <Text font="caption" foregroundStyle="secondaryLabel">
                {formatDuration(track.duration)}
              </Text>
              <Button
                title=""
                systemImage="ellipsis"
                action={() => {
                  void presentSongQueueActions({
                    song: track,
                    onSelect: (mode) => {
                      if (mode === "replace") {
                        void onPlayPlaylistQueue(playlist, tracks, index)
                      } else {
                        void onQueueSingleSong(track, mode)
                      }
                    }
                  })
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

function PlaylistsCatalogPage({
  config,
  initialPlaylists,
  onSyncPlaylists,
  getLatestPlaylists,
  onPlayPlaylistQueue,
  onQueueSingleSong
}: {
  config: NavidromeConfig
  initialPlaylists: NavidromePlaylist[]
  onSyncPlaylists: () => Promise<void>
  getLatestPlaylists: () => NavidromePlaylist[]
  onPlayPlaylistQueue: (playlist: NavidromePlaylist, tracks: NavidromeSong[], startIndex: number) => Promise<void>
  onQueueSingleSong: (song: NavidromeSong, mode: "next" | "tail") => Promise<void>
}) {
  const [playlists, setPlaylists] = useState<NavidromePlaylist[]>(() => initialPlaylists)
  const [query, setQuery] = useState("")
  const [syncing, setSyncing] = useState(false)

  const displayPlaylists = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return playlists
    return playlists.filter((playlist) =>
      `${playlist.name}`.toLowerCase().includes(normalized)
    )
  }, [playlists, query])

  async function syncPlaylists(): Promise<void> {
    if (syncing) return
    setSyncing(true)
    try {
      await onSyncPlaylists()
      setPlaylists(getLatestPlaylists())
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => {
    if (initialPlaylists.length > 0) return
    void syncPlaylists()
  }, [])

  return (
    <List navigationTitle="歌单" navigationBarTitleDisplayMode="inline">
      <Section title="歌单库">
        <Text>{playlists.length} 个歌单</Text>
        <Button
          title={syncing ? "同步中..." : "同步歌单"}
          action={() => {
            void syncPlaylists()
          }}
          buttonStyle="bordered"
        />
      </Section>

      <Section title="搜索">
        <TextField
          title=""
          prompt="搜索歌单（歌单名）"
          value={query}
          onChanged={setQuery}
        />
      </Section>

      <Section title={`歌单列表（${displayPlaylists.length}）`}>
        {displayPlaylists.length === 0 ? (
          <Text foregroundStyle="secondaryLabel">
            {playlists.length === 0 ? "暂无歌单，请先同步歌单" : "没有匹配的歌单"}
          </Text>
        ) : (
          displayPlaylists.map((playlist) => (
            <NavigationLink
              key={`playlist-catalog-${playlist.id}`}
              destination={
                <PlaylistSongsPage
                  playlist={playlist}
                  config={config}
                  onPlayPlaylistQueue={onPlayPlaylistQueue}
                  onQueueSingleSong={onQueueSingleSong}
                />
              }
            >
              <HStack alignment="center" spacing={10}>
                <ZStack frame={{ width: 32, height: 32 }}>
                  <Circle fill="rgba(54,113,199,0.18)" />
                  <Image systemName="music.note.list" font={13} foregroundStyle="systemBlue" />
                </ZStack>
                <VStack alignment="leading" spacing={2} frame={{ maxWidth: "infinity" }}>
                  <Text lineLimit={1}>{playlist.name}</Text>
                  <Text lineLimit={1} font="caption" foregroundStyle="secondaryLabel">
                    {playlist.songCount > 0 ? `${playlist.songCount} 首` : "0 首"}
                  </Text>
                </VStack>
                <Image systemName="chevron.right" font={12} foregroundStyle="tertiaryLabel" />
              </HStack>
            </NavigationLink>
          ))
        )}
      </Section>
    </List>
  )
}

function MusicDirectoryPage({
  config,
  directoryId,
  fallbackTitle,
  onPlayDirectoryQueue,
  onQueueSingleSong
}: {
  config: NavidromeConfig
  directoryId: string
  fallbackTitle: string
  onPlayDirectoryQueue: (directoryName: string, songs: NavidromeSong[], startIndex: number) => Promise<void>
  onQueueSingleSong: (song: NavidromeSong, mode: "next" | "tail") => Promise<void>
}) {
  const [title, setTitle] = useState(fallbackTitle)
  const [folders, setFolders] = useState<NavidromeFolder[]>([])
  const [songs, setSongs] = useState<NavidromeSong[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("正在加载目录...")

  async function loadDirectory(): Promise<void> {
    if (!isConfigReady(config)) {
      setMessage("请先配置服务器信息")
      return
    }

    setLoading(true)
    setMessage("正在加载目录...")
    try {
      const data = await requestSubsonic(config, "getMusicDirectory", {
        id: directoryId
      })
      const directory = isRecord(data.directory) ? data.directory : {}
      const directoryName = String(directory.name ?? directory.title ?? fallbackTitle ?? "文件夹")
      const parsed = normalizeMusicDirectoryChildren(directory.child)
      setTitle(directoryName)
      setFolders(parsed.folders)
      setSongs(parsed.songs)
      setMessage(`共 ${parsed.folders.length} 个子文件夹，${parsed.songs.length} 首歌曲`)
    } catch (error) {
      setMessage(`加载失败：${getErrorMessage(error)}`)
      setFolders([])
      setSongs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadDirectory()
  }, [directoryId, config.serverUrl, config.username, config.password])

  return (
    <List navigationTitle={title} navigationBarTitleDisplayMode="inline">
      <Section title="目录信息">
        <Text lineLimit={1}>{title}</Text>
        <Button
          title={loading ? "刷新中..." : "刷新目录"}
          action={() => {
            void loadDirectory()
          }}
          buttonStyle="bordered"
        />
        <Text font="caption" foregroundStyle="secondaryLabel">
          {message}
        </Text>
      </Section>

      <Section title="子文件夹">
        {folders.length === 0 ? (
          <Text foregroundStyle="secondaryLabel">
            {loading ? "正在加载..." : "无子文件夹"}
          </Text>
        ) : (
          folders.map((folder) => (
            <NavigationLink
              key={`folder-${directoryId}-${folder.id}`}
              destination={
                <MusicDirectoryPage
                  config={config}
                  directoryId={folder.id}
                  fallbackTitle={folder.name}
                  onPlayDirectoryQueue={onPlayDirectoryQueue}
                  onQueueSingleSong={onQueueSingleSong}
                />
              }
            >
              <HStack alignment="center" spacing={10}>
                <Image systemName="folder.fill" font={14} foregroundStyle="systemBlue" />
                <Text lineLimit={1}>{folder.name}</Text>
                <Spacer />
                <Image systemName="chevron.right" font={12} foregroundStyle="tertiaryLabel" />
              </HStack>
            </NavigationLink>
          ))
        )}
      </Section>

      <Section title="歌曲">
        {songs.length === 0 ? (
          <Text foregroundStyle="secondaryLabel">
            {loading ? "正在加载..." : "该目录暂无歌曲"}
          </Text>
        ) : (
          songs.map((song, index) => (
            <HStack
              key={`folder-song-${directoryId}-${song.id}-${index}`}
              alignment="center"
              spacing={8}
              frame={{ maxWidth: "infinity", alignment: "leading" }}
              contentShape="rect"
              onTapGesture={() => {
                void onPlayDirectoryQueue(title, songs, index)
              }}
            >
              <VStack alignment="leading" spacing={2} frame={{ maxWidth: "infinity", alignment: "leading" }}>
                <Text lineLimit={1}>{song.title}</Text>
                <Text lineLimit={1} font="caption" foregroundStyle="secondaryLabel">
                  {song.artist} · {song.album}
                </Text>
              </VStack>
              <Text font="caption" foregroundStyle="secondaryLabel">
                {formatDuration(song.duration)}
              </Text>
              <Button
                title=""
                systemImage="ellipsis"
                action={() => {
                  void presentSongQueueActions({
                    song,
                    onSelect: (mode) => {
                      if (mode === "replace") {
                        void onPlayDirectoryQueue(title, songs, index)
                      } else {
                        void onQueueSingleSong(song, mode)
                      }
                    }
                  })
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

function MusicFoldersPage({
  config,
  onPlayDirectoryQueue,
  onQueueSingleSong
}: {
  config: NavidromeConfig
  onPlayDirectoryQueue: (directoryName: string, songs: NavidromeSong[], startIndex: number) => Promise<void>
  onQueueSingleSong: (song: NavidromeSong, mode: "next" | "tail") => Promise<void>
}) {
  const [folders, setFolders] = useState<NavidromeFolder[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("正在加载文件夹...")

  async function loadRootFolders(): Promise<void> {
    if (!isConfigReady(config)) {
      setMessage("请先配置服务器信息")
      return
    }

    setLoading(true)
    setMessage("正在加载文件夹...")
    try {
      const data = await requestSubsonic(config, "getMusicFolders")
      const roots = normalizeFolders(data.musicFolders?.musicFolder)
      setFolders(roots)
      setMessage(roots.length > 0 ? `共 ${roots.length} 个根目录` : "服务器没有返回目录")
    } catch (error) {
      setFolders([])
      setMessage(`加载失败：${getErrorMessage(error)}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadRootFolders()
  }, [config.serverUrl, config.username, config.password])

  return (
    <List navigationTitle="文件夹" navigationBarTitleDisplayMode="inline">
      <Section title="目录源">
        <Button
          title={loading ? "刷新中..." : "刷新文件夹"}
          action={() => {
            void loadRootFolders()
          }}
          buttonStyle="bordered"
        />
        <Text font="caption" foregroundStyle="secondaryLabel">
          {message}
        </Text>
      </Section>

      <Section title="根目录">
        {folders.length === 0 ? (
          <Text foregroundStyle="secondaryLabel">
            {loading ? "正在加载..." : "暂无根目录"}
          </Text>
        ) : (
          folders.map((folder) => (
            <NavigationLink
              key={`root-folder-${folder.id}`}
              destination={
                <MusicDirectoryPage
                  config={config}
                  directoryId={folder.id}
                  fallbackTitle={folder.name}
                  onPlayDirectoryQueue={onPlayDirectoryQueue}
                  onQueueSingleSong={onQueueSingleSong}
                />
              }
            >
              <HStack alignment="center" spacing={10}>
                <Image systemName="externaldrive.fill" font={14} foregroundStyle="systemBlue" />
                <Text lineLimit={1}>{folder.name}</Text>
                <Spacer />
                <Image systemName="chevron.right" font={12} foregroundStyle="tertiaryLabel" />
              </HStack>
            </NavigationLink>
          ))
        )}
      </Section>
    </List>
  )
}

function AllSongsCatalogPage({
  config,
  initialSongs,
  currentSongId,
  onSyncSongs,
  getLatestSongs,
  onPlaySong,
  onQueueSingleSong
}: {
  config: NavidromeConfig
  initialSongs: NavidromeSong[]
  currentSongId: string | null
  onSyncSongs: () => Promise<NavidromeSong[]>
  getLatestSongs: () => NavidromeSong[]
  onPlaySong: (songs: NavidromeSong[], startIndex: number) => Promise<void>
  onQueueSingleSong: (song: NavidromeSong, mode: "next" | "tail") => Promise<void>
}) {
  const [songs, setSongs] = useState<NavidromeSong[]>(() => initialSongs)
  const [query, setQuery] = useState("")
  const [syncing, setSyncing] = useState(false)
  const [firstLoading, setFirstLoading] = useState(initialSongs.length === 0)
  const mountedRef = useRef(true)
  const syncingRef = useRef(false)

  const displaySongs = useMemo(() => {
    const source = songs.map((song, index) => ({ song, index }))
    const normalized = query.trim().toLowerCase()
    if (!normalized) return source
    return source.filter(({ song }) =>
      `${song.title} ${song.artist} ${song.album}`.toLowerCase().includes(normalized)
    )
  }, [songs, query])

  async function syncSongs(): Promise<void> {
    if (syncingRef.current) return
    syncingRef.current = true
    if (songs.length === 0 && mountedRef.current) {
      setFirstLoading(true)
    }
    if (mountedRef.current) {
      setSyncing(true)
    }

    try {
      const latestBeforeSync = getLatestSongs()
      if (mountedRef.current) {
        setSongs(latestBeforeSync)
        if (latestBeforeSync.length > 0) {
          setFirstLoading(false)
        }
      }

      const syncedSongs = await onSyncSongs()
      if (!mountedRef.current) return
      const latestSongs = syncedSongs.length > 0 ? syncedSongs : getLatestSongs()
      setSongs(latestSongs)
      if (latestSongs.length > 0) {
        setFirstLoading(false)
      }
    } finally {
      syncingRef.current = false
      if (mountedRef.current) {
        setSyncing(false)
        setFirstLoading(false)
      }
    }
  }

  useEffect(() => {
    if (initialSongs.length > 0) return
    void syncSongs()
  }, [])

  useEffect(() => {
    return () => {
      mountedRef.current = false
      syncingRef.current = false
    }
  }, [])

  return (
    <List>
      <Section>
        <HStack alignment="center" spacing={8} frame={{ maxWidth: "infinity", alignment: "leading" }}>
          <Text font={{ name: "system-bold", size: 18 }} lineLimit={1}>
            全部歌曲（{songs.length}首）
          </Text>
          <Spacer />
          <Button
            title={syncing ? "同步中..." : "同步歌曲"}
            action={() => {
              void syncSongs()
            }}
            buttonStyle="bordered"
          />
        </HStack>
      </Section>

      <Section title="搜索">
        <TextField
          title=""
          prompt="搜索歌曲（歌名/歌手/专辑）"
          value={query}
          onChanged={setQuery}
        />
      </Section>

      <Section title={`歌曲列表（${displaySongs.length}）`}>
        {firstLoading && songs.length === 0 ? (
          <VStack spacing={8} alignment="leading">
            <ProgressView title="正在加载全部歌曲..." progressViewStyle="linear" />
            <Text font="caption" foregroundStyle="secondaryLabel">
              首次进入会自动同步，通常需要 2-5 秒
            </Text>
          </VStack>
        ) : displaySongs.length === 0 ? (
          <Text foregroundStyle="secondaryLabel">
            {songs.length === 0 ? "暂无歌曲，请先同步歌曲" : "没有匹配的歌曲"}
          </Text>
        ) : (
          displaySongs.map(({ song, index }) => (
            <HStack
              key={`all-song-${song.id}-${index}`}
              alignment="center"
              spacing={8}
              frame={{ maxWidth: "infinity", alignment: "leading" }}
              contentShape="rect"
              onTapGesture={() => {
                void onPlaySong(songs, index)
              }}
            >
              <SongSquareCover
                song={song}
                config={config}
                size={38}
                deferMs={index < 20 ? 0 : Math.min(1800, (index - 20) * 30)}
              />
              <VStack alignment="leading" spacing={2} frame={{ maxWidth: "infinity", alignment: "leading" }}>
                <Text lineLimit={1}>{song.title}</Text>
                <Text lineLimit={1} font="caption" foregroundStyle="secondaryLabel">
                  {song.artist} · {song.album}
                </Text>
              </VStack>
              {currentSongId === song.id ? (
                <Image systemName="speaker.wave.2.fill" font={14} foregroundStyle="systemGreen" />
              ) : null}
              <Text font="caption" foregroundStyle="secondaryLabel">
                {formatDuration(song.duration)}
              </Text>
              <Button
                title=""
                systemImage="ellipsis"
                action={() => {
                  void presentSongQueueActions({
                    song,
                    onSelect: (mode) => {
                      if (mode === "replace") {
                        void onPlaySong(songs, index)
                      } else {
                        void onQueueSingleSong(song, mode)
                      }
                    }
                  })
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

function LikedSongsCatalogPage({
  initialSongs,
  currentSongId,
  onRefreshFavorites,
  getLatestSongs,
  onPlaySong,
  onQueueSingleSong
}: {
  initialSongs: NavidromeSong[]
  currentSongId: string | null
  onRefreshFavorites: () => Promise<void>
  getLatestSongs: () => NavidromeSong[]
  onPlaySong: (songs: NavidromeSong[], startIndex: number) => Promise<void>
  onQueueSingleSong: (song: NavidromeSong, mode: "next" | "tail") => Promise<void>
}) {
  const [songs, setSongs] = useState<NavidromeSong[]>(() => initialSongs)
  const [query, setQuery] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  const displaySongs = useMemo(() => {
    const source = songs.map((song, index) => ({ song, index }))
    const normalized = query.trim().toLowerCase()
    if (!normalized) return source
    return source.filter(({ song }) =>
      `${song.title} ${song.artist} ${song.album}`.toLowerCase().includes(normalized)
    )
  }, [songs, query])

  async function refreshFavorites(): Promise<void> {
    if (refreshing) return
    setRefreshing(true)
    try {
      await onRefreshFavorites()
      setSongs(getLatestSongs())
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (initialSongs.length > 0) return
    void refreshFavorites()
  }, [])

  return (
    <List navigationTitle="我喜欢的" navigationBarTitleDisplayMode="inline">
      <Section title="收藏列表">
        <Text>{songs.length} 首已收藏歌曲</Text>
        <Button
          title={refreshing ? "刷新中..." : "刷新收藏"}
          action={() => {
            void refreshFavorites()
          }}
          buttonStyle="bordered"
        />
      </Section>

      <Section title="搜索">
        <TextField
          title=""
          prompt="搜索收藏（歌名/歌手/专辑）"
          value={query}
          onChanged={setQuery}
        />
      </Section>

      <Section title={`歌曲列表（${displaySongs.length}）`}>
        {displaySongs.length === 0 ? (
          <Text foregroundStyle="secondaryLabel">
            {songs.length === 0 ? "暂无收藏歌曲，播放页点击心形可收藏" : "没有匹配的歌曲"}
          </Text>
        ) : (
          displaySongs.map(({ song, index }) => (
            <HStack
              key={`liked-song-${song.id}-${index}`}
              alignment="center"
              spacing={8}
              frame={{ maxWidth: "infinity", alignment: "leading" }}
              contentShape="rect"
              onTapGesture={() => {
                void onPlaySong(songs, index)
              }}
            >
              <VStack alignment="leading" spacing={2} frame={{ maxWidth: "infinity", alignment: "leading" }}>
                <Text lineLimit={1}>{song.title}</Text>
                <Text lineLimit={1} font="caption" foregroundStyle="secondaryLabel">
                  {song.artist} · {song.album}
                </Text>
              </VStack>
              {currentSongId === song.id ? (
                <Image systemName="speaker.wave.2.fill" font={14} foregroundStyle="systemGreen" />
              ) : (
                <Image systemName="heart.fill" font={13} foregroundStyle="systemPink" />
              )}
              <Text font="caption" foregroundStyle="secondaryLabel">
                {formatDuration(song.duration)}
              </Text>
              <Button
                title=""
                systemImage="ellipsis"
                action={() => {
                  void presentSongQueueActions({
                    song,
                    onSelect: (mode) => {
                      if (mode === "replace") {
                        void onPlaySong(songs, index)
                      } else {
                        void onQueueSingleSong(song, mode)
                      }
                    }
                  })
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

function ArtistSongsPage({
  config,
  artistName,
  songs,
  onPlayArtistQueue,
  onQueueSingleSong
}: {
  config: NavidromeConfig
  artistName: string
  songs: NavidromeSong[]
  onPlayArtistQueue: (artistName: string, songs: NavidromeSong[], startIndex: number) => Promise<void>
  onQueueSingleSong: (song: NavidromeSong, mode: "next" | "tail") => Promise<void>
}) {
  return (
    <List navigationTitle={artistName} navigationBarTitleDisplayMode="inline">
      <Section title="歌手信息">
        <Text>{artistName}</Text>
        <Text font="caption" foregroundStyle="secondaryLabel">
          共 {songs.length} 首歌曲
        </Text>
      </Section>

      <Section title="歌曲列表">
        {songs.length === 0 ? (
          <Text foregroundStyle="secondaryLabel">暂无歌曲</Text>
        ) : (
          songs.map((song, index) => (
            <HStack
              key={`artist-song-${artistName}-${song.id}-${index}`}
              alignment="center"
              spacing={8}
              frame={{ maxWidth: "infinity", alignment: "leading" }}
              contentShape="rect"
              onTapGesture={() => {
                void onPlayArtistQueue(artistName, songs, index)
              }}
            >
              <SongSquareCover
                song={song}
                config={config}
                size={38}
                deferMs={index < 16 ? 0 : Math.min(1400, (index - 16) * 28)}
              />
              <VStack alignment="leading" spacing={2} frame={{ maxWidth: "infinity", alignment: "leading" }}>
                <Text lineLimit={1}>{song.title}</Text>
                <Text lineLimit={1} font="caption" foregroundStyle="secondaryLabel">
                  {song.album}
                </Text>
              </VStack>
              <Text font="caption" foregroundStyle="secondaryLabel">
                {formatDuration(song.duration)}
              </Text>
              <Button
                title=""
                systemImage="ellipsis"
                action={() => {
                  void presentSongQueueActions({
                    song,
                    onSelect: (mode) => {
                      if (mode === "replace") {
                        void onPlayArtistQueue(artistName, songs, index)
                      } else {
                        void onQueueSingleSong(song, mode)
                      }
                    }
                  })
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

function ArtistCatalogPage({
  initialSongs,
  onSyncSongs,
  getLatestSongs,
  onOpenArtist
}: {
  initialSongs: NavidromeSong[]
  onSyncSongs: () => Promise<NavidromeSong[]>
  getLatestSongs: () => NavidromeSong[]
  onOpenArtist: (artistName: string, songs: NavidromeSong[]) => void
}) {
  const [songs, setSongs] = useState<NavidromeSong[]>(() => initialSongs)
  const [syncing, setSyncing] = useState(false)

  const groupedArtists = useMemo(() => buildArtistCatalog(songs), [songs])
  const artistCount = useMemo(
    () => groupedArtists.reduce((sum, group) => sum + group.artists.length, 0),
    [groupedArtists]
  )

  async function syncSongs(): Promise<void> {
    if (syncing) return
    setSyncing(true)
    try {
      const syncedSongs = await onSyncSongs()
      setSongs(syncedSongs.length > 0 ? syncedSongs : getLatestSongs())
    } finally {
      setSyncing(false)
    }
  }

  return (
    <List navigationTitle="歌手" navigationBarTitleDisplayMode="inline">
      <Section title="歌手库">
        <Text>{artistCount} 位歌手 · {songs.length} 首歌曲</Text>
        <Button
          title={syncing ? "同步中..." : "同步歌曲"}
          action={() => {
            void syncSongs()
          }}
          buttonStyle="bordered"
        />
      </Section>

      {groupedArtists.length === 0 ? (
        <Section title="列表">
          <Text foregroundStyle="secondaryLabel">暂无歌手数据，请先同步歌曲</Text>
        </Section>
      ) : (
        groupedArtists.map((group) => (
          <Section key={`artist-group-${group.initial}`} title={group.initial}>
            {group.artists.map((artist) => (
              <Button
                key={`artist-item-${artist.initial}-${artist.name}`}
                action={() => {
                  onOpenArtist(artist.name, artist.songs)
                }}
                buttonStyle="plain"
                frame={{ maxWidth: "infinity", alignment: "leading" }}
              >
                <HStack alignment="center" spacing={10} frame={{ maxWidth: "infinity", alignment: "leading" }}>
                  <ZStack frame={{ width: 36, height: 36 }}>
                    <Circle fill="rgba(54,113,199,0.18)" />
                    <Text font={{ name: "system-bold", size: 14 }} foregroundStyle="systemBlue">
                      {artist.initial}
                    </Text>
                  </ZStack>
                  <VStack alignment="leading" spacing={2} frame={{ maxWidth: "infinity", alignment: "leading" }}>
                    <Text lineLimit={1}>{artist.name}</Text>
                    <Text lineLimit={1} font="caption" foregroundStyle="secondaryLabel">
                      {artist.songs.length} 首
                    </Text>
                  </VStack>
                  <Image systemName="chevron.right" font={12} foregroundStyle="tertiaryLabel" />
                </HStack>
              </Button>
            ))}
          </Section>
        ))
      )}
    </List>
  )
}

function NavidromeSettingsPage({
  config,
  connectionState,
  connectionMessage,
  loadingSongs,
  onSave,
  onTestConnection,
  onSyncSongs
}: {
  config: NavidromeConfig
  connectionState: ConnectionState
  connectionMessage: string
  loadingSongs: boolean
  onSave: (nextConfig: NavidromeConfig) => void
  onTestConnection: (nextConfig: NavidromeConfig) => Promise<ConnectionFeedback>
  onSyncSongs: (nextConfig: NavidromeConfig) => Promise<NavidromeSong[]>
}) {
  const dismiss = Navigation.useDismiss()
  const [draft, setDraft] = useState<NavidromeConfig>(() => config)
  const [localConnectionState, setLocalConnectionState] = useState<ConnectionState>(connectionState)
  const [localConnectionMessage, setLocalConnectionMessage] = useState(connectionMessage)
  const [testingConnection, setTestingConnection] = useState(false)
  const [syncingSongs, setSyncingSongs] = useState(false)

  useEffect(() => {
    setDraft(config)
  }, [
    config.serverUrl,
    config.username,
    config.password,
    config.lyricsApiUrl,
    config.cacheWhilePlaying,
    config.cacheLimitMB
  ])

  useEffect(() => {
    setLocalConnectionState(connectionState)
    setLocalConnectionMessage(connectionMessage)
  }, [connectionState, connectionMessage])

  useEffect(() => {
    if (!loadingSongs) {
      setSyncingSongs(false)
    }
  }, [loadingSongs])

  const syncProgressMatch = localConnectionMessage.match(/(\d{1,3})%/)
  const syncProgress = syncProgressMatch
    ? Math.max(0, Math.min(100, Number(syncProgressMatch[1])))
    : null

  const commit = (): NavidromeConfig => {
    const next = sanitizeConfig(draft)
    setDraft(next)
    onSave(next)
    return next
  }

  return (
    <List
      navigationTitle="设置"
      navigationBarTitleDisplayMode="inline"
      toolbar={{
        cancellationAction: <Button title="关闭" action={() => {
          commit()
          dismiss()
        }} />,
        topBarTrailing: (
          <Button
            title="保存"
            action={() => {
              commit()
              dismiss()
            }}
            buttonStyle="borderedProminent"
          />
        )
      }}
    >
      <Section title="连接信息">
        <TextField
          title="服务器地址"
          prompt="https://music.example.com"
          value={draft.serverUrl}
          onChanged={(value) => {
            setDraft((previous) => ({
              ...previous,
              serverUrl: value
            }))
          }}
        />
        <TextField
          title="用户名"
          value={draft.username}
          onChanged={(value) => {
            setDraft((previous) => ({
              ...previous,
              username: value
            }))
          }}
        />
        <SecureField
          title="密码"
          value={draft.password}
          onChanged={(value) => {
            setDraft((previous) => ({
              ...previous,
              password: value
            }))
          }}
        />
      </Section>

      <Section title="歌词设置">
        <TextField
          title="歌词 API"
          prompt="https://api.lrc.cx/lyrics"
          value={draft.lyricsApiUrl}
          onChanged={(value) => {
            setDraft((previous) => ({
              ...previous,
              lyricsApiUrl: value
            }))
          }}
        />
        <Text font="caption2" foregroundStyle="tertiaryLabel">
          示例：`https://api.lrc.cx/lyrics` 或 `...?title={"{title}"}&artist={"{artist}"}`
        </Text>
      </Section>

      <Section title="离线缓存">
        <Toggle
          title="边听边存"
          value={draft.cacheWhilePlaying}
          onChanged={(value) => {
            setDraft((previous) => ({
              ...previous,
              cacheWhilePlaying: value
            }))
          }}
        />
        <TextField
          title="缓存上限 (MB)"
          prompt="例如 512"
          value={String(draft.cacheLimitMB)}
          onChanged={(value) => {
            const parsed = Number(value.replace(/[^\d]/g, ""))
            setDraft((previous) => ({
              ...previous,
              cacheLimitMB: Number.isFinite(parsed) ? parsed : 0
            }))
          }}
        />
        <Text font="caption2" foregroundStyle="tertiaryLabel">
          开启后会缓存播放过的歌曲到本地，超出上限时会优先删除较早播放的缓存。
        </Text>
      </Section>

      <Section title="同步与测试">
        <HStack spacing={10}>
          <Button
            title={testingConnection ? "测试中..." : "保存并测试"}
            action={() => {
              const next = commit()
              setTestingConnection(true)
              setLocalConnectionState("loading")
              setLocalConnectionMessage("连接测试中...")
              void onTestConnection(next)
                .then((feedback) => {
                  setLocalConnectionState(feedback.state)
                  setLocalConnectionMessage(feedback.message)
                })
                .catch((error) => {
                  setLocalConnectionState("error")
                  setLocalConnectionMessage(`连接失败：${getErrorMessage(error)}`)
                })
                .finally(() => {
                  setTestingConnection(false)
                })
            }}
            buttonStyle="borderedProminent"
          />
          <Button
            title={syncingSongs || loadingSongs ? "同步歌曲中" : "同步歌曲"}
            action={() => {
              if (syncingSongs || loadingSongs) return
              const next = commit()
              setSyncingSongs(true)
              setLocalConnectionState("loading")
              setLocalConnectionMessage("同步歌曲中...")
              void onSyncSongs(next)
                .catch((error) => {
                  setLocalConnectionState("error")
                  setLocalConnectionMessage(`同步失败：${getErrorMessage(error)}`)
                })
                .finally(() => {
                  setSyncingSongs(false)
                })
            }}
            buttonStyle="bordered"
          />
        </HStack>
        {syncingSongs || loadingSongs ? (
          syncProgress == null ? (
            <ProgressView
              title="同步歌曲中"
              progressViewStyle="linear"
            />
          ) : (
            <ProgressView
              value={syncProgress}
              total={100}
              title={`同步歌曲中 ${syncProgress}%`}
              progressViewStyle="linear"
            />
          )
        ) : null}
        <Text font="caption" foregroundStyle={connectionColor(localConnectionState)}>
          {localConnectionMessage}
        </Text>
      </Section>
    </List>
  )
}

export {
  PlaylistSongsPage,
  PlaylistsCatalogPage,
  MusicDirectoryPage,
  MusicFoldersPage,
  AllSongsCatalogPage,
  LikedSongsCatalogPage,
  ArtistSongsPage,
  ArtistCatalogPage,
  NavidromeSettingsPage
}
