export function validateFilename(name: string) {
  const ILLEGAL_CHARS_REG = /[\\\/:*?"<>|]/
  return !ILLEGAL_CHARS_REG.test(name)
}
