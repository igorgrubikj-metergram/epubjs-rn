# Changelog

## 0.2.45

### Improved

- Added a `renditionProvider` prop to access the `Rendition` class methods like `next()` and `prev()`.

## 0.2.44

### Fixed

- Changed `epubjs` to version `0.3.84` to fix the EPUB CFI end location bug. This version appears to be working properly.

## 0.2.43

### Fixed

- Changed `epubjs` (back) to version `0.3.88` to fix the EPUB CFI end location bug.
- Added a `.then().catch()` for the Promise `rendition.display(target)` in `bridge.js` in an attempt to solve the _Unhandled Promise Rejections_ bug.

## 0.2.42

### Fixed

- General code cleanup.
- Checking if component is mounted before setting state.
- Catching and logging errors on async functions.

### Improved

- Added a `spinnerColor` prop for the loading spinner color of the Book Reader.

## 0.2.41

### Fixed

- Changed `epubjs` to version `0.3.87` to fix the EPUB CFI end location bug.
