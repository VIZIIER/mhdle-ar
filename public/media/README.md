# Media folder

Put files here named after monster ids from `src/data/monsters.json`:

- `images/<id>.webp` (or png/jpg/avif): enables **Surveyor** and the picture on win screens
- `audio/<id>.mp3` (or ogg/m4a/wav): enables **Roar**
- `icons/<id>.webp` (or png/svg): small icons for search results, guess lists and the Classic grid
- `ui/`: mode emblems, the Palico and its horn sound (fixed file names, see `src/components/ModeIcon.tsx`)

Run `npm run dev` or `npm run build`; the manifest is regenerated automatically.

The files shipped here come from the original MHDLE site. Monster renders, icons and roars are Capcom's property and are included as fan use only; they are not covered by the project's licences.
