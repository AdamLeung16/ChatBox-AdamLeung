import { createReadStream, existsSync, readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.PORT || 8000);
const host = '127.0.0.1';

const mimeTypes = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.png': 'image/png'
};

function readDotEnv() {
    const envPath = join(rootDir, '.env');
    if (!existsSync(envPath)) return {};

    return readFileSync(envPath, 'utf8')
        .split(/\r?\n/)
        .reduce((env, line) => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) return env;

            const separatorIndex = trimmed.indexOf('=');
            if (separatorIndex === -1) return env;

            const key = trimmed.slice(0, separatorIndex).trim();
            const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');
            env[key] = value;
            return env;
        }, {});
}

function createEnvJs() {
    const env = readDotEnv();
    const apiKeys = {
        'https://api.deepseek.com/v1/chat/completions': env.DEEPSEEK_API_KEY || '',
        'https://api.siliconflow.cn/v1/chat/completions': env.SILICONFLOW_API_KEY || ''
    };

    return `window.CHATBOX_API_KEYS = ${JSON.stringify(apiKeys)};\n`;
}

createServer((request, response) => {
    const url = new URL(request.url || '/', `http://${host}:${port}`);

    if (url.pathname === '/env.js') {
        response.writeHead(200, {
            'Cache-Control': 'no-store',
            'Content-Type': 'text/javascript; charset=utf-8'
        });
        response.end(createEnvJs());
        return;
    }

    const relativePath = url.pathname === '/' ? '/index.html' : url.pathname;
    const normalizedPath = normalize(relativePath).replace(/^(\.\.[/\\])+/, '');
    const filePath = join(rootDir, normalizedPath);

    if (!filePath.startsWith(rootDir) || !existsSync(filePath)) {
        response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        response.end('Not found');
        return;
    }

    response.writeHead(200, { 'Content-Type': mimeTypes[extname(filePath)] || 'application/octet-stream' });
    createReadStream(filePath).pipe(response);
}).listen(port, host, () => {
    console.log(`ChatBox local server running at http://${host}:${port}`);
});
