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
  RoundedRectangle,
  Script,
  ScrollView,
  Section,
  SecureField,
  Slider,
  Spacer,
  Text,
  TextField,
  VStack,
  ZStack,
  fetch,
  useEffect,
  useMemo,
  useRef,
  useState
} from "scripting"

type NavidromeConfig = {
  serverUrl: string
  username: string
  password: string
  lyricsApiUrl: string
  cacheWhilePlaying: boolean
  cacheLimitMB: number
}

type NavidromeSong = {
  id: string
  title: string
  artist: string
  album: string
  duration: number
  coverArt: string | null
}

type NavidromeAlbum = {
  id: string
  name: string
  artist: string
  songCount: number
  year: number | null
  coverArt: string | null
}

type NavidromePlaylist = {
  id: string
  name: string
  songCount: number
  duration: number
  coverArt: string | null
}

type NavidromeFolder = {
  id: string
  name: string
}

type ConnectionState = "idle" | "loading" | "ok" | "error"
type PlaybackState = "idle" | "loading" | "playing" | "paused" | "error"
type ConnectionFeedback = {
  state: ConnectionState
  message: string
}

type AllSongsAlbumCacheEntry = {
  fingerprint: string
  songs: NavidromeSong[]
}

type AllSongsCacheData = {
  songs: NavidromeSong[]
  albumMap: Map<string, AllSongsAlbumCacheEntry>
}

type PlaybackSnapshot = {
  scope: string
  songId: string
  positionSec: number
  durationSec: number
  updatedAt: number
}

type ArtistCatalogItem = {
  name: string
  initial: string
  songs: NavidromeSong[]
}

type TimedLyricLine = {
  time: number
  text: string
}

type LikedSongsSnapshot = {
  scope: string
  updatedAt: number
  songs: NavidromeSong[]
}

const CONFIG_KEY = "navidrome_player_config_v1"
const CONFIG_KEY_SHARED = "navidrome_player_config_shared_v1"
const CONFIG_PASSWORD_KEY = "navidrome_player_password_v1"
const PLAYBACK_SNAPSHOT_KEY = "navidrome_player_playback_snapshot_v1"
const PLAYBACK_SNAPSHOT_KEY_SHARED = "navidrome_player_playback_snapshot_shared_v1"
const LIKED_SONGS_KEY = "navidrome_player_liked_songs_v1"
const LIKED_SONGS_KEY_SHARED = "navidrome_player_liked_songs_shared_v1"
const CLIENT_NAME = "ScriptingNavidromePlayer"
const API_VERSION = "1.16.1"
const RESPONSE_FORMAT = "json"

const ALL_SONGS_ALBUM_PAGE_SIZE = 120
const ALL_SONGS_ALBUM_BATCH_SIZE = 6
const ALL_SONGS_CACHE_VERSION = 2
const ALL_SONGS_CACHE_DIR = `${FileManager.documentsDirectory}/navidrome_player_cache`
const MAX_QUEUE_SONGS = 400
const MAX_COVER_CACHE_ENTRIES = 90
const MAX_LIST_COVER_CACHE_ENTRIES = 220
const MAX_LIST_COVER_FETCH_CONCURRENCY = 6
const MAX_LYRICS_TEXT_LENGTH = 14000
const MAX_ALL_SONGS_CACHE_FILES = 6
const MAX_ALL_SONGS_CACHE_BYTES = 90 * 1024 * 1024

const DEFAULT_CONFIG: NavidromeConfig = {
  serverUrl: "",
  username: "",
  password: "",
  lyricsApiUrl: "",
  cacheWhilePlaying: false,
  cacheLimitMB: 512
}

function normalizeServerUrl(url: string): string {
  return url.trim().replace(/\/+$/, "")
}

function sanitizeConfig(config: NavidromeConfig): NavidromeConfig {
  const cacheLimitRaw = Number(config.cacheLimitMB)
  const cacheLimitMB = Number.isFinite(cacheLimitRaw)
    ? Math.max(128, Math.min(8192, Math.round(cacheLimitRaw)))
    : DEFAULT_CONFIG.cacheLimitMB

  return {
    serverUrl: normalizeServerUrl(config.serverUrl),
    username: config.username.trim(),
    password: config.password,
    lyricsApiUrl: config.lyricsApiUrl.trim(),
    cacheWhilePlaying: Boolean(config.cacheWhilePlaying),
    cacheLimitMB
  }
}

function isConfigReady(config: NavidromeConfig): boolean {
  return config.serverUrl.length > 0 && config.username.length > 0 && config.password.length > 0
}

function generateSalt(length = 8): string {
  const raw = `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`
  return raw.slice(0, length)
}

function buildAuthParams(config: NavidromeConfig): Record<string, string> {
  const salt = generateSalt()
  const hashData = Data.fromRawString(`${config.password}${salt}`)
  const token = hashData ? Crypto.md5(hashData).toHexString() : ""
  return {
    u: config.username,
    t: token,
    s: salt,
    v: API_VERSION,
    c: CLIENT_NAME,
    f: RESPONSE_FORMAT
  }
}

function toQueryString(params: Record<string, string | number | null | undefined>): string {
  return Object.entries(params)
    .filter(([, value]) => value !== null && value !== undefined && `${value}`.length > 0)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join("&")
}

function buildSubsonicUrl(
  config: NavidromeConfig,
  endpoint: string,
  params: Record<string, string | number | null | undefined> = {}
): string {
  const query = toQueryString({
    ...buildAuthParams(config),
    ...params
  })
  return `${config.serverUrl}/rest/${endpoint}.view?${query}`
}

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null
}

function toSongArray(value: unknown): Record<string, any>[] {
  if (Array.isArray(value)) {
    return value.filter((item) => isRecord(item))
  }
  if (isRecord(value)) {
    return [value]
  }
  return []
}

function toAlbumArray(value: unknown): Record<string, any>[] {
  if (Array.isArray(value)) {
    return value.filter((item) => isRecord(item))
  }
  if (isRecord(value)) {
    return [value]
  }
  return []
}

function normalizeSongs(value: unknown): NavidromeSong[] {
  const rows = toSongArray(value)
  return rows
    .map((row) => {
      const id = String(row.id ?? "")
      if (!id) return null
      return {
        id,
        title: String(row.title ?? "未知标题"),
        artist: String(row.artist ?? "未知艺术家"),
        album: String(row.album ?? "未知专辑"),
        duration: Number.isFinite(Number(row.duration)) ? Number(row.duration) : 0,
        coverArt: row.coverArt ? String(row.coverArt) : null
      }
    })
    .filter((song): song is NavidromeSong => song !== null)
}

function normalizeAlbums(value: unknown): NavidromeAlbum[] {
  const rows = toAlbumArray(value)
  return rows
    .map((row) => {
      const id = String(row.id ?? "")
      if (!id) return null
      const yearValue = Number(row.year)
      return {
        id,
        name: String(row.name ?? row.title ?? "未知专辑"),
        artist: String(row.artist ?? "未知艺术家"),
        songCount: Number.isFinite(Number(row.songCount)) ? Number(row.songCount) : 0,
        year: Number.isFinite(yearValue) ? yearValue : null,
        coverArt: row.coverArt ? String(row.coverArt) : null
      }
    })
    .filter((album): album is NavidromeAlbum => album !== null)
}

function normalizePlaylists(value: unknown): NavidromePlaylist[] {
  const rows = toAlbumArray(value)
  return rows
    .map((row) => {
      const id = String(row.id ?? "")
      if (!id) return null
      const songCount = Number(row.songCount)
      const duration = Number(row.duration)
      return {
        id,
        name: String(row.name ?? row.title ?? "未命名歌单"),
        songCount: Number.isFinite(songCount) ? songCount : 0,
        duration: Number.isFinite(duration) ? duration : 0,
        coverArt: row.coverArt ? String(row.coverArt) : null
      }
    })
    .filter((playlist): playlist is NavidromePlaylist => playlist !== null)
}

function isTruthyFlag(value: unknown): boolean {
  if (typeof value === "boolean") return value
  if (typeof value === "number") return value !== 0
  const normalized = String(value ?? "").trim().toLowerCase()
  return normalized === "true" || normalized === "1" || normalized === "yes"
}

function normalizeFolders(value: unknown): NavidromeFolder[] {
  const rows = toAlbumArray(value)
  return rows
    .map((row) => {
      const id = String(row.id ?? "").trim()
      if (!id) return null
      const name = String(row.name ?? row.title ?? "未命名文件夹").trim() || "未命名文件夹"
      return {
        id,
        name
      }
    })
    .filter((folder): folder is NavidromeFolder => folder !== null)
}

function normalizeMusicDirectoryChildren(value: unknown): {
  folders: NavidromeFolder[]
  songs: NavidromeSong[]
} {
  const rows = toSongArray(value)
  const folderRows: Record<string, any>[] = []
  const songRows: Record<string, any>[] = []

  for (const row of rows) {
    if (isTruthyFlag(row.isDir)) {
      folderRows.push(row)
    } else {
      songRows.push(row)
    }
  }

  const folders = normalizeFolders(folderRows)
  const songs = normalizeSongs(songRows)
  return {
    folders,
    songs
  }
}

function buildAlbumFingerprint(album: NavidromeAlbum): string {
  return [
    album.name.trim().toLowerCase(),
    album.artist.trim().toLowerCase(),
    String(album.songCount),
    album.year == null ? "" : String(album.year),
    album.coverArt ?? ""
  ].join("|")
}

function allSongsCacheScope(config: NavidromeConfig): string {
  return `${normalizeServerUrl(config.serverUrl)}|${config.username.trim().toLowerCase()}`
}

function allSongsCacheFilePath(config: NavidromeConfig): string {
  const scope = allSongsCacheScope(config)
  const scopeData = Data.fromRawString(scope)
  const scopeHash = scopeData ? Crypto.md5(scopeData).toHexString() : "default"
  return `${ALL_SONGS_CACHE_DIR}/all_songs_${scopeHash}.json`
}

function resolveAllSongsCacheEntryPath(entry: string): string {
  if (entry.startsWith("/")) return entry
  return `${ALL_SONGS_CACHE_DIR}/${entry}`
}

function isSameSong(left: NavidromeSong, right: NavidromeSong): boolean {
  return (
    left.id === right.id &&
    left.title === right.title &&
    left.artist === right.artist &&
    left.album === right.album &&
    left.duration === right.duration &&
    left.coverArt === right.coverArt
  )
}

function isSameSongList(left: NavidromeSong[], right: NavidromeSong[]): boolean {
  if (left.length !== right.length) return false
  for (let index = 0; index < left.length; index += 1) {
    if (!isSameSong(left[index], right[index])) {
      return false
    }
  }
  return true
}

function isEquivalentAllSongsCache(
  cached: AllSongsCacheData | null,
  songs: NavidromeSong[],
  albumMap: Map<string, AllSongsAlbumCacheEntry>
): boolean {
  if (!cached) return false
  if (!isSameSongList(cached.songs, songs)) return false
  if (cached.albumMap.size !== albumMap.size) return false

  for (const [albumId, nextEntry] of albumMap.entries()) {
    const previous = cached.albumMap.get(albumId)
    if (!previous) return false
    if (previous.fingerprint !== nextEntry.fingerprint) return false
    if (!isSameSongList(previous.songs, nextEntry.songs)) return false
  }

  return true
}

async function pruneAllSongsCacheFiles(activeFilePath: string): Promise<void> {
  try {
    const exists = await FileManager.exists(ALL_SONGS_CACHE_DIR)
    if (!exists) return

    const entries = await FileManager.readDirectory(ALL_SONGS_CACHE_DIR, false)
    const files: Array<{ path: string; size: number; modificationDate: number }> = []

    for (const entry of entries) {
      const normalized = entry.trim()
      const fileName = normalized.includes("/")
        ? normalized.slice(normalized.lastIndexOf("/") + 1)
        : normalized
      if (!fileName.startsWith("all_songs_") || !fileName.endsWith(".json")) continue
      const path = resolveAllSongsCacheEntryPath(normalized)
      try {
        const stat = await FileManager.stat(path)
        if (stat.type !== "file") continue
        files.push({
          path,
          size: Math.max(0, Number(stat.size) || 0),
          modificationDate: Number(stat.modificationDate) || 0
        })
      } catch {
        // Ignore broken files during pruning.
      }
    }

    if (files.length === 0) return

    const sorted = [...files].sort((left, right) => right.modificationDate - left.modificationDate)
    let totalBytes = sorted.reduce((sum, file) => sum + file.size, 0)
    let keepCount = sorted.length

    for (let index = sorted.length - 1; index >= 0; index -= 1) {
      const item = sorted[index]
      const overCount = keepCount > MAX_ALL_SONGS_CACHE_FILES
      const overBytes = totalBytes > MAX_ALL_SONGS_CACHE_BYTES
      if (!overCount && !overBytes) break
      if (item.path === activeFilePath) continue

      try {
        await FileManager.remove(item.path)
        totalBytes = Math.max(0, totalBytes - item.size)
        keepCount -= 1
      } catch {
        // Ignore deletion failures so sync flow keeps running.
      }
    }
  } catch {
    // Ignore prune failures to avoid blocking sync flow.
  }
}

async function readAllSongsCache(config: NavidromeConfig): Promise<AllSongsCacheData | null> {
  try {
    const raw = await FileManager.readAsString(allSongsCacheFilePath(config))
    if (!raw) return null
    const payload = JSON.parse(raw) as unknown
    if (!isRecord(payload)) return null
    const version = Number(payload.version)
    if (!Number.isFinite(version) || version < 1 || version > ALL_SONGS_CACHE_VERSION) return null

    const songs = normalizeSongs(payload.songs)
    if (version < 2) {
      return {
        songs,
        albumMap: new Map()
      }
    }

    const albumMap = new Map<string, AllSongsAlbumCacheEntry>()
    const rawAlbums = payload.albums
    if (isRecord(rawAlbums)) {
      for (const [albumId, value] of Object.entries(rawAlbums)) {
        if (!albumId || !isRecord(value)) continue
        const fingerprint = String(value.fingerprint ?? "")
        if (!fingerprint) continue

        const albumSongs = normalizeSongs(value.songs)
        albumMap.set(albumId, {
          fingerprint,
          songs: albumSongs
        })
      }
    }

    return {
      songs,
      albumMap
    }
  } catch {
    return null
  }
}

async function writeAllSongsCache(
  config: NavidromeConfig,
  songs: NavidromeSong[],
  albumMap: Map<string, AllSongsAlbumCacheEntry>
): Promise<void> {
  try {
    await FileManager.createDirectory(ALL_SONGS_CACHE_DIR, true)
    const albums: Record<string, { fingerprint: string; songs: NavidromeSong[] }> = {}
    for (const [albumId, entry] of albumMap.entries()) {
      albums[albumId] = {
        fingerprint: entry.fingerprint,
        songs: entry.songs
      }
    }

    const payload = {
      version: ALL_SONGS_CACHE_VERSION,
      savedAt: Date.now(),
      scope: allSongsCacheScope(config),
      songs,
      albums
    }
    await FileManager.writeAsString(
      allSongsCacheFilePath(config),
      JSON.stringify(payload)
    )
  } catch {
    // Ignore cache write errors to avoid blocking playback flow.
  }
}

function normalizePlaybackSnapshot(value: unknown): PlaybackSnapshot | null {
  if (!isRecord(value)) return null
  const scope = String(value.scope ?? "").trim()
  const songId = String(value.songId ?? "").trim()
  const positionSec = Number(value.positionSec)
  const durationSec = Number(value.durationSec)
  const updatedAt = Number(value.updatedAt)
  if (!scope || !songId) return null
  if (!Number.isFinite(positionSec) || positionSec < 0) return null
  if (!Number.isFinite(durationSec) || durationSec < 0) return null
  if (!Number.isFinite(updatedAt) || updatedAt <= 0) return null

  return {
    scope,
    songId,
    positionSec,
    durationSec,
    updatedAt
  }
}

function loadPlaybackSnapshot(): PlaybackSnapshot | null {
  const shared = normalizePlaybackSnapshot(
    Storage.get<PlaybackSnapshot>(PLAYBACK_SNAPSHOT_KEY_SHARED, { shared: true })
  )
  if (shared) return shared
  return normalizePlaybackSnapshot(Storage.get<PlaybackSnapshot>(PLAYBACK_SNAPSHOT_KEY))
}

function savePlaybackSnapshot(snapshot: PlaybackSnapshot): void {
  Storage.set(PLAYBACK_SNAPSHOT_KEY, snapshot)
  Storage.set(PLAYBACK_SNAPSHOT_KEY_SHARED, snapshot, { shared: true })
}

function normalizeLikedSongsSnapshot(value: unknown): LikedSongsSnapshot | null {
  if (!isRecord(value)) return null
  const scope = String(value.scope ?? "").trim()
  const updatedAt = Number(value.updatedAt)
  if (!scope) return null
  if (!Number.isFinite(updatedAt) || updatedAt <= 0) return null
  const songs = normalizeSongs(value.songs)
  return {
    scope,
    updatedAt,
    songs
  }
}

function loadLikedSongsSnapshot(scope: string): NavidromeSong[] {
  const shared = normalizeLikedSongsSnapshot(
    Storage.get<LikedSongsSnapshot>(LIKED_SONGS_KEY_SHARED, { shared: true })
  )
  if (shared && shared.scope === scope) {
    return shared.songs
  }

  const scoped = normalizeLikedSongsSnapshot(Storage.get<LikedSongsSnapshot>(LIKED_SONGS_KEY))
  if (scoped && scoped.scope === scope) {
    return scoped.songs
  }

  return []
}

function saveLikedSongsSnapshot(snapshot: LikedSongsSnapshot): void {
  Storage.set(LIKED_SONGS_KEY, snapshot)
  Storage.set(LIKED_SONGS_KEY_SHARED, snapshot, { shared: true })
}

const listCoverCache = new Map<string, UIImage | null>()
const listCoverInFlight = new Map<string, Promise<UIImage | null>>()
const listCoverWaitQueue: Array<() => void> = []
let listCoverActiveFetches = 0

function cacheListCoverImage(cacheKey: string, image: UIImage | null): void {
  if (listCoverCache.has(cacheKey)) {
    listCoverCache.delete(cacheKey)
  }
  listCoverCache.set(cacheKey, image)
  while (listCoverCache.size > MAX_LIST_COVER_CACHE_ENTRIES) {
    const oldestKey = listCoverCache.keys().next().value as string | undefined
    if (!oldestKey) break
    listCoverCache.delete(oldestKey)
  }
}

function acquireListCoverFetchSlot(): Promise<void> {
  if (listCoverActiveFetches < MAX_LIST_COVER_FETCH_CONCURRENCY) {
    listCoverActiveFetches += 1
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    listCoverWaitQueue.push(() => {
      listCoverActiveFetches += 1
      resolve()
    })
  })
}

function releaseListCoverFetchSlot(): void {
  listCoverActiveFetches = Math.max(0, listCoverActiveFetches - 1)
  const next = listCoverWaitQueue.shift()
  if (next) {
    next()
  }
}

function loadListCoverImage(cacheKey: string, url: string): Promise<UIImage | null> {
  if (listCoverCache.has(cacheKey)) {
    return Promise.resolve(listCoverCache.get(cacheKey) ?? null)
  }
  const inFlight = listCoverInFlight.get(cacheKey)
  if (inFlight) {
    return inFlight
  }

  const task = (async () => {
    await acquireListCoverFetchSlot()
    try {
      const loadedImage = await UIImage.fromURL(url)
      const normalized = loadedImage ?? null
      cacheListCoverImage(cacheKey, normalized)
      return normalized
    } catch {
      cacheListCoverImage(cacheKey, null)
      return null
    } finally {
      listCoverInFlight.delete(cacheKey)
      releaseListCoverFetchSlot()
    }
  })()

  listCoverInFlight.set(cacheKey, task)
  return task
}

function SongSquareCover({
  song,
  config,
  size = 40,
  deferMs = 0
}: {
  song: NavidromeSong
  config: NavidromeConfig
  size?: number
  deferMs?: number
}) {
  const cacheKey = useMemo(() => {
    if (!song.coverArt) return ""
    return `${allSongsCacheScope(config)}|${song.coverArt}|${size}`
  }, [config.serverUrl, config.username, song.coverArt, size])

  const [image, setImage] = useState<UIImage | null>(() => {
    if (!cacheKey) return null
    return listCoverCache.get(cacheKey) ?? null
  })

  useEffect(() => {
    if (!song.coverArt) {
      setImage(null)
      return
    }

    if (!cacheKey) {
      setImage(null)
      return
    }

    if (listCoverCache.has(cacheKey)) {
      const cached = listCoverCache.get(cacheKey) ?? null
      setImage(cached)
      return
    }

    let canceled = false
    const url = buildSubsonicUrl(config, "getCoverArt", {
      id: song.coverArt,
      size: Math.max(96, size * 3)
    })

    const task = () => {
      void loadListCoverImage(cacheKey, url)
        .then((loadedImage) => {
          if (canceled) return
          setImage(loadedImage ?? null)
        })
    }

    let timerId = 0
    if (deferMs > 0) {
      timerId = setTimeout(task, deferMs)
    } else {
      task()
    }

    return () => {
      canceled = true
      if (timerId > 0) clearTimeout(timerId)
    }
  }, [cacheKey, config.serverUrl, config.username, config.password, size, song.coverArt, deferMs])

  return (
    <ZStack frame={{ width: size, height: size }}>
      <RoundedRectangle
        cornerRadius={10}
        style="continuous"
        fill="rgba(255,255,255,0.16)"
      />
      {image ? (
        <Image
          image={image}
          resizable
          scaleToFill
          clipped
          frame={{ width: size, height: size }}
          clipShape={{ type: "rect", cornerRadius: 10, style: "continuous" }}
        />
      ) : (
        <Image systemName="music.note" font={14} foregroundStyle="rgba(255,255,255,0.82)" />
      )}
    </ZStack>
  )
}

const PINYIN_INITIAL_TABLE: Array<{ codePoint: number; initial: string }> = [
  { codePoint: "阿".codePointAt(0) ?? 0, initial: "A" },
  { codePoint: "芭".codePointAt(0) ?? 0, initial: "B" },
  { codePoint: "擦".codePointAt(0) ?? 0, initial: "C" },
  { codePoint: "搭".codePointAt(0) ?? 0, initial: "D" },
  { codePoint: "蛾".codePointAt(0) ?? 0, initial: "E" },
  { codePoint: "发".codePointAt(0) ?? 0, initial: "F" },
  { codePoint: "噶".codePointAt(0) ?? 0, initial: "G" },
  { codePoint: "哈".codePointAt(0) ?? 0, initial: "H" },
  { codePoint: "机".codePointAt(0) ?? 0, initial: "J" },
  { codePoint: "喀".codePointAt(0) ?? 0, initial: "K" },
  { codePoint: "垃".codePointAt(0) ?? 0, initial: "L" },
  { codePoint: "妈".codePointAt(0) ?? 0, initial: "M" },
  { codePoint: "拿".codePointAt(0) ?? 0, initial: "N" },
  { codePoint: "哦".codePointAt(0) ?? 0, initial: "O" },
  { codePoint: "啪".codePointAt(0) ?? 0, initial: "P" },
  { codePoint: "期".codePointAt(0) ?? 0, initial: "Q" },
  { codePoint: "然".codePointAt(0) ?? 0, initial: "R" },
  { codePoint: "撒".codePointAt(0) ?? 0, initial: "S" },
  { codePoint: "塌".codePointAt(0) ?? 0, initial: "T" },
  { codePoint: "挖".codePointAt(0) ?? 0, initial: "W" },
  { codePoint: "昔".codePointAt(0) ?? 0, initial: "X" },
  { codePoint: "压".codePointAt(0) ?? 0, initial: "Y" },
  { codePoint: "匝".codePointAt(0) ?? 0, initial: "Z" }
]

function normalizeArtistName(name: string): string {
  const normalized = name.trim()
  return normalized.length > 0 ? normalized : "未知歌手"
}

function getArtistInitialByPinyin(name: string): string {
  const first = normalizeArtistName(name).charAt(0)
  if (!first) return "#"
  if (/[A-Za-z]/.test(first)) return first.toUpperCase()
  if (/[0-9]/.test(first)) return "#"

  const codePoint = first.codePointAt(0)
  if (!codePoint) return "#"
  for (let index = PINYIN_INITIAL_TABLE.length - 1; index >= 0; index -= 1) {
    const entry = PINYIN_INITIAL_TABLE[index]
    if (codePoint >= entry.codePoint) {
      return entry.initial
    }
  }

  return "#"
}

function buildArtistCatalog(songs: NavidromeSong[]): Array<{
  initial: string
  artists: ArtistCatalogItem[]
}> {
  const artistMap = new Map<string, NavidromeSong[]>()
  for (const song of songs) {
    const artistName = normalizeArtistName(song.artist)
    const list = artistMap.get(artistName)
    if (list) {
      list.push(song)
    } else {
      artistMap.set(artistName, [song])
    }
  }

  const artists = Array.from(artistMap.entries()).map(([name, artistSongs]) => ({
    name,
    initial: getArtistInitialByPinyin(name),
    songs: artistSongs
  }))

  artists.sort((a, b) => {
    if (a.initial === b.initial) {
      return a.name.localeCompare(b.name, "zh-Hans-u-co-pinyin")
    }
    if (a.initial === "#") return 1
    if (b.initial === "#") return -1
    return a.initial.localeCompare(b.initial)
  })

  const grouped = new Map<string, ArtistCatalogItem[]>()
  for (const artist of artists) {
    const list = grouped.get(artist.initial)
    if (list) {
      list.push(artist)
    } else {
      grouped.set(artist.initial, [artist])
    }
  }

  return Array.from(grouped.entries())
    .sort(([left], [right]) => {
      if (left === right) return 0
      if (left === "#") return 1
      if (right === "#") return -1
      return left.localeCompare(right)
    })
    .map(([initial, items]) => ({
      initial,
      artists: items
    }))
}

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "--:--"
  const total = Math.floor(Math.max(0, seconds))
  const minutes = Math.floor(total / 60)
  const remain = total % 60
  return `${minutes}:${String(remain).padStart(2, "0")}`
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message
  }
  return "请求失败"
}

function buildLyricsRequestUrl(baseUrl: string, song: NavidromeSong): string {
  const normalized = baseUrl.trim()
  const songParams: Record<string, string | number> = {
    title: song.title,
    artist: song.artist,
    album: song.album,
    id: song.id,
    duration: song.duration
  }

  const hasTemplate = /\{(title|artist|album|id|duration)\}/.test(normalized)
  if (hasTemplate) {
    return normalized
      .replace(/\{title\}/g, encodeURIComponent(song.title))
      .replace(/\{artist\}/g, encodeURIComponent(song.artist))
      .replace(/\{album\}/g, encodeURIComponent(song.album))
      .replace(/\{id\}/g, encodeURIComponent(song.id))
      .replace(/\{duration\}/g, encodeURIComponent(String(song.duration)))
  }

  const query = toQueryString(songParams)
  if (!query) return normalized

  if (!normalized.includes("?")) {
    return `${normalized}?${query}`
  }
  if (normalized.endsWith("?") || normalized.endsWith("&")) {
    return `${normalized}${query}`
  }
  return `${normalized}&${query}`
}

function extractLyricsFromPayload(payload: unknown): string | null {
  if (typeof payload === "string") {
    const text = payload.trim()
    return text.length > 0 ? text : null
  }

  if (Array.isArray(payload)) {
    const texts = payload
      .map((item) => {
        if (typeof item === "string") return item
        if (isRecord(item)) {
          return String(item.lyrics ?? item.lrc ?? item.text ?? item.line ?? item.content ?? "")
        }
        return ""
      })
      .map((text) => text.trim())
      .filter((text) => text.length > 0)
    return texts.length > 0 ? texts.join("\n") : null
  }

  if (!isRecord(payload)) return null

  const directKeys = ["lyrics", "lyric", "lrc", "text", "content"]
  for (const key of directKeys) {
    if (key in payload) {
      const extracted = extractLyricsFromPayload(payload[key])
      if (extracted) return extracted
    }
  }

  const nestedKeys = ["data", "result", "response", "payload"]
  for (const key of nestedKeys) {
    if (key in payload) {
      const extracted = extractLyricsFromPayload(payload[key])
      if (extracted) return extracted
    }
  }

  return null
}

function parseLyricsResponseText(text: string): string | null {
  const raw = text.trim()
  if (!raw) return null

  try {
    const payload = JSON.parse(raw) as unknown
    const extracted = extractLyricsFromPayload(payload)
    if (extracted) return extracted
  } catch {
    // Fallback to raw text when response is not JSON.
  }

  return raw
}

function stripLyricTimeTags(line: string): string {
  return line.replace(/\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]/g, "").trim()
}

function parseTimedLyrics(text: string): TimedLyricLine[] {
  const rows = text.split(/\r?\n/)
  const result: TimedLyricLine[] = []

  for (const row of rows) {
    const times = Array.from(row.matchAll(/\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]/g))
    if (times.length === 0) continue

    const lyricText = stripLyricTimeTags(row)
    if (!lyricText) continue

    for (const match of times) {
      const minute = Number(match[1] ?? "0")
      const second = Number(match[2] ?? "0")
      const fractionRaw = String(match[3] ?? "")
      let fraction = 0
      if (fractionRaw.length === 1) {
        fraction = Number(fractionRaw) / 10
      } else if (fractionRaw.length === 2) {
        fraction = Number(fractionRaw) / 100
      } else if (fractionRaw.length >= 3) {
        fraction = Number(fractionRaw.slice(0, 3)) / 1000
      }

      const time = minute * 60 + second + fraction
      if (!Number.isFinite(time) || time < 0) continue
      result.push({
        time,
        text: lyricText
      })
    }
  }

  result.sort((a, b) => a.time - b.time)
  return result
}

function limitLyricsText(text: string, maxLength = MAX_LYRICS_TEXT_LENGTH): {
  text: string
  truncated: boolean
} {
  const normalized = text.trim()
  if (normalized.length <= maxLength) {
    return {
      text: normalized,
      truncated: false
    }
  }

  return {
    text: normalized.slice(0, maxLength),
    truncated: true
  }
}

function loadConfig(): NavidromeConfig {
  const shared = Storage.get<Partial<NavidromeConfig>>(CONFIG_KEY_SHARED, { shared: true }) ?? {}
  const scoped = Storage.get<Partial<NavidromeConfig>>(CONFIG_KEY) ?? {}
  const raw = {
    ...shared,
    ...scoped
  }
  let keychainPassword = ""
  try {
    keychainPassword = Keychain.get(CONFIG_PASSWORD_KEY) ?? ""
  } catch {
    keychainPassword = ""
  }
  return sanitizeConfig({
    ...DEFAULT_CONFIG,
    ...raw,
    password: keychainPassword || String(raw.password ?? "")
  })
}

function saveConfig(config: NavidromeConfig): void {
  const normalized = sanitizeConfig(config)
  const storagePayload = {
    ...normalized,
    password: ""
  }
  Storage.set(CONFIG_KEY, storagePayload)
  Storage.set(CONFIG_KEY_SHARED, storagePayload, { shared: true })
  try {
    if (normalized.password.length > 0) {
      Keychain.set(CONFIG_PASSWORD_KEY, normalized.password)
    } else {
      Keychain.remove(CONFIG_PASSWORD_KEY)
    }
  } catch {
    // Ignore keychain failures and keep runtime usable.
  }
}

function connectionColor(state: ConnectionState): any {
  if (state === "ok") return "systemGreen"
  if (state === "error") return "systemRed"
  if (state === "loading") return "systemOrange"
  return "secondaryLabel"
}

async function requestSubsonic(
  config: NavidromeConfig,
  endpoint: string,
  params: Record<string, string | number | null | undefined> = {}
): Promise<Record<string, any>> {
  const url = buildSubsonicUrl(config, endpoint, params)
  const response = await fetch(url, {
    timeout: 20,
    allowInsecureRequest: true
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  const payload = await response.json()
  if (!isRecord(payload)) {
    throw new Error("返回数据格式不正确")
  }

  const body = payload["subsonic-response"]
  if (!isRecord(body)) {
    throw new Error("缺少 subsonic-response 字段")
  }

  if (body.status !== "ok") {
    const message = isRecord(body.error)
      ? String(body.error.message ?? body.error.code ?? "未知错误")
      : "未知错误"
    throw new Error(`Navidrome 错误：${message}`)
  }

  return body
}

export {
  NavidromeConfig,
  NavidromeSong,
  NavidromeAlbum,
  NavidromePlaylist,
  NavidromeFolder,
  ConnectionState,
  PlaybackState,
  ConnectionFeedback,
  AllSongsAlbumCacheEntry,
  AllSongsCacheData,
  PlaybackSnapshot,
  ArtistCatalogItem,
  TimedLyricLine,
  LikedSongsSnapshot,
  CONFIG_KEY,
  CONFIG_KEY_SHARED,
  CONFIG_PASSWORD_KEY,
  PLAYBACK_SNAPSHOT_KEY,
  PLAYBACK_SNAPSHOT_KEY_SHARED,
  LIKED_SONGS_KEY,
  LIKED_SONGS_KEY_SHARED,
  CLIENT_NAME,
  API_VERSION,
  RESPONSE_FORMAT,
  ALL_SONGS_ALBUM_PAGE_SIZE,
  ALL_SONGS_ALBUM_BATCH_SIZE,
  ALL_SONGS_CACHE_VERSION,
  ALL_SONGS_CACHE_DIR,
  MAX_QUEUE_SONGS,
  MAX_COVER_CACHE_ENTRIES,
  MAX_LIST_COVER_CACHE_ENTRIES,
  MAX_LIST_COVER_FETCH_CONCURRENCY,
  MAX_LYRICS_TEXT_LENGTH,
  MAX_ALL_SONGS_CACHE_FILES,
  MAX_ALL_SONGS_CACHE_BYTES,
  DEFAULT_CONFIG,
  normalizeServerUrl,
  sanitizeConfig,
  isConfigReady,
  generateSalt,
  buildAuthParams,
  toQueryString,
  buildSubsonicUrl,
  isRecord,
  toSongArray,
  toAlbumArray,
  normalizeSongs,
  normalizeAlbums,
  normalizePlaylists,
  isTruthyFlag,
  normalizeFolders,
  normalizeMusicDirectoryChildren,
  buildAlbumFingerprint,
  allSongsCacheScope,
  allSongsCacheFilePath,
  resolveAllSongsCacheEntryPath,
  isSameSong,
  isSameSongList,
  isEquivalentAllSongsCache,
  pruneAllSongsCacheFiles,
  readAllSongsCache,
  writeAllSongsCache,
  normalizePlaybackSnapshot,
  loadPlaybackSnapshot,
  savePlaybackSnapshot,
  normalizeLikedSongsSnapshot,
  loadLikedSongsSnapshot,
  saveLikedSongsSnapshot,
  SongSquareCover,
  normalizeArtistName,
  getArtistInitialByPinyin,
  buildArtistCatalog,
  formatDuration,
  getErrorMessage,
  buildLyricsRequestUrl,
  extractLyricsFromPayload,
  parseLyricsResponseText,
  stripLyricTimeTags,
  parseTimedLyrics,
  limitLyricsText,
  loadConfig,
  saveConfig,
  connectionColor,
  requestSubsonic
}
