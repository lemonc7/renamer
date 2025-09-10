export function updateEpisode(name: string, offset: number) {
  if (offset === 0) return name

  const extIndex = name.lastIndexOf(".")
  const ext = extIndex >= 0 ? name.slice(extIndex) : ""
  const nameWithoutExt = ext ? name.slice(0, extIndex) : name

  if (nameWithoutExt.length < 5) {
    throw new Error("无效格式: " + name)
  }

  const episodeStr = nameWithoutExt.slice(4)
  const episode = parseInt(episodeStr, 10)
  if (isNaN(episode)) {
    throw new Error("无效集数: " + name)
  }

  const newEpisode = episode + offset
  if (newEpisode < 1) {
    throw new Error(`${name}偏移后的剧集会小于1`)
  }

  return `${nameWithoutExt.slice(0, 4)}${newEpisode
    .toString()
    .padStart(2, "0")}${ext}`
}
