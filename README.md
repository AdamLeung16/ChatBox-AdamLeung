# ChatBox-AdamLeung

A chatting robot based on LLMs(e.g. DeepSeek), developed by AdamLeung.

URL: [https://adamleung16.github.io/ChatBox-AdamLeung/](https://adamleung16.github.io/ChatBox-AdamLeung/)

## API Key configuration

API keys are no longer stored in `script.js`.

For local development:

1. Copy `.env.example` to `.env`.
2. Fill in `DEEPSEEK_API_KEY` and/or `SILICONFLOW_API_KEY`.
3. Start the local server:

```bash
node server.mjs
```

Then open [http://localhost:8000](http://localhost:8000).

For GitHub Pages deployment:

1. Add repository secrets named `DEEPSEEK_API_KEY` and `SILICONFLOW_API_KEY`.
2. Enable GitHub Pages with GitHub Actions as the source.
3. Push to `main` or run the `Deploy GitHub Pages` workflow manually.

Note: GitHub Secrets keep the keys out of the repository, but a pure static GitHub Pages app still sends the runtime key to the browser. Use a backend proxy if the key must be truly hidden from users.

### Supported models

| Platform                 | Model             |
| ------------------------ | ----------------- |
| **DeepSeek (official)** | DeepSeek-V4-Flash |
|                          | DeepSeek-V4-Pro   |

| Platform                  | Model                  |
| ------------------------- | ---------------------- |
| **SiliconFlow (bridge)** | DeepSeek-V4-Flash      |
|                           | DeepSeek-V4-Pro        |
|                           | DeepSeek-V3.2 Pro      |
|                           | DeepSeek-V3.2          |
|                           | Qwen3.6-35B-A3B        |
|                           | Qwen3.6-27B            |
|                           | Qwen3.5-397B-A17B      |
|                           | GLM-5.1 Pro            |
|                           | Kimi-K2.6 Pro          |
