export function updateEpisode(name: string, offset: number) {
  if (offset === 0) return name

  const match = name.match(/(S\d{2}E)(\d+)/i)
  if (!match) throw new Error(`无效格式: ${name}`)

  const prefix = match[1] // SxxE
  const episode = parseInt(match[2])
  const newEpisode = episode + offset
  if (newEpisode < 1) throw new Error(`偏移后的剧集[${name}]会小于1`)

  const extIndex = name.lastIndexOf(".")
  const ext = extIndex >= 0 ? name.slice(extIndex) : ""

  return `${prefix}${newEpisode.toString().padStart(2, "0")}${ext}`
}
