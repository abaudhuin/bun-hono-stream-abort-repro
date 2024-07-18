# bun-hono-stream-abort-repro

## Fill the .env.template first and rename it to .env

To install dependencies:

```bash
bun install
```

## Reprod

Run the code:

```bash
bun run index3.ts
```

First request:

```bash
curl --location 'http://localhost:3000/t'
```

Ctrl+C the curl mid-way.

Second request:

```bash
curl --location 'http://localhost:3000/t'
```

The second request will hang without starting. (Same from any other request)
