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

### 1 Model supported

| Platform                 | Model       |
| ------------------------ | ----------- |
| **DeepSeek (official)** | Deepseek-V3 |
|                          | DeepSeek-R1 |

| Platform                  | Model                         |
| ------------------------- | ----------------------------- |
| **SiliconFlow (bridge)** | Deepseek-V3                   |
|                           | Deepseek-R1                   |
|                           | DeepSeek-R1-Distill-Llama-70B |
|                           | DeepSeek-R1-Distill-Llama-8B  |
|                           | QVQ-72B-Preview               |
