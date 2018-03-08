import Colr from 'colr'

const percentageLimit = 61
const themeNames = {
  light: 'light',
  dark: 'dark',
}

const getLightPercentage = color => Colr
  .fromHex(color)
  .toHslArray()[2]

const getBlackPercentage = color => 100 - getLightPercentage(color)

const getThemeName = (color) => {
  const blackPercentage = getBlackPercentage(color)

  if (blackPercentage < percentageLimit) {
    return themeNames.dark
  }

  return themeNames.light
}

export default getThemeName
