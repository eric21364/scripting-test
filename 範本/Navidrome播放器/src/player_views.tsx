import {
  Button,
  Circle,
  HStack,
  Image,
  RoundedRectangle,
  Slider,
  Spacer,
  Text,
  TextField,
  VStack,
  ZStack
} from "scripting"

import { formatDuration, SongSquareCover, type NavidromeConfig, type NavidromePlaylist, type NavidromeSong } from "./core"

type CircleIconButtonProps = {
  icon: string
  action: () => void
  size?: number
  iconSize?: number
  fill?: any
  foregroundStyle?: any
}

function CircleIconButton({ icon, action, size = 34, iconSize = 15, fill = "rgba(255,255,255,0.12)", foregroundStyle = "rgba(255,255,255,0.95)" }: CircleIconButtonProps) {
  return (
    <Button action={action} buttonStyle="plain">
      <ZStack frame={{ width: size, height: size }}>
        <Circle fill={fill} />
        <Image systemName={icon} font={iconSize} foregroundStyle={foregroundStyle} />
      </ZStack>
    </Button>
  )
}

type PlayerTabContentProps = {
  currentCoverImage: UIImage | null
  discRotationDeg: number
  currentSong: NavidromeSong | null
  lyricsLoading: boolean
  timedLyricLines: Array<{ time: number; text: string }>
  playerSyncedLyricWindow: Array<{ time: number; text: string } | null>
  currentTimedLyricIndex: number
  lyricLines: string[]
  isCurrentSongLiked: boolean
  isCurrentSongFavoriteSyncing: boolean
  onToggleCurrentSongFavorite: () => void
  onOpenSettings: () => void
  sliderMax: number
  sliderValue: number
  positionSec: number
  durationSec: number
  onPositionChanged: (value: number) => void
  onEditingChanged: (editing: boolean) => void
  playbackModeIcon: string
  onTogglePlaybackMode: () => void
  onPrevious: () => void
  onTogglePlayPause: () => void
  onNext: () => void
  onOpenQueue: () => void
  isPlaying: boolean
}

function PlayerTabContent(props: PlayerTabContentProps) {
  const {
    currentCoverImage,
    discRotationDeg,
    currentSong,
    lyricsLoading,
    timedLyricLines,
    playerSyncedLyricWindow,
    currentTimedLyricIndex,
    lyricLines,
    isCurrentSongLiked,
    isCurrentSongFavoriteSyncing,
    onToggleCurrentSongFavorite,
    onOpenSettings,
    sliderMax,
    sliderValue,
    positionSec,
    durationSec,
    onPositionChanged,
    onEditingChanged,
    playbackModeIcon,
    onTogglePlaybackMode,
    onPrevious,
    onTogglePlayPause,
    onNext,
    onOpenQueue,
    isPlaying
  } = props

  return (
    <VStack
      spacing={0}
      frame={{ maxWidth: "infinity", minHeight: 610, alignment: "top" }}
      padding={{ horizontal: 14, top: 16, bottom: 18 }}
      background={
        <RoundedRectangle
          cornerRadius={26}
          style="continuous"
          fill="rgba(5,7,19,0.20)"
        />
      }
      clipShape={{
        type: "rect",
        cornerRadius: 26,
        style: "continuous"
      }}
    >
      <Spacer frame={{ height: 20 }} />
      <ZStack frame={{ width: 266, height: 266 }}>
        <Circle frame={{ width: 260, height: 260 }} fill="rgba(255,255,255,0.08)" blur={16} />
        <Circle frame={{ width: 256, height: 256 }} fill="rgba(255,255,255,0.12)" />
        <ZStack frame={{ width: 246, height: 246 }} rotationEffect={discRotationDeg}>
          <Circle frame={{ width: 246, height: 246 }} fill="rgba(7,8,14,0.92)" shadow={{ color: "rgba(0,0,0,0.52)", radius: 18, y: 9 }} />
          <Circle frame={{ width: 240, height: 240 }} fill="rgba(255,255,255,0.03)" />
          <Circle frame={{ width: 226, height: 226 }} fill="rgba(255,255,255,0.02)" />
          <Circle frame={{ width: 212, height: 212 }} fill="rgba(255,255,255,0.02)" />
          <Circle frame={{ width: 196, height: 196 }} fill="rgba(255,255,255,0.03)" />
          <Circle frame={{ width: 188, height: 188 }} fill="rgba(255,255,255,0.10)" />
          <Circle frame={{ width: 22, height: 22 }} fill="rgba(255,255,255,0.08)" offset={{ x: -66, y: -68 }} />
          <ZStack frame={{ width: 170, height: 170 }}>
            <Circle frame={{ width: 170, height: 170 }} fill="rgba(255,255,255,0.10)" />
            {currentCoverImage ? (
              <ZStack frame={{ width: 164, height: 164 }}>
                <Image
                  image={currentCoverImage}
                  resizable
                  scaleToFill
                  clipped
                  frame={{ width: 164, height: 164 }}
                  clipShape={{ type: "rect", cornerRadius: 82, style: "continuous" }}
                />
                <Circle frame={{ width: 38, height: 38 }} fill="rgba(255,255,255,0.20)" />
                <Circle frame={{ width: 12, height: 12 }} fill="rgba(34,38,52,0.68)" />
              </ZStack>
            ) : (
              <ZStack frame={{ width: 164, height: 164 }}>
                <Circle frame={{ width: 164, height: 164 }} fill="rgba(240,226,199,0.92)" />
                <Circle frame={{ width: 148, height: 148 }} fill="rgba(188,168,129,0.20)" />
                <Circle frame={{ width: 112, height: 112 }} fill="rgba(222,205,166,0.74)" />
                <Circle frame={{ width: 82, height: 82 }} fill="rgba(255,247,224,0.46)" />
                <RoundedRectangle cornerRadius={1} fill="rgba(120,92,43,0.38)" frame={{ width: 86, height: 1 }} />
                <VStack spacing={3}>
                  <Text font={{ name: "system-bold", size: 9 }} foregroundStyle="rgba(93,67,26,0.76)">NAVIDROME</Text>
                  <Text font={8} foregroundStyle="rgba(93,67,26,0.62)">SIDE A</Text>
                </VStack>
                <Circle frame={{ width: 10, height: 10 }} fill="rgba(92,70,34,0.74)" />
              </ZStack>
            )}
          </ZStack>
        </ZStack>
        <Circle frame={{ width: 18, height: 18 }} fill="rgba(26,28,40,0.95)" />
        <Circle frame={{ width: 6, height: 6 }} fill="rgba(220,224,238,0.70)" />
      </ZStack>
      <Spacer frame={{ height: 2 }} />

      <VStack
        spacing={4}
        frame={{ maxWidth: "infinity", minHeight: 84, maxHeight: 102 }}
        padding={{ horizontal: 8, vertical: 6 }}
      >
        <VStack spacing={5} alignment="center" frame={{ maxWidth: "infinity", alignment: "center" }}>
          {!currentSong ? (
            <Text font={13} foregroundStyle="rgba(255,255,255,0.76)" frame={{ maxWidth: "infinity" }} multilineTextAlignment="center">播放后可在这里滚动查看歌词</Text>
          ) : lyricsLoading ? (
            <Text font={13} foregroundStyle="rgba(255,255,255,0.76)" frame={{ maxWidth: "infinity" }} multilineTextAlignment="center">正在加载歌词...</Text>
          ) : timedLyricLines.length > 0 ? (
            playerSyncedLyricWindow.map((line, index) => {
              const isCurrentLine = index === 1 && currentTimedLyricIndex >= 0
              return (
                <Text
                  key={`player-sync-lyric-line-${index}-${line?.time ?? "none"}`}
                  font={isCurrentLine ? { name: "system-bold", size: 18 } : 14}
                  foregroundStyle={isCurrentLine ? "rgba(255,255,255,0.98)" : "rgba(255,255,255,0.56)"}
                  lineLimit={2}
                  frame={{ maxWidth: "infinity" }}
                  multilineTextAlignment="center"
                >
                  {line?.text ?? " "}
                </Text>
              )
            })
          ) : lyricLines.length === 0 ? (
            <Text font={13} foregroundStyle="rgba(255,255,255,0.76)" frame={{ maxWidth: "infinity" }} multilineTextAlignment="center">暂无歌词内容</Text>
          ) : (
            lyricLines.slice(0, 3).map((line, index) => (
              <Text
                key={`player-lyric-line-${index}`}
                font={index === 0 ? { name: "system-bold", size: 18 } : 14}
                foregroundStyle={index === 0 ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.58)"}
                lineLimit={2}
                frame={{ maxWidth: "infinity" }}
                multilineTextAlignment="center"
              >
                {line}
              </Text>
            ))
          )}
        </VStack>
      </VStack>
      <Spacer frame={{ height: 26 }} />

      <VStack spacing={10} alignment="leading" frame={{ maxWidth: "infinity" }}>
        <HStack alignment="center" spacing={8} frame={{ maxWidth: "infinity", alignment: "leading" }}>
          <VStack spacing={3} alignment="leading" frame={{ maxWidth: "infinity" }}>
            <Text
              font={{ name: "system-bold", size: 24 }}
              foregroundStyle="white"
              lineLimit={1}
              frame={{ maxWidth: "infinity", alignment: "leading" }}
            >
              {currentSong?.title ?? ""}
            </Text>
            {currentSong ? (
              <Text
                font="caption"
                foregroundStyle="rgba(255,255,255,0.80)"
                lineLimit={1}
                frame={{ maxWidth: "infinity", alignment: "leading" }}
              >
                {`${currentSong.artist} · ${currentSong.album}`}
              </Text>
            ) : null}
          </VStack>
          <CircleIconButton
            icon={isCurrentSongLiked ? "heart.fill" : "heart"}
            action={() => {
              if (isCurrentSongFavoriteSyncing) return
              onToggleCurrentSongFavorite()
            }}
            fill={isCurrentSongLiked ? "rgba(255,72,132,0.28)" : "rgba(255,255,255,0.14)"}
            foregroundStyle={isCurrentSongLiked ? "rgba(255,174,204,0.98)" : "rgba(255,255,255,0.95)"}
          />
          <CircleIconButton icon="ellipsis" action={onOpenSettings} fill="rgba(255,255,255,0.14)" foregroundStyle="rgba(255,255,255,0.95)" />
        </HStack>

        <Slider
          min={0}
          max={sliderMax}
          step={1}
          value={sliderValue}
          tint="rgba(255,255,255,0.98)"
          onChanged={onPositionChanged}
          onEditingChanged={onEditingChanged}
          label={<VStack />}
        />

        <HStack alignment="center" spacing={8} frame={{ maxWidth: "infinity" }}>
          <Text font="caption2" foregroundStyle="rgba(255,255,255,0.82)">{formatDuration(positionSec)}</Text>
          <Spacer />
          <Text font="caption2" foregroundStyle="rgba(255,255,255,0.82)">{formatDuration(durationSec)}</Text>
        </HStack>

        <HStack spacing={22} alignment="center" frame={{ maxWidth: "infinity" }}>
          <CircleIconButton icon={playbackModeIcon} action={onTogglePlaybackMode} size={46} iconSize={19} fill="rgba(255,255,255,0.12)" foregroundStyle="rgba(255,255,255,0.92)" />
          <CircleIconButton icon="backward.fill" action={onPrevious} size={46} iconSize={19} fill="rgba(255,255,255,0.12)" foregroundStyle="rgba(255,255,255,0.92)" />
          <CircleIconButton icon={isPlaying ? "pause.fill" : "play.fill"} action={onTogglePlayPause} size={78} iconSize={43.5} fill="rgba(255,255,255,0.24)" foregroundStyle="white" />
          <CircleIconButton icon="forward.fill" action={onNext} size={46} iconSize={19} fill="rgba(255,255,255,0.12)" foregroundStyle="rgba(255,255,255,0.92)" />
          <CircleIconButton icon="list.bullet" action={onOpenQueue} size={46} iconSize={19} fill="rgba(255,255,255,0.92)" foregroundStyle="rgba(16,22,36,0.92)" />
        </HStack>
      </VStack>
      <Spacer frame={{ height: 2 }} />
    </VStack>
  )
}

type LibraryAction = {
  title: string
  icon: string
  action: () => void
}

type LibraryTabContentProps = {
  config: NavidromeConfig
  queueLabel: string
  currentSong: NavidromeSong | null
  positionSec: number
  durationSec: number
  onContinuePlayback: () => void
  libraryActions: LibraryAction[]
  latestSongsQueue: NavidromeSong[]
  onOpenLatestSongsList: () => void
  onPlayLatestSong: (index: number) => void
  dailyMixQueue: NavidromeSong[]
  onOpenDailyMixList: () => void
  onPlayDailyMixSong: (index: number) => void
  recentSongsQueue: NavidromeSong[]
  onOpenRecentSongsList: () => void
  onPlayRecentSong: (index: number) => void
  songSearchQuery: string
  onSongSearchQueryChange: (value: string) => void
  onOpenSongSearch: () => void
  loadingPlaylists: boolean
  onSyncPlaylists: () => void
  featuredPlaylists: NavidromePlaylist[]
  onOpenPlaylist: (playlist: NavidromePlaylist) => void
}

function LibraryTabContent(props: LibraryTabContentProps) {
  const {
    config,
    queueLabel,
    currentSong,
    positionSec,
    durationSec,
    onContinuePlayback,
    libraryActions,
    latestSongsQueue,
    onOpenLatestSongsList,
    onPlayLatestSong,
    dailyMixQueue,
    onOpenDailyMixList,
    onPlayDailyMixSong,
    recentSongsQueue,
    onOpenRecentSongsList,
    onPlayRecentSong,
    songSearchQuery,
    onSongSearchQueryChange,
    onOpenSongSearch,
    loadingPlaylists,
    onSyncPlaylists,
    featuredPlaylists,
    onOpenPlaylist
  } = props

  const dailyMixPreview = dailyMixQueue.slice(0, 3)
  const latestSongsPreview = latestSongsQueue.slice(0, 3)
  const recentSongsPreview = recentSongsQueue.slice(0, 3)

  return (
    <VStack spacing={14} alignment="leading">
      <VStack
        spacing={10}
        alignment="leading"
        frame={{ maxWidth: "infinity", alignment: "leading" }}
        padding={{ horizontal: 14, vertical: 12 }}
        background={<RoundedRectangle cornerRadius={16} style="continuous" fill="rgba(8,10,25,0.35)" />}
        clipShape={{ type: "rect", cornerRadius: 16, style: "continuous" }}
      >
        <HStack alignment="center" spacing={8} frame={{ maxWidth: "infinity", alignment: "leading" }}>
          <VStack alignment="leading" spacing={2} frame={{ maxWidth: "infinity", alignment: "leading" }}>
            <Text font={{ name: "system-bold", size: 18 }} foregroundStyle="white">继续播放</Text>
            <Text font="caption" foregroundStyle="rgba(255,255,255,0.78)">
              {currentSong ? `${queueLabel} · ${formatDuration(positionSec)} / ${formatDuration(durationSec)}` : "暂无播放记录"}
            </Text>
          </VStack>
          <Button
            action={onContinuePlayback}
            buttonStyle="plain"
            disabled={!currentSong}
          >
            <HStack
              alignment="center"
              spacing={6}
              padding={{ horizontal: 11, vertical: 6 }}
              background={<RoundedRectangle cornerRadius={999} style="continuous" fill="rgba(255,255,255,0.18)" />}
              clipShape={{ type: "rect", cornerRadius: 999, style: "continuous" }}
              shadow={{ color: "rgba(0,0,0,0.28)", radius: 6, y: 2 }}
            >
              <Image systemName="play.fill" font={11} foregroundStyle="rgba(255,255,255,0.95)" />
              <Text font={{ name: "system-bold", size: 12 }} foregroundStyle="white">继续</Text>
            </HStack>
          </Button>
        </HStack>

        {currentSong ? (
          <HStack spacing={10} alignment="center" frame={{ maxWidth: "infinity" }}>
            <SongSquareCover song={currentSong} config={config} size={42} />
            <VStack alignment="leading" spacing={3} frame={{ maxWidth: "infinity", alignment: "leading" }}>
              <Text lineLimit={1} foregroundStyle="white">{currentSong.title}</Text>
              <Text lineLimit={1} font="caption" foregroundStyle="rgba(255,255,255,0.78)">
                {currentSong.artist} - {currentSong.album}
              </Text>
            </VStack>
          </HStack>
        ) : null}
      </VStack>

      <VStack
        spacing={14}
        padding={{ horizontal: 14, vertical: 16 }}
        background={
          <RoundedRectangle
            cornerRadius={20}
            style="continuous"
            fill={{
              colors: ["rgba(11,73,129,0.95)", "rgba(7,62,115,0.94)", "rgba(5,48,100,0.90)"],
              startPoint: "topLeading",
              endPoint: "bottomTrailing"
            }}
          />
        }
        clipShape={{ type: "rect", cornerRadius: 20, style: "continuous" }}
      >
        <HStack spacing={6} frame={{ maxWidth: "infinity" }}>
          {libraryActions.map((item) => (
            <Button key={item.title} action={item.action} buttonStyle="plain" frame={{ maxWidth: "infinity" }}>
              <VStack
                frame={{ maxWidth: "infinity", minHeight: 82 }}
                spacing={8}
                padding={{ horizontal: 8, vertical: 12 }}
                background={<RoundedRectangle cornerRadius={12} style="continuous" fill="rgba(255,255,255,0.10)" />}
              >
                <Image systemName={item.icon} font={22} foregroundStyle="white" />
                <Text font={14} foregroundStyle="rgba(255,255,255,0.96)">{item.title}</Text>
              </VStack>
            </Button>
          ))}
        </HStack>
      </VStack>

      <VStack
        spacing={8}
        padding={{ horizontal: 14, vertical: 12 }}
        background={<RoundedRectangle cornerRadius={16} style="continuous" fill="rgba(8,10,25,0.35)" />}
        clipShape={{ type: "rect", cornerRadius: 16, style: "continuous" }}
      >
        <HStack spacing={8} alignment="center" frame={{ maxWidth: "infinity" }}>
          <TextField
            title=""
            prompt="搜索歌曲（歌名/歌手/专辑）"
            value={songSearchQuery}
            onChanged={onSongSearchQueryChange}
            frame={{ maxWidth: "infinity" }}
            textFieldStyle="plain"
          />
          <Button
            action={onOpenSongSearch}
            buttonStyle="plain"
            disabled={songSearchQuery.trim().length === 0}
          >
            <HStack
              alignment="center"
              spacing={6}
              padding={{ horizontal: 12, vertical: 8 }}
              background={<RoundedRectangle cornerRadius={999} style="continuous" fill="rgba(255,255,255,0.18)" />}
              clipShape={{ type: "rect", cornerRadius: 999, style: "continuous" }}
              shadow={{ color: "rgba(0,0,0,0.28)", radius: 6, y: 2 }}
            >
              <Image systemName="magnifyingglass" font={12} foregroundStyle="rgba(255,255,255,0.95)" />
              <Text font={{ name: "system-bold", size: 12 }} foregroundStyle="white">搜索</Text>
            </HStack>
          </Button>
        </HStack>
      </VStack>

      <VStack
        spacing={12}
        alignment="leading"
        frame={{ maxWidth: "infinity", alignment: "leading" }}
        padding={{ horizontal: 14, vertical: 14 }}
        background={<RoundedRectangle cornerRadius={16} style="continuous" fill="rgba(7,10,28,0.32)" />}
        clipShape={{ type: "rect", cornerRadius: 16, style: "continuous" }}
      >
        <HStack alignment="center" spacing={8} frame={{ maxWidth: "infinity", alignment: "leading" }}>
          <VStack alignment="leading" spacing={2} frame={{ maxWidth: "infinity", alignment: "leading" }}>
            <Text font={{ name: "system-bold", size: 20 }} foregroundStyle="white" frame={{ maxWidth: "infinity", alignment: "leading" }}>每日推荐</Text>
          </VStack>
          <Button action={onOpenDailyMixList} buttonStyle="plain" disabled={dailyMixQueue.length === 0}>
            <HStack
              alignment="center"
              spacing={6}
              padding={{ horizontal: 11, vertical: 6 }}
              background={<RoundedRectangle cornerRadius={999} style="continuous" fill="rgba(255,255,255,0.18)" />}
              clipShape={{ type: "rect", cornerRadius: 999, style: "continuous" }}
              shadow={{ color: "rgba(0,0,0,0.28)", radius: 6, y: 2 }}
            >
              <Image systemName="list.bullet" font={11} foregroundStyle="rgba(255,255,255,0.95)" />
              <Text font={{ name: "system-bold", size: 12 }} foregroundStyle="white">查看</Text>
            </HStack>
          </Button>
        </HStack>

        <Spacer frame={{ height: 4 }} />

        {dailyMixPreview.length === 0 ? (
          <Text foregroundStyle="rgba(255,255,255,0.8)">暂无可推荐歌曲，请先同步歌曲</Text>
        ) : (
          dailyMixPreview.map((song, index) => (
            <HStack
              key={`daily-mix-${song.id}`}
              spacing={10}
              alignment="center"
              frame={{ maxWidth: "infinity" }}
              contentShape="rect"
              onTapGesture={() => onPlayDailyMixSong(index)}
            >
              <SongSquareCover song={song} config={config} size={42} />
              <VStack alignment="leading" spacing={4} frame={{ maxWidth: "infinity", alignment: "leading" }}>
                <Text lineLimit={1} foregroundStyle="white" frame={{ maxWidth: "infinity", alignment: "leading" }}>{song.title}</Text>
                <Text lineLimit={1} font="caption" foregroundStyle="rgba(255,255,255,0.78)" frame={{ maxWidth: "infinity", alignment: "leading" }}>
                  {song.artist} - {song.album}
                </Text>
              </VStack>
              <Button
                title=""
                systemImage="play.fill"
                action={() => onPlayDailyMixSong(index)}
                buttonStyle="plain"
                font={12}
                foregroundStyle="rgba(255,255,255,0.72)"
              />
            </HStack>
          ))
        )}
      </VStack>

      <VStack
        spacing={12}
        alignment="leading"
        frame={{ maxWidth: "infinity", alignment: "leading" }}
        padding={{ horizontal: 14, vertical: 14 }}
        background={<RoundedRectangle cornerRadius={16} style="continuous" fill="rgba(7,10,28,0.32)" />}
        clipShape={{ type: "rect", cornerRadius: 16, style: "continuous" }}
      >
        <HStack alignment="center" spacing={8} frame={{ maxWidth: "infinity", alignment: "leading" }}>
          <Text font={{ name: "system-bold", size: 20 }} foregroundStyle="white" frame={{ maxWidth: "infinity", alignment: "leading" }}>最新歌曲</Text>
          <Button action={onOpenLatestSongsList} buttonStyle="plain" disabled={latestSongsQueue.length === 0}>
            <HStack
              alignment="center"
              spacing={6}
              padding={{ horizontal: 11, vertical: 6 }}
              background={<RoundedRectangle cornerRadius={999} style="continuous" fill="rgba(255,255,255,0.18)" />}
              clipShape={{ type: "rect", cornerRadius: 999, style: "continuous" }}
              shadow={{ color: "rgba(0,0,0,0.28)", radius: 6, y: 2 }}
            >
              <Image systemName="list.bullet" font={11} foregroundStyle="rgba(255,255,255,0.95)" />
              <Text font={{ name: "system-bold", size: 12 }} foregroundStyle="white">查看</Text>
            </HStack>
          </Button>
        </HStack>

        <Spacer frame={{ height: 4 }} />

        {latestSongsPreview.length === 0 ? (
          <Text foregroundStyle="rgba(255,255,255,0.8)">暂无最新歌曲，请先同步</Text>
        ) : (
          latestSongsPreview.map((song, index) => (
            <HStack
              key={`latest-song-${song.id}`}
              spacing={10}
              alignment="center"
              frame={{ maxWidth: "infinity" }}
              contentShape="rect"
              onTapGesture={() => onPlayLatestSong(index)}
            >
              <SongSquareCover song={song} config={config} size={42} />
              <VStack alignment="leading" spacing={4} frame={{ maxWidth: "infinity", alignment: "leading" }}>
                <Text lineLimit={1} foregroundStyle="white" frame={{ maxWidth: "infinity", alignment: "leading" }}>{song.title}</Text>
                <Text lineLimit={1} font="caption" foregroundStyle="rgba(255,255,255,0.78)" frame={{ maxWidth: "infinity", alignment: "leading" }}>
                  {song.artist} - {song.album}
                </Text>
              </VStack>
              <Button
                title=""
                systemImage="play.fill"
                action={() => onPlayLatestSong(index)}
                buttonStyle="plain"
                font={12}
                foregroundStyle="rgba(255,255,255,0.72)"
              />
            </HStack>
          ))
        )}
      </VStack>

      <VStack
        spacing={12}
        alignment="leading"
        frame={{ maxWidth: "infinity", alignment: "leading" }}
        padding={{ horizontal: 14, vertical: 14 }}
        background={<RoundedRectangle cornerRadius={16} style="continuous" fill="rgba(7,10,28,0.32)" />}
        clipShape={{ type: "rect", cornerRadius: 16, style: "continuous" }}
      >
        <HStack alignment="center" spacing={8} frame={{ maxWidth: "infinity", alignment: "leading" }}>
          <Text font={{ name: "system-bold", size: 20 }} foregroundStyle="white" frame={{ maxWidth: "infinity", alignment: "leading" }}>最近播放</Text>
          <Button action={onOpenRecentSongsList} buttonStyle="plain" disabled={recentSongsQueue.length === 0}>
            <HStack
              alignment="center"
              spacing={6}
              padding={{ horizontal: 11, vertical: 6 }}
              background={<RoundedRectangle cornerRadius={999} style="continuous" fill="rgba(255,255,255,0.18)" />}
              clipShape={{ type: "rect", cornerRadius: 999, style: "continuous" }}
              shadow={{ color: "rgba(0,0,0,0.28)", radius: 6, y: 2 }}
            >
              <Image systemName="list.bullet" font={11} foregroundStyle="rgba(255,255,255,0.95)" />
              <Text font={{ name: "system-bold", size: 12 }} foregroundStyle="white">查看</Text>
            </HStack>
          </Button>
        </HStack>

        {recentSongsPreview.length === 0 ? (
          <Text foregroundStyle="rgba(255,255,255,0.8)">暂无最近播放记录</Text>
        ) : (
          recentSongsPreview.map((song, index) => (
            <HStack
              key={`recent-song-${song.id}`}
              spacing={10}
              alignment="center"
              frame={{ maxWidth: "infinity" }}
              contentShape="rect"
              onTapGesture={() => onPlayRecentSong(index)}
            >
              <SongSquareCover song={song} config={config} size={42} />
              <VStack alignment="leading" spacing={4} frame={{ maxWidth: "infinity", alignment: "leading" }}>
                <Text lineLimit={1} foregroundStyle="white" frame={{ maxWidth: "infinity", alignment: "leading" }}>{song.title}</Text>
                <Text lineLimit={1} font="caption" foregroundStyle="rgba(255,255,255,0.78)" frame={{ maxWidth: "infinity", alignment: "leading" }}>
                  {song.artist} - {song.album}
                </Text>
              </VStack>
              <Button
                title=""
                systemImage="play.fill"
                action={() => onPlayRecentSong(index)}
                buttonStyle="plain"
                font={12}
                foregroundStyle="rgba(255,255,255,0.72)"
              />
            </HStack>
          ))
        )}
      </VStack>

      <VStack
        spacing={12}
        alignment="leading"
        frame={{ maxWidth: "infinity", alignment: "leading" }}
        padding={{ horizontal: 14, vertical: 14 }}
        background={<RoundedRectangle cornerRadius={16} style="continuous" fill="rgba(7,10,28,0.32)" />}
        clipShape={{ type: "rect", cornerRadius: 16, style: "continuous" }}
      >
        <HStack alignment="center" spacing={8} frame={{ maxWidth: "infinity", alignment: "leading" }}>
          <Text font={{ name: "system-bold", size: 20 }} foregroundStyle="white" frame={{ maxWidth: "infinity", alignment: "leading" }}>我的歌单</Text>
          <Spacer />
          <Button action={onSyncPlaylists} buttonStyle="plain">
            <HStack
              alignment="center"
              spacing={6}
              padding={{ horizontal: 11, vertical: 6 }}
              background={<RoundedRectangle cornerRadius={999} style="continuous" fill="rgba(255,255,255,0.16)" />}
              clipShape={{ type: "rect", cornerRadius: 999, style: "continuous" }}
              shadow={{ color: "rgba(0,0,0,0.28)", radius: 6, y: 2 }}
            >
              <Image
                systemName={loadingPlaylists ? "arrow.triangle.2.circlepath.circle.fill" : "arrow.clockwise"}
                font={11}
                foregroundStyle="rgba(255,255,255,0.95)"
              />
              <Text font={{ name: "system-bold", size: 12 }} foregroundStyle="white">
                {loadingPlaylists ? "同步中" : "同步"}
              </Text>
            </HStack>
          </Button>
        </HStack>

        <Spacer frame={{ height: 4 }} />

        {featuredPlaylists.length === 0 ? (
          <Text foregroundStyle="rgba(255,255,255,0.8)">{loadingPlaylists ? "正在加载歌单..." : "暂无歌单数据"}</Text>
        ) : (
          featuredPlaylists.map((playlist) => (
            <Button
              key={playlist.id}
              action={() => onOpenPlaylist(playlist)}
              buttonStyle="plain"
              frame={{ maxWidth: "infinity", alignment: "leading" }}
            >
              <HStack
                alignment="center"
                spacing={10}
                frame={{ maxWidth: "infinity", alignment: "leading" }}
                padding={{ horizontal: 12, vertical: 11 }}
                background={<RoundedRectangle cornerRadius={14} style="continuous" fill="rgba(255,255,255,0.10)" />}
              >
                <ZStack frame={{ width: 38, height: 38 }}>
                  <Circle fill="rgba(255,255,255,0.18)" />
                  <Image systemName="music.note.list" font={16} foregroundStyle="white" />
                </ZStack>
                <VStack alignment="leading" spacing={3} frame={{ maxWidth: "infinity", alignment: "leading" }}>
                  <Text lineLimit={1} foregroundStyle="white" frame={{ maxWidth: "infinity", alignment: "leading" }}>{playlist.name}</Text>
                  <Text lineLimit={1} font="caption" foregroundStyle="rgba(255,255,255,0.78)">
                    {playlist.songCount > 0 ? `${playlist.songCount} 首` : "0 首"}
                  </Text>
                </VStack>
                <Image systemName="ellipsis" font={15} foregroundStyle="rgba(255,255,255,0.74)" />
              </HStack>
            </Button>
          ))
        )}
      </VStack>
    </VStack>
  )
}

type LyricsTabContentProps = {
  currentSong: NavidromeSong | null
  lyricsLoading: boolean
  timedLyricLines: Array<{ time: number; text: string }>
  currentTimedLyricIndex: number
  renderedLyricLines: string[]
  totalLyricLines: number
}

function LyricsTabContent({ currentSong, lyricsLoading, timedLyricLines, currentTimedLyricIndex, renderedLyricLines, totalLyricLines }: LyricsTabContentProps) {
  return (
    <VStack spacing={12} alignment="center" frame={{ maxWidth: "infinity" }}>
      <Spacer frame={{ height: 30 }} />
      {currentSong ? (
        <VStack spacing={6} alignment="center" frame={{ maxWidth: "infinity" }} padding={14}>
          <Text font={{ name: "system-bold", size: 22 }} foregroundStyle="white" lineLimit={1}>
            {currentSong.title}
          </Text>
          <Text font="caption" foregroundStyle="rgba(255,255,255,0.78)" lineLimit={1}>
            {`${currentSong.artist} - ${currentSong.album}`}
          </Text>
        </VStack>
      ) : null}

      <VStack
        spacing={8}
        alignment="center"
        frame={{ maxWidth: "infinity" }}
        padding={14}
      >
        {lyricsLoading ? (
          <Text
            foregroundStyle="rgba(255,255,255,0.8)"
            frame={{ maxWidth: "infinity" }}
            multilineTextAlignment="center"
          >
            正在加载歌词...
          </Text>
        ) : timedLyricLines.length > 0 ? (
          <VStack spacing={12} frame={{ maxWidth: "infinity", minHeight: 320, maxHeight: 420 }}>
            {[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7].map((offset) => {
              const center = currentTimedLyricIndex >= 0 ? currentTimedLyricIndex : 0
              const rowIndex = center + offset
              const line = timedLyricLines[rowIndex]
              const isCurrent = offset === 0

              let alpha = 0.24
              if (offset > 0) {
                alpha = Math.max(0.02, 0.86 - offset * 0.13)
              } else if (offset < 0) {
                alpha = Math.max(0.10, 0.66 + offset * 0.09)
              }

              return (
                <Text
                  key={`timed-window-${offset}`}
                  font={isCurrent ? { name: "system-bold", size: 20 } : 15}
                  lineSpacing={5}
                  lineLimit={1}
                  minScaleFactor={0.7}
                  frame={{ maxWidth: "infinity" }}
                  multilineTextAlignment="center"
                  foregroundStyle={isCurrent ? "rgba(255,255,255,0.98)" : `rgba(255,255,255,${alpha})`}
                >
                  {line?.text ?? " "}
                </Text>
              )
            })}
          </VStack>
        ) : renderedLyricLines.length === 0 ? (
          <Text
            foregroundStyle="rgba(255,255,255,0.8)"
            frame={{ maxWidth: "infinity" }}
            multilineTextAlignment="center"
          >
            当前没有播放
          </Text>
        ) : (
          renderedLyricLines.map((line, index) => (
            <Text
              key={`lyric-line-${index}`}
              font={line.includes("[") ? "caption2" : 15}
              lineSpacing={2}
              frame={{ maxWidth: "infinity" }}
              multilineTextAlignment="center"
              foregroundStyle={line.includes("[") ? "rgba(255,255,255,0.56)" : "rgba(255,255,255,0.94)"}
            >
              {line}
            </Text>
          ))
        )}
        {totalLyricLines > renderedLyricLines.length ? (
          <Text
            font="caption2"
            foregroundStyle="rgba(255,255,255,0.58)"
            frame={{ maxWidth: "infinity" }}
            multilineTextAlignment="center"
          >
            歌词较长，当前只显示前 {renderedLyricLines.length} 行。
          </Text>
        ) : null}
      </VStack>
    </VStack>
  )
}

type NowPlayingBarProps = {
  isLibraryTab: boolean
  currentCoverImage: UIImage | null
  currentSong: NavidromeSong | null
  playbackHint: string
  isPlaying: boolean
  onTogglePlayPause: () => void
  onOpenPlayerTab: () => void
}

function NowPlayingBar({ isLibraryTab, currentCoverImage, currentSong, playbackHint, isPlaying, onTogglePlayPause, onOpenPlayerTab }: NowPlayingBarProps) {
  return (
    <VStack frame={{ maxWidth: "infinity", maxHeight: "infinity" }} padding={{ horizontal: 12, bottom: 12 }}>
      <Spacer />
      <HStack
        alignment="center"
        spacing={12}
        frame={{ maxWidth: "infinity", alignment: "leading" }}
        padding={{ horizontal: 13, vertical: 10 }}
        background={
          <RoundedRectangle
            cornerRadius={20}
            style="continuous"
            fill={isLibraryTab ? "rgba(20,24,34,0.68)" : "rgba(20,24,34,0.64)"}
            stroke="rgba(255,255,255,0.10)"
          />
        }
        clipShape={{ type: "rect", cornerRadius: 20, style: "continuous" }}
        shadow={{ color: "rgba(0,0,0,0.24)", radius: 12, y: 5 }}
      >
        <ZStack frame={{ width: 40, height: 40 }}>
          <Circle fill="rgba(255,255,255,0.08)" />
          {currentCoverImage ? (
            <Image
              image={currentCoverImage}
              resizable
              scaleToFill
              clipped
              frame={{ width: 36, height: 36 }}
              clipShape={{ type: "rect", cornerRadius: 18, style: "continuous" }}
            />
          ) : (
            <Image systemName="music.note" font={14} foregroundStyle="rgba(255,255,255,0.86)" />
          )}
        </ZStack>
        <VStack alignment="leading" spacing={2} frame={{ maxWidth: "infinity", alignment: "leading" }}>
          <Text lineLimit={1} font={{ name: "system-bold", size: 15 }} foregroundStyle="white">
            {currentSong?.title ?? "未开始播放"}
          </Text>
          <Text lineLimit={1} font="caption" foregroundStyle="rgba(255,255,255,0.72)">
            {currentSong ? `${currentSong.artist} · ${playbackHint}` : "点击歌曲开始播放"}
          </Text>
        </VStack>
        <Button action={onTogglePlayPause} buttonStyle="plain">
          <ZStack frame={{ width: 34, height: 34 }}>
            <Circle fill="rgba(255,255,255,0.14)" />
            <Image systemName={isPlaying ? "pause.fill" : "play.fill"} font={14} foregroundStyle="white" />
          </ZStack>
        </Button>
        <Button action={onOpenPlayerTab} buttonStyle="plain">
          <ZStack frame={{ width: 34, height: 34 }}>
            <Circle fill="rgba(255,255,255,0.10)" />
            <Image systemName="music.note" font={13} foregroundStyle="rgba(255,255,255,0.88)" />
          </ZStack>
        </Button>
      </HStack>
    </VStack>
  )
}

export {
  CircleIconButton,
  PlayerTabContent,
  LibraryTabContent,
  LyricsTabContent,
  NowPlayingBar
}
