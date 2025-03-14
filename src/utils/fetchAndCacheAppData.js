import isImageUrl from './isImageUrl'
import parseAppManifest from './parseAppManifest'

async function fetchAndCacheAppData(appDomain, setAppIcon, setAppName, DEFAULT_APP_ICON) {
  const faviconKey = `favicon_${appDomain}`
  const manifestKey = `manifest_${appDomain}`

  // Try to load data from cache first
  const cachedFavicon = window.localStorage.getItem(faviconKey)
  const cachedManifest = window.localStorage.getItem(manifestKey)

  if (cachedFavicon) {
    setAppIcon(cachedFavicon)
  } else {
    setAppIcon(DEFAULT_APP_ICON) // Set default if no cache and appDomain condition matches
  }

  if (cachedManifest) {
    setAppName(cachedManifest)
  }

  // Always fetch the latest data
  try {
    const manifest = await parseAppManifest({ domain: appDomain })
    if (manifest) {
      const faviconUrl = `https://${appDomain}/favicon.ico`
      if (await isImageUrl(faviconUrl)) {
        setAppIcon(faviconUrl)
        window.localStorage.setItem(faviconKey, faviconUrl)
      } else {
        setAppIcon(DEFAULT_APP_ICON)
      }

      if (typeof manifest.name === 'string') {
        setAppName(manifest.name)
        window.localStorage.setItem(manifestKey, manifest.name)
      }
    }
  } catch (error) {
    console.error(error)
  }
}

export default fetchAndCacheAppData
