export function joinPath(base: string, subs: string[]) {
  const cleanBase = base.replace(/\/$/, "")
  const cleanSubs = subs.filter(Boolean).map((s) => s.replace(/^\/|\/$/g, ""))
  return [cleanBase, ...cleanSubs].join("/")
}
