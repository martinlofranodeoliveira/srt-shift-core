# srt-shift-core

Deslocamento de legendas SRT: interpreta, desloca por milissegundos,
detecta sobreposições e serializa renumerado. Zero dependências, Node >= 22.

Parte do laboratório open source da LOFRANO TECNOLOGIA. MIT.

```sh
npm test          # 8 testes, node:test, sem dependências
npm run demo
```

No máximo 5000 falas, deslocamentos de até ±10h; resultado negativo lança
erro em vez de cortar. MIT — veja `LICENSE`.
