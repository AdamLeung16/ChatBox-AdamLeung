var currentApiKey = 'sk-rbzickexnungolrgsevneipmyebliqbddrsttvbcjncnnivm';

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
        const statusElement = document.getElementById('currentKeyStatus');
        statusElement.textContent = apiKey;
        statusElement.style.color = '#28a745';

        setTimeout(() => {
            hideApiKeyManager();
        }, 1000);
    } else {
        alert('请输入有效的 API Key');
    }
}

function defaultApiKey() {
    if (confirm('确定要恢复成默认的 API Key 吗？')) {
        currentApiKey = 'sk-rbzickexnungolrgsevneipmyebliqbddrsttvbcjncnnivm';

        // 显示删除成功提示
        const statusElement = document.getElementById('currentKeyStatus');
        statusElement.textContent = 'sk-***...***';
        statusElement.style.color = '#dc3545';

        setTimeout(() => {
            hideApiKeyManager();
        }, 1000);
    }
}


// 格式化消息文本
function formatMessage(text) {
    if (!text) return '';
    
    // 处理标题和换行
    let lines = text.split('\n');
    let formattedLines = lines.map(line => {
        // 处理标题（**文本**）
        line = line.replace(/\*\*(.*?)\*\*/g, '<span class="bold-text">$1</span>');
        return line;
    });
    
    // 将 ### 替换为换行，并确保每个部分都是一个段落
    let processedText = formattedLines.join('\n');
    let sections = processedText
        .split('###')
        .filter(section => section.trim())
        .map(section => {
            // 移除多余的换行和空格
            let lines = section.split('\n').filter(line => line.trim());
            
            if (lines.length === 0) return '';
            
            // 处理每个部分
            let result = '';
            let currentIndex = 0;
            
            while (currentIndex < lines.length) {
                let line = lines[currentIndex].trim();
                
                // 如果是数字开头（如 "1.")
                if (/^\d+\./.test(line)) {
                    result += `<p class="section-title">${line}</p>`;
                }
                // 如果是小标题（以破折号开头）
                else if (line.startsWith('-')) {
                    result += `<p class="subsection"><span class="bold-text">${line.replace(/^-/, '').trim()}</span></p>`;
                }
                // 如果是正文（包含冒号的行）
                else if (line.includes(':')) {
                    let [subtitle, content] = line.split(':').map(part => part.trim());
                    result += `<p><span class="subtitle">${subtitle}</span>: ${content}</p>`;
                }
                // 普通文本
                else {
                    result += `<p>${line}</p>`;
                }
                currentIndex++;
            }
            return result;
        });
    
    return sections.join('');
}

// 显示静态消息
function displayMessage(role, message) {
    const messagesContainer = document.getElementById('messages');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${role}`;
    
    const avatar = document.createElement('img');
    avatar.src = role === 'user' ? 'user-avatar.png' : 'bot-avatar.png';
    avatar.alt = role === 'user' ? 'User' : 'Bot';

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    // 用户消息直接显示，机器人消息需要格式化
    messageContent.innerHTML = role === 'user' ? message : formatMessage(message);

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
    avatar.src = role === 'user' ? 'user-avatar.png' : 'bot-avatar.png';
    avatar.alt = role === 'user' ? 'User' : 'Bot';

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageElement.appendChild(avatar);
    messageElement.appendChild(messageContent);
    messagesContainer.appendChild(messageElement);
    return [messageContent,messageElement];
}
function updateMessage(messageContent,content) {
    messageContent.innerHTML += content;
}
function endMessage(messageContent,messageElement) {
    messageContent.innerHTML = formatMessage(messageContent.innerHTML);
    messageElement.scrollIntoView({ behavior: 'smooth' });
}

var messagesList = [];

async function sendMessage() {
    const inputElement = document.getElementById('chat-input');
    const modelElement = document.getElementById('model-selector');
    const message = inputElement.value;
    const currentModel = modelElement.value;
    if (!message.trim()) return;

    displayMessage('user', message);
    messagesList.push({role: "user", content: message});
    inputElement.value = '';

    // 显示加载动画
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = 'block';
    }

    const apiKey = currentApiKey;
    const endpoint = 'https://api.siliconflow.cn/v1/chat/completions';

    const payload = {
        model: currentModel,
        messages: messagesList,
        stream: true
    };

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload)
    })
    try{
        // if(response.ok) displayMessage('bot', "ok.200");
        const reader = response.body.getReader();
        let decoder = new TextDecoder();
        let chunks = "";
        let messageResult = createMessage('bot');
        let messageContent = messageResult[0];
        let messageElement = messageResult[1];
        while (true) {
            const { done, value } = await reader.read();
            var text = decoder.decode(value, { stream: true });
            if (done) {
                endMessage(messageContent,messageElement);
                messagesList.push({role: "assistant", content: chunks});
                if (loadingElement) {
                    loadingElement.style.display = 'none';
                }
                break;
            }
            // 解码每个分块的数据
            let contents = extractContentFromSSE(text);
            for(let content of contents){
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

function extractContentFromSSE(sseString) {
    try {
        const events = sseString.split('\n\n').slice(0,-1);
        var contents = [];
        for(var i=0;i<events.length;i++){
            const jsonStr = events[i].slice(6);
            if (jsonStr=="[DONE]") break;
            const data = JSON.parse(jsonStr);
            var content = data.choices[0].delta.content;
            if (content==null||content=="") continue;
            contents.push(content);
      }
      return contents;
    } catch (error) {
        displayMessage('bot', error.toString());
        return [];
    }
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

// 添加回车发送功能
document.getElementById('chat-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
});