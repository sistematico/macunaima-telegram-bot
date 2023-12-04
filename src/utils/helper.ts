export function escapeMd(text: string) {
  const specialCharacters = /[_*\[\]()~`>#+-=|{}.!]/g
  return text.replace(specialCharacters, (match) => '\\' + match)
}