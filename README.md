# Personal site

Static personal site, no framework and no build step. Hosted on GitHub Pages.

## Editing

| What | Where |
|---|---|
| Home page copy | `index.html` |
| CV | `cv/index.html` |
| Books / films / games data | `assets/data.js` |
| Colours, type, layout | `assets/style.css` (palette is the `:root` block at the top) |
| Chart + list rendering | `assets/charts.js` |
| Light/dark toggle | `assets/theme.js` |

Swap `assets/photo.svg` for a real `photo.jpg` and update the `<img class="portrait">` tag in `index.html`.

## Preview locally

```sh
python3 -m http.server -d . 8000
# then open http://localhost:8000
```

## Publish

Commit and push to `main`. GitHub Pages redeploys automatically.
