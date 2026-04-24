# Image Converter — Technical Documentation

**Project:** still-image-converter  
**Repository:** [github.com/matthewstraub/still-image-converter](https://github.com/matthewstraub/still-image-converter)  
**Live URL:** [still-image-converter.onrender.com](https://still-image-converter.onrender.com)  
**Last Updated:** April 2026

---

## 1. Overview

The Image Converter is a client-side web application that accepts any common image format via drag-and-drop (or file picker), crops and scales it to fill a 1920x1080 canvas using a "cover-fill" algorithm, and produces downloadable JPG and PNG files. All image processing happens entirely in the browser using the HTML5 Canvas API — no files are ever uploaded to a server.

The application also provides an adjustable crop position slider, allowing users to control which region of the source image is preserved when the aspect ratio does not match 16:9. The preview updates in real time as the slider is moved.

---

## 2. Tech Stack

The following table summarizes every major technology used in the project, its role, and why it was chosen.

| Technology | Version | Role | Notes |
|---|---|---|---|
| **React** | 19.2.x | UI framework | Component-based architecture with hooks |
| **TypeScript** | 5.6.3 | Type safety | Strict typing across all source files |
| **Vite** | 7.1.x | Build tool and dev server | Fast HMR, ESM-native bundling |
| **Tailwind CSS** | 4.1.x | Utility-first styling | OKLCH color format for theme tokens |
| **shadcn/ui** | — | Pre-built UI primitives | Slider, Button, Tooltip, Sonner (toasts) |
| **Radix UI** | Various | Accessible component primitives | Powers shadcn/ui under the hood |
| **Framer Motion** | 12.x | Animations and transitions | Page transitions, entrance animations |
| **Lucide React** | 0.453.x | Icon library | Consistent monoline icon set |
| **Wouter** | 3.3.x | Client-side routing | Lightweight alternative to React Router |
| **Sonner** | 2.0.x | Toast notifications | Error and success feedback |
| **pnpm** | 10.4.x | Package manager | Fast, disk-efficient dependency management |
| **esbuild** | 0.25.x | Server bundler | Bundles the minimal Express server for production |
| **Express** | 4.21.x | Static file server (production) | Serves the built `dist/public` directory |
| **Render.com** | — | Hosting platform | Static site deployment with auto-deploy from GitHub |

### 2.1 Fonts

The application uses two Google Fonts loaded via CDN in `client/index.html`:

- **DM Sans** (weights 400, 500, 600, 700) — used for headings and body text.
- **JetBrains Mono** (weights 400, 500, 600) — used for metadata, labels, file sizes, and all monospaced UI elements.

These are configured in `client/src/index.css` via the `--font-sans` and `--font-mono` CSS custom properties.

---

## 3. Project Structure

The application follows a standard Vite + React project layout. Only the files that contain custom application logic are described below; the `components/ui/` directory contains unmodified shadcn/ui primitives.

```
image-converter/
├── client/
│   ├── index.html                          # HTML entry point, Google Fonts
│   └── src/
│       ├── App.tsx                          # Root component, routing, theme
│       ├── main.tsx                         # React DOM entry point
│       ├── index.css                        # Global styles, Tailwind theme tokens
│       ├── pages/
│       │   ├── Home.tsx                     # Main page — drop zone, preview, controls
│       │   └── NotFound.tsx                 # 404 fallback
│       ├── components/
│       │   ├── DropZone.tsx                 # Drag-and-drop / file picker area
│       │   ├── ImagePreview.tsx             # Original + converted image preview
│       │   ├── InfoPanel.tsx                # File metadata + download buttons
│       │   ├── CropPositionControl.tsx      # Slider for adjusting crop offset
│       │   ├── ErrorBoundary.tsx            # React error boundary wrapper
│       │   └── ui/                          # shadcn/ui components (slider, button, etc.)
│       ├── hooks/
│       │   └── useImageConverter.ts         # Core conversion logic and state
│       ├── contexts/
│       │   └── ThemeContext.tsx             # Dark/light theme provider
│       └── lib/
│           └── utils.ts                    # Tailwind merge utility
├── server/
│   └── index.ts                            # Express static server (production only)
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 4. How the Image Conversion Works

The entire conversion pipeline is contained in the custom React hook `useImageConverter.ts`. This section explains the algorithm in detail.

### 4.1 Input Handling

When a user drops an image file (or selects one via the file picker), the `processImage` function is called. It first validates that the file's MIME type starts with `image/`, then loads it into an `HTMLImageElement` using `URL.createObjectURL()`. This gives access to the image's `naturalWidth` and `naturalHeight` properties, which represent the true pixel dimensions of the source.

### 4.2 Aspect Ratio Comparison

The target output is always **1920 x 1080 pixels**, which has an aspect ratio of approximately **1.778:1** (16:9). The algorithm compares the source image's aspect ratio against this target:

- If the source aspect ratio is **greater than** 16:9 (i.e., the image is proportionally wider), the image is taller than needed when scaled to width, so the **sides are cropped** (horizontal axis).
- If the source aspect ratio is **less than** 16:9 (i.e., the image is proportionally taller), the image is wider than needed when scaled to height, so the **top and bottom are cropped** (vertical axis).
- If the source aspect ratio **matches** 16:9 (within a tolerance of 0.01), no cropping is needed and the image is simply scaled.

### 4.3 Cover-Fill Crop Calculation

The algorithm calculates a source rectangle (`sx`, `sy`, `sw`, `sh`) that represents the portion of the original image to draw onto the 1920x1080 canvas. This is the same behavior as CSS `object-fit: cover`.

For a **wider-than-16:9** source image:

```
sh = naturalHeight           (use full height)
sw = sh × (1920 / 1080)     (width that matches 16:9 at that height)
sx = (naturalWidth - sw) × cropOffset   (slide left/right)
sy = 0
```

For a **taller-than-16:9** source image:

```
sw = naturalWidth            (use full width)
sh = sw / (1920 / 1080)     (height that matches 16:9 at that width)
sx = 0
sy = (naturalHeight - sh) × cropOffset  (slide up/down)
```

The `cropOffset` value ranges from **0.0 to 1.0**, where 0.0 means the crop window is positioned at the top-left edge and 1.0 means it is positioned at the bottom-right edge. The default is **0.5** (centered).

### 4.4 Canvas Rendering

A temporary `<canvas>` element is created with dimensions 1920x1080. The `drawImage` method is called with the computed source rectangle, drawing the cropped region onto the full canvas:

```typescript
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = "high";
ctx.drawImage(img, sx, sy, sw, sh, 0, 0, 1920, 1080);
```

High-quality image smoothing is enabled to ensure the best possible downscaling or upscaling result.

### 4.5 Output Generation

The canvas is then exported to two formats using `canvas.toBlob()`:

| Format | MIME Type | Quality Setting | Notes |
|---|---|---|---|
| **JPG** | `image/jpeg` | 0.92 (92%) | Lossy compression, smaller file size |
| **PNG** | `image/png` | N/A (lossless) | Lossless, larger file size, supports transparency |

Both blobs are stored in React state along with their byte sizes, and a JPEG data URL is generated for the live preview.

### 4.6 Crop Position Adjustment

When the user moves the crop position slider, the `cropOffset` state updates, which triggers a debounced `useEffect` (50ms delay) that re-runs the conversion with the new offset. This provides near-real-time preview updates without overwhelming the browser during rapid slider movement.

### 4.7 Download Mechanism

Downloads are triggered by creating a temporary `<a>` element with a `download` attribute, setting its `href` to a blob URL created from the converted image data, programmatically clicking it, and then cleaning up. The output filename follows the pattern `{original_name}_1920x1080.{ext}`.

---

## 5. Component Architecture

### 5.1 Home (Page)

The main page manages two visual states using `AnimatePresence` for smooth transitions:

- **Empty state:** Shows the `DropZone` component centered on the page, along with a three-step instructional guide.
- **Image loaded state:** Switches to a split-panel layout with the `ImagePreview` on the left (flex-3) and a right sidebar (320px) containing the `CropPositionControl` and `InfoPanel`.

### 5.2 DropZone

Handles drag-and-drop events (`dragenter`, `dragleave`, `dragover`, `drop`) with a counter-based approach to prevent flickering when dragging over child elements. Also supports click-to-browse via a hidden `<input type="file" accept="image/*">`. Visual feedback changes the border color to amber and displays "RELEASE TO CONVERT" during drag-over.

### 5.3 ImagePreview

Displays the converted 1920x1080 image as the primary view with a "1920 x 1080" badge overlay. Below the main preview, a small thumbnail strip shows the original image with its filename and dimensions for reference.

### 5.4 CropPositionControl

Renders a Radix UI `Slider` component when cropping is applicable. It automatically detects whether the adjustment axis is horizontal or vertical based on the source image's aspect ratio and labels the slider accordingly (LEFT/RIGHT or TOP/BOTTOM). When the source image already matches 16:9, it displays a locked state with the message "Image matches 16:9 — no cropping needed."

### 5.5 InfoPanel

Displays two metadata cards (Source and Output) with monospaced labels showing dimensions, file size, format, and aspect ratio. Below the metadata, three download options are presented: individual JPG and PNG buttons (showing file size), and a prominent "DOWNLOAD BOTH" button. A "NEW FILE" reset button in the header clears the current image and returns to the drop zone.

---

## 6. Design System

The application follows an **Industrial Utility** design philosophy inspired by Swiss/Industrial aesthetics. Key design decisions are documented below for consistency in future modifications.

| Element | Value | Purpose |
|---|---|---|
| Background | `oklch(0.1 0.005 250)` | Near-black workspace |
| Primary accent | `oklch(0.82 0.17 80)` | Electric amber for interactive elements |
| Text (primary) | `oklch(0.92 0.01 80)` | Warm off-white for headings |
| Text (secondary) | `oklch(0.5 0.01 250)` | Muted gray for labels |
| Border (default) | `oklch(0.2 0.005 250)` | Subtle separation lines |
| Border (hover) | `oklch(0.82 0.17 80 / 50%)` | Amber glow on interaction |
| Heading font | DM Sans, 500–700 | Clean, geometric sans-serif |
| Mono font | JetBrains Mono, 400–600 | Technical metadata and labels |
| Corner radius | 0.65rem (base) | Consistent rounding |
| Theme | Dark only | Fixed dark theme via ThemeProvider |

All colors use the **OKLCH** color space, which is required by Tailwind CSS v4's `@theme inline` blocks.

---

## 7. Deployment

### 7.1 Current Hosting: Render.com

The application is deployed as a **Static Site** on Render.com, connected to the GitHub repository `matthewstraub/still-image-converter`. Render automatically rebuilds and redeploys whenever changes are pushed to the `main` branch.

| Setting | Value |
|---|---|
| **Service type** | Static Site |
| **Repository** | matthewstraub/still-image-converter |
| **Branch** | main |
| **Build command** | `pnpm install && pnpm run build` |
| **Publish directory** | `dist/public` |
| **URL** | https://still-image-converter.onrender.com |

### 7.2 Build Process

The build is a two-step process defined in `package.json`:

1. **`vite build`** — Compiles the React application, processes Tailwind CSS, tree-shakes unused code, and outputs optimized static assets to `dist/public/`.
2. **`esbuild server/index.ts`** — Bundles the Express server to `dist/index.js`. This is only used if running the app with `pnpm start` (Node.js server mode) rather than as a pure static site.

For the Render static site deployment, only the `dist/public/` output is used. The Express server is not involved.

### 7.3 Local Development

To run the application locally:

```bash
git clone https://github.com/matthewstraub/still-image-converter.git
cd still-image-converter
pnpm install
pnpm dev
```

The Vite dev server starts at `http://localhost:3000` with hot module replacement (HMR) enabled.

### 7.4 Environment Variables

The application references two analytics-related environment variables in `client/index.html` that are injected by the Manus hosting platform. These are **not required** for the app to function and can be safely ignored in other hosting environments:

- `VITE_ANALYTICS_ENDPOINT` — Analytics script URL (Umami)
- `VITE_ANALYTICS_WEBSITE_ID` — Analytics site identifier

Vite will emit warnings about these during build if they are not defined, but the build completes successfully regardless.

---

## 8. Maintenance Guide

### 8.1 Changing the Output Resolution

The target dimensions are defined as constants at the top of `client/src/hooks/useImageConverter.ts`:

```typescript
const TARGET_WIDTH = 1920;
const TARGET_HEIGHT = 1080;
const TARGET_ASPECT = TARGET_WIDTH / TARGET_HEIGHT;
```

To change the output resolution, update these three values. The rest of the algorithm adapts automatically.

### 8.2 Adjusting JPG Quality

The JPEG compression quality is set in the `convertWithOffset` function:

```typescript
const jpgBlob = await canvasToBlob(canvas, "image/jpeg", 0.92);
```

The quality parameter ranges from 0.0 (maximum compression, lowest quality) to 1.0 (minimum compression, highest quality). The current value of **0.92** provides a good balance between file size and visual fidelity.

### 8.3 Adding New Output Formats

To add a new output format (e.g., WebP), add a new `canvasToBlob` call in the `convertWithOffset` function and extend the `ConvertedImage` interface with the new blob and size fields. Then add a corresponding download button in `InfoPanel.tsx`.

### 8.4 Updating Dependencies

Dependencies are managed with pnpm. To update all packages:

```bash
pnpm update
```

To update a specific package:

```bash
pnpm update <package-name>
```

After updating, run `pnpm dev` to verify nothing is broken, then push to `main` to trigger a Render redeploy.

### 8.5 Styling Changes

All theme tokens are defined in `client/src/index.css` using CSS custom properties within the `:root` and `.dark` selectors. The amber accent color `oklch(0.82 0.17 80)` appears frequently in component files as inline Tailwind classes. To change the accent color globally, search for this value across all `.tsx` files and replace it.

### 8.6 Known Build Warnings

The following warnings appear during build and are safe to ignore:

- **`%VITE_ANALYTICS_ENDPOINT% is not defined`** — Analytics variables from Manus hosting; not needed for the app to function.
- **`Ignored build scripts: @tailwindcss/oxide, esbuild`** — pnpm security feature that blocks post-install scripts from certain packages. These packages work correctly without their build scripts in this context.

---

## 9. Browser Compatibility

The application relies on the following Web APIs, all of which are supported in modern browsers:

| API | Used For | Support |
|---|---|---|
| HTML5 Canvas | Image rendering and conversion | All modern browsers |
| `canvas.toBlob()` | Generating JPG/PNG binary data | All modern browsers |
| `URL.createObjectURL()` | Image preview and download URLs | All modern browsers |
| Drag and Drop API | File drag-and-drop handling | All modern browsers (desktop) |
| File API | Reading dropped/selected files | All modern browsers |

The application works in Chrome, Firefox, Safari, and Edge. Mobile browsers support the file picker but not drag-and-drop; the click-to-browse fallback ensures full functionality on mobile devices.

---

## 10. Privacy and Security

All image processing occurs entirely within the user's browser. No image data is transmitted to any server at any point. The application does not use cookies, local storage, or any form of persistent data storage. Each session starts fresh, and closing the tab discards all processed data.

The only external network requests are for loading Google Fonts (DM Sans, JetBrains Mono) and the hero background image from a CDN.
