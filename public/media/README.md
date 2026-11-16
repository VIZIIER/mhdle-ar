# Media folder

Files are named after monster ids from `src/data/monsters.json`:

- `images/<id>.webp` (or png/jpg/avif): **Surveyor** pictures and the picture on win screens
- `audio/<id>.mp3` (or ogg/m4a/wav): **Roar** sounds
- `icons/<id>.webp` (or png/svg): small icons for search results, guess lists and the Classic grid
- `ui/`: the Palico and its horn sound for the Classic colour key

Run `npm run dev` or `npm run build`; the manifest is regenerated automatically.

The files shipped here come from the original MHDLE site. Monster renders, icons and roars are Capcom's property and are included as fan use only; they are not covered by the project's licences. See `docs/DATA_SOURCES.md`.
