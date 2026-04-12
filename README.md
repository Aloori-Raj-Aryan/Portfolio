# Portfolio Website

A clean, one-page portfolio template with placeholders for images and videos.

## Files

- `index.html` - page structure and portfolio sections
- `styles.css` - styling and responsive layout
- `script.js` - mobile menu toggle and footer year
- `assets/images/` - put your images here
- `assets/videos/` - put your videos here
- `assets/projects/` - project folders used by the dynamic projects section

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
6. Add dynamic project folders under `assets/projects/`:
   - Each project gets a folder, e.g. `assets/projects/AI_image_tracking/`
   - Use `intro.md` for title and description
   - Add `image.png` for the card image
   - Add `video.mp4` for an optional demo video

## Customize Quickly

- Change colors in `styles.css` under the `:root` section
- Edit section titles and text in `index.html`
- Add more project cards by copying one `<article class="card project-card">...</article>`
