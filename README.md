# srt-shift-core

SRT subtitle shifting: parse, shift by milliseconds, detect overlaps,
serialize renumbered. Zero runtime dependencies, Node >= 22.

Part of the LOFRANO TECNOLOGIA open-source lab. MIT.

```js
import { parseSRT, shiftCues, formatSRT } from './src/srt.mjs';
formatSRT(shiftCues(parseSRT(srtText), 2500)); // +2.5s, renumbered
```

```sh
npm test          # 8 tests, node:test, no dependencies
npm run demo
```

At most 5000 cues, shifts within ±10h, negative results throw instead of
clipping. MIT — see `LICENSE`. [Versão em português](README.pt-BR.md).
