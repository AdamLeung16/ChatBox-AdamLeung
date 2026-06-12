const endpoint_ApiKey = window.CHATBOX_API_KEYS || {};
var currentApiKey = '';
var endpoint_models = {
    "https://api.deepseek.com/v1/chat/completions": [
        { value: "deepseek-v4-flash", text: "DeepSeek-V4-Flash" },
        { value: "deepseek-v4-pro", text: "DeepSeek-V4-Pro" }
    ],
    "https://api.siliconflow.cn/v1/chat/completions": [
        { value: "deepseek-ai/DeepSeek-V4-Flash", text: "DeepSeek-V4-Flash" },
        { value: "deepseek-ai/DeepSeek-V4-Pro", text: "DeepSeek-V4-Pro" },
        { value: "Pro/deepseek-ai/DeepSeek-V3.2", text: "DeepSeek-V3.2 Pro" },
        { value: "deepseek-ai/DeepSeek-V3.2", text: "DeepSeek-V3.2" },
        { value: "Qwen/Qwen3.6-35B-A3B", text: "Qwen3.6-35B-A3B" },
        { value: "Qwen/Qwen3.6-27B", text: "Qwen3.6-27B" },
        { value: "Qwen/Qwen3.5-397B-A17B", text: "Qwen3.5-397B-A17B" },
        { value: "Pro/zai-org/GLM-5.1", text: "GLM-5.1 Pro" },
        { value: "Pro/moonshotai/Kimi-K2.6", text: "Kimi-K2.6 Pro" }
    ]
};

function models_from_endpoint(){
    // 获取 endpoint 和 model 的下拉栏元素
    const endpointSelector = document.getElementById('endpoint-selector');
    const modelSelector = document.getElementById('model-selector');
    const selectedEndpoint = endpointSelector.value;
    const models = endpoint_models[selectedEndpoint] || [];

    // 清空当前的 model 选项
    modelSelector.innerHTML = '';

    // 添加新的 model 选项
    models.forEach(model => {
        const option = document.createElement('option');
        option.value = model.value;
        option.text = model.text;
        modelSelector.appendChild(option);
    });
    initialApiKey();
}
// 手动触发初始化
document.getElementById('endpoint-selector').dispatchEvent(new Event('change'));

// API Key 管理功能
function showApiKeyManager() {
    const modal = document.getElementById('apiKeyManager');
    modal.style.display = 'flex';
}

function hideApiKeyManager() {
    const modal = document.getElementById('apiKeyManager');
    modal.style.display = 'none';
}
function updateApiKey() {
    const input = document.getElementById('apiKeyInput');
    const apiKey = input.value.trim();

    if (apiKey) {
        currentApiKey = apiKey;

        // 显示成功提示
        updateApiKeyStatus();

        setTimeout(() => {
            hideApiKeyManager();
        }, 1000);
    } else {
        alert('请输入有效的 API Key');
    }
}

function defaultApiKey() {
    if (confirm('确定要恢复成默认的 API Key 吗？')) {
        const endpointSelector = document.getElementById('endpoint-selector');
        currentApiKey = endpoint_ApiKey[endpointSelector.value];

        // 显示删除成功提示
        const statusElement = document.getElementById('currentKeyStatus');
        updateApiKeyStatus();

        setTimeout(() => {
            hideApiKeyManager();
        }, 1000);
    }
}

function initialApiKey() {
    const endpointSelector = document.getElementById('endpoint-selector');
    currentApiKey = endpoint_ApiKey[endpointSelector.value] || '';
    updateApiKeyStatus();
}

function maskApiKey(apiKey) {
    if (!apiKey) return '未配置';
    if (apiKey.length <= 10) return '已配置';
    return `${apiKey.slice(0, 3)}***${apiKey.slice(-4)}`;
}

function updateApiKeyStatus() {
    const statusElement = document.getElementById('currentKeyStatus');
    const apiKeyStatus = document.getElementById('apiKeyStatus');
    if (!statusElement || !apiKeyStatus) return;

    if (currentApiKey) {
        statusElement.textContent = maskApiKey(currentApiKey);
        statusElement.style.color = '#28a745';
        apiKeyStatus.textContent = 'API Key 已配置';
    } else {
        statusElement.textContent = '未配置';
        statusElement.style.color = '#dc3545';
        apiKeyStatus.textContent = 'API Key 未配置';
    }
}


function escapeHtml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatInlineMarkdown(text) {
    return escapeHtml(text)
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/__([^_]+)__/g, '<strong>$1</strong>')
        .replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
}

function isTableSeparator(line) {
    return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function isTableRow(line) {
    return line.includes('|') && line.split('|').filter(cell => cell.trim()).length >= 2;
}

function splitTableRow(line) {
    return line
        .trim()
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map(cell => cell.trim());
}

function renderTable(lines) {
    const headerCells = splitTableRow(lines[0]);
    const bodyRows = lines.slice(2).filter(isTableRow).map(splitTableRow);
    const head = headerCells.map(cell => `<th>${formatInlineMarkdown(cell)}</th>`).join('');
    const body = bodyRows
        .map(row => `<tr>${row.map(cell => `<td>${formatInlineMarkdown(cell)}</td>`).join('')}</tr>`)
        .join('');

    return `<div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}

function collectParagraph(lines, startIndex) {
    const paragraphLines = [];
    let index = startIndex;

    while (index < lines.length) {
        const line = lines[index];
        const trimmed = line.trim();
        if (
            !trimmed ||
            trimmed.startsWith('```') ||
            /^#{1,6}\s+/.test(trimmed) ||
            /^>\s?/.test(trimmed) ||
            /^[-*]\s+/.test(trimmed) ||
            /^\d+\.\s+/.test(trimmed) ||
            (isTableRow(trimmed) && isTableSeparator(lines[index + 1] || ''))
        ) {
            break;
        }
        paragraphLines.push(trimmed);
        index++;
    }

    return {
        html: `<p>${formatInlineMarkdown(paragraphLines.join(' '))}</p>`,
        nextIndex: index
    };
}

// 格式化 AI 消息文本，支持常见 Markdown 结构
function formatMessage(text) {
    if (!text) return '';

    const lines = text.replace(/\r\n/g, '\n').split('\n');
    const htmlParts = [];
    let index = 0;

    while (index < lines.length) {
        const line = lines[index];
        const trimmed = line.trim();

        if (!trimmed) {
            index++;
            continue;
        }

        if (trimmed.startsWith('```')) {
            const language = trimmed.replace(/^```/, '').trim();
            const codeLines = [];
            index++;
            while (index < lines.length && !lines[index].trim().startsWith('```')) {
                codeLines.push(lines[index]);
                index++;
            }
            if (index < lines.length) index++;
            htmlParts.push(
                `<pre><code data-language="${escapeHtml(language)}">${escapeHtml(codeLines.join('\n'))}</code></pre>`
            );
            continue;
        }

        if (isTableRow(trimmed) && isTableSeparator(lines[index + 1] || '')) {
            const tableLines = [trimmed, lines[index + 1].trim()];
            index += 2;
            while (index < lines.length && isTableRow(lines[index].trim())) {
                tableLines.push(lines[index].trim());
                index++;
            }
            htmlParts.push(renderTable(tableLines));
            continue;
        }

        const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
        if (headingMatch) {
            const level = Math.min(Math.max(headingMatch[1].length, 3), 6);
            htmlParts.push(`<h${level}>${formatInlineMarkdown(headingMatch[2])}</h${level}>`);
            index++;
            continue;
        }

        if (/^>\s?/.test(trimmed)) {
            const quoteLines = [];
            while (index < lines.length && /^>\s?/.test(lines[index].trim())) {
                quoteLines.push(lines[index].trim().replace(/^>\s?/, ''));
                index++;
            }
            htmlParts.push(`<blockquote>${quoteLines.map(lineText => `<p>${formatInlineMarkdown(lineText)}</p>`).join('')}</blockquote>`);
            continue;
        }

        if (/^\d+\.\s+/.test(trimmed)) {
            const items = [];
            while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
                items.push(lines[index].trim().replace(/^\d+\.\s+/, ''));
                index++;
            }
            htmlParts.push(`<ol>${items.map(item => `<li>${formatInlineMarkdown(item)}</li>`).join('')}</ol>`);
            continue;
        }

        if (/^[-*]\s+/.test(trimmed)) {
            const items = [];
            while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
                items.push(lines[index].trim().replace(/^[-*]\s+/, ''));
                index++;
            }
            htmlParts.push(`<ul>${items.map(item => `<li>${formatInlineMarkdown(item)}</li>`).join('')}</ul>`);
            continue;
        }

        const paragraph = collectParagraph(lines, index);
        htmlParts.push(paragraph.html);
        index = paragraph.nextIndex;
    }

    return htmlParts.join('');
}

// 显示静态消息
function displayMessage(role, message) {
    const messagesContainer = document.getElementById('messages');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${role}`;
    
    const avatar = document.createElement('img');
    avatar.src = role === 'user' ? 'image/user.png' : 'image/bot.png';
    avatar.alt = role === 'user' ? 'User' : 'Bot';

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    // 用户消息直接显示，机器人消息需要格式化
    if (role === 'user') {
        messageContent.textContent = message;
    } else {
        messageContent.innerHTML = formatMessage(message);
    }

    messageElement.appendChild(avatar);
    messageElement.appendChild(messageContent);
    messagesContainer.appendChild(messageElement);
    
    // 平滑滚动到底部
    messageElement.scrollIntoView({ behavior: 'smooth' });
}
// 显示动态消息
function createMessage(role) {
    const messagesContainer = document.getElementById('messages');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${role}`;
    
    const avatar = document.createElement('img');
    avatar.src = role === 'user' ? 'image/user.png' : 'image/bot.png';
    avatar.alt = role === 'user' ? 'User' : 'Bot';

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageElement.appendChild(avatar);
    messageElement.appendChild(messageContent);
    messagesContainer.appendChild(messageElement);
    return [messageContent,messageElement];
}
function updateMessage(messageContent,content) {
    messageContent.textContent += content;
}
function endMessage(messageContent,messageElement) {
    messageContent.innerHTML = formatMessage(messageContent.textContent);
    messageElement.scrollIntoView({ behavior: 'smooth' });
}

var messagesList = [];

async function sendMessage() {
    const inputElement = document.getElementById('chat-input');
    const endpointElement = document.getElementById('endpoint-selector');
    const modelElement = document.getElementById('model-selector');
    const message = inputElement.value;
    const currentModel = modelElement.value;
    const endpoint = endpointElement.value;
    if (!message.trim()) return;

    displayMessage('user', message);
    messagesList.push({role: "user", content: message});
    inputElement.value = '';
    resizeChatInput(inputElement);

    // 显示加载动画
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = 'block';
    }

    const apiKey = currentApiKey;
    if (!apiKey) {
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        displayMessage('bot', '当前接口未配置 API Key。请在本地 .env 或 GitHub Secrets 中配置，或在 API Key 管理中手动输入。');
        return;
    }

    const payload = {
        model: currentModel,
        messages: messagesList,
        stream: true
    };

    try{
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `HTTP ${response.status}`);
        }
        if (!response.body) {
            throw new Error('当前浏览器不支持流式响应。');
        }

        // if(response.ok) displayMessage('bot', "ok.200");
        const reader = response.body.getReader();
        let decoder = new TextDecoder();
        let chunks = "";
        let sseBuffer = "";
        let messageResult = createMessage('bot');
        let messageContent = messageResult[0];
        let messageElement = messageResult[1];
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                sseBuffer += decoder.decode();
                let finalResult = extractContentFromSSE(sseBuffer, true);
                for (let content of finalResult.contents) {
                    updateMessage(messageContent, content);
                    chunks += content;
                }
                endMessage(messageContent,messageElement);
                messagesList.push({role: "assistant", content: chunks});
                if (loadingElement) {
                    loadingElement.style.display = 'none';
                }
                break;
            }
            // 解码每个分块的数据
            sseBuffer += decoder.decode(value, { stream: true });
            let sseResult = extractContentFromSSE(sseBuffer);
            sseBuffer = sseResult.remaining;
            for(let content of sseResult.contents){
                updateMessage(messageContent,content);
                chunks += content;
            }
        }
    }
    catch(error){
        // 隐藏加载动画
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }

        displayMessage('bot', '出错了，请稍后再试。'+error.toString());
        console.error('Error:', error);
    };

    // fetch(endpoint, {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': `Bearer ${apiKey}`
    //     },
    //     body: JSON.stringify(payload)
    // })
    // .then(response => response.json())
    // .then(data => {
    //     // 隐藏加载动画
    //     if (loadingElement) {
    //         loadingElement.style.display = 'none';
    //     }

    //     if (data.choices && data.choices.length > 0) {
    //         displayMessage('bot', data.choices[0].message.content);
    //     } else {
    //         displayMessage('bot', '出错了，请稍后再试。');
    //     }
    // })
    // .catch(error => {
    //     // 隐藏加载动画
    //     if (loadingElement) {
    //         loadingElement.style.display = 'none';
    //     }

    //     displayMessage('bot', '出错了，请稍后再试。');
    //     console.error('Error:', error);
    // });
}

function extractContentFromSSE(sseString, flush = false) {
    const normalized = sseString.replace(/\r\n/g, '\n');
    const events = normalized.split('\n\n');
    const remaining = flush ? '' : events.pop();
    const completeEvents = flush ? events.filter(event => event.trim()) : events;
    const contents = [];

    for (let event of completeEvents) {
        const dataLines = event
            .split('\n')
            .filter(line => line.startsWith('data:'))
            .map(line => line.replace(/^data:\s?/, ''));

        if (!dataLines.length) continue;

        const jsonStr = dataLines.join('\n').trim();
        if (!jsonStr || jsonStr === '[DONE]' || jsonStr === '-alive') continue;

        try {
            const data = JSON.parse(jsonStr);
            const content = data.choices?.[0]?.delta?.content
                ?? data.choices?.[0]?.message?.content
                ?? '';
            if (content) contents.push(content);
        } catch (error) {
            console.warn('Skipped malformed SSE event:', error, jsonStr);
        }
    }

    return { contents, remaining };
}

// 添加主题切换功能
function toggleTheme() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    document.body.classList.toggle('dark-mode');
    const chatContainer = document.querySelector('.chat-container');
    const messages = document.querySelector('.messages');
    const settingBar = document.querySelector('.settings-bar');
    
    // 同时切换容器的深色模式
    chatContainer.classList.toggle('dark-mode');
    messages.classList.toggle('dark-mode');
    settingBar.classList.toggle('dark-mode');
    
    // 保存主题
    document.getElementById('themeToggle').checked = !isDarkMode;
    localStorage.setItem('darkMode', !isDarkMode);
}

// 页面加载时检查主题设置
document.addEventListener('DOMContentLoaded', () => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.querySelector('.chat-container').classList.add('dark-mode');
        document.querySelector('.messages').classList.add('dark-mode');
        document.querySelector('.settings-bar').classList.add('dark-mode');
        document.getElementById('themeToggle').checked = true;
    }
});

// 添加下拉菜单功能
function toggleDropdown(event) {
    event.preventDefault();
    document.getElementById('dropdownMenu').classList.toggle('show');
}

// 点击其他地方关闭下拉菜单
window.onclick = function(event) {
    if (!event.target.matches('.dropdown button')) {
        const dropdowns = document.getElementsByClassName('dropdown-content');
        for (const dropdown of dropdowns) {
            if (dropdown.classList.contains('show')) {
                dropdown.classList.remove('show');
            }
        }
    }
}

function resizeChatInput(inputElement) {
    inputElement.style.height = 'auto';
    inputElement.style.height = `${Math.min(inputElement.scrollHeight, 180)}px`;
}

const chatInput = document.getElementById('chat-input');
chatInput.addEventListener('input', function() {
    resizeChatInput(this);
});

// 添加回车发送功能
chatInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
});
