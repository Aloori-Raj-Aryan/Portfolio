# Portfolio Website

A clean, one-page portfolio template with placeholders for images and videos.

## Files

- `index.html` - page structure and portfolio sections
- `styles.css` - styling and responsive layout
- `script.js` - mobile menu toggle and footer year
- `assets/images/` - put your images here
- `assets/videos/` - put your videos here

## Run Locally

You can open `index.html` directly in your browser.

Better option (recommended): start a local server from this folder:

```bash
python3 -m http.server 8000
```

Then open: <http://localhost:8000>

## Replace Placeholders

1. Replace `Your Name` and text content in `index.html`
2. Add your profile image:
   - File path used by default: `assets/images/profile-placeholder.jpg`
3. Add project images:
   - `assets/images/project-1.jpg`
   - `assets/images/project-2.jpg`
   - `assets/images/project-3.jpg`
4. Add a video poster image (optional):
   - `assets/images/video-poster.jpg`
5. Add your showcase video:
   - `assets/videos/showreel-placeholder.mp4`
6. Update project and contact links in the Projects and Contact sections

## Customize Quickly

- Change colors in `styles.css` under the `:root` section
- Edit section titles and text in `index.html`
- Add more project cards by copying one `<article class="card project-card">...</article>`
