# Audio assets

Two looping background tracks power the site's sound. Both are bundled and
free-to-use; the player fails silently if a file is ever missing, so the site
still works without them.

| File          | Where it plays                         | Track                                   |
| ------------- | -------------------------------------- | --------------------------------------- |
| `ambient.mp3` | Main page — cozy hum, plays by default | "I Went To The Woods (Instrumental)"    |
| `spectre.mp3` | Story Mode (the "Play the Story" view) | Alan Walker — Spectre [NCS Release]      |

## Credits / licensing

- **ambient.mp3** — CC0 1.0 (Public Domain), via the Internet Archive:
  https://archive.org/details/i-went-to-the-woods-instrumental
  (re-encoded to 128 kbps to keep the page light). No attribution required.
- **spectre.mp3** — Alan Walker — Spectre, released by NoCopyrightSounds (NCS),
  free to use with credit: https://ncs.io/spectre
  Source archive: https://archive.org/details/alan-walker-spectre-ncs-release-audio

## Behaviour notes

- Browsers block autoplay-with-sound until the first click/keypress, so the
  ambient track starts the moment the visitor first interacts with the page.
- Clicking "Play the Story" ducks the ambient hum out and brings up Spectre;
  exiting restores the hum.
- The floating speaker button (bottom-right) mutes/unmutes everything and the
  choice is remembered via `localStorage`.

To swap either track, just replace the file with the same name.
