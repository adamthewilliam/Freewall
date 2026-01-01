# Freewall

A Chrome extension for bypassing paywalls and discovering alternative article sources.

## Features

### Archive Pages (Bypass Paywalls)

Freewall makes it easy to access content behind paywalls by redirecting you to archived versions of web pages. Simply right-click any link and select "Archive this page" to view it on:

- **Wayback Machine** (web.archive.org)
- **Archive.ph**
- **Custom archive services** you configure

### Find Alternative Articles

Can't access an article? Use "Find alternative articles" to search for the same story across free news sources:

- Google News
- Bing News
- DuckDuckGo News
- Google Search

The extension automatically extracts the article title and opens your preferred search engine.

## Installation

### Chrome Web Store

Install from the [Chrome Web Store](https://chromewebstore.google.com/detail/freewall/dhjghciiiiedfgidmcmablgbjndibhmf)

### Manual Installation

1. Clone this repository
2. Run `npm install` and `npm run build`
3. Open Chrome and go to `chrome://extensions`
4. Enable "Developer mode"
5. Click "Load unpacked" and select the `.output/chrome-mv3` folder

## Usage

| Action | How |
|--------|-----|
| Archive a link | Right-click link → "Archive this page" |
| Archive current page | Click toolbar icon or press `Alt+Shift+A` |
| Find alternatives | Right-click on page → "Find alternative articles" |

## Configuration

Open the extension options to:

- Select your preferred archive service
- Add custom archive services
- Choose your preferred search engine for article discovery

## Privacy

No accounts. No data collection. All preferences stored locally in your browser.

## Screenshots

![Screenshot 2023-12-12 at 01 02 44](https://github.com/adamthewilliam/Freewall/assets/24702294/ce00d5f9-b502-44ea-9b93-16c2555b45e9)
![Screenshot 2023-12-12 at 01 01 55](https://github.com/adamthewilliam/Freewall/assets/24702294/88c64279-577d-4e2f-96ca-1df40bc0b026)

## License

MIT License - see [LICENSE](LICENSE) for details.
