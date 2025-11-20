(function() {
    function initWidget() {
        // Get script element to read config
        const script = document.currentScript || document.querySelector('script[data-bot-token]');
        if (!script) {
            console.error('AI Chatbot: Script element not found.');
            return;
        }
        
        const botToken = script.getAttribute('data-bot-token');
        const apiUrl = script.getAttribute('data-api-url') || 'http://localhost:8000/api/chat/incoming'; 

        if (!botToken) {
            console.error('AI Chatbot: data-bot-token is required.');
            return;
        }

        // Create Styles
        const style = document.createElement('style');
        style.innerHTML = `
            #ai-chat-widget-container {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 9999;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            }
            #ai-chat-button {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background-color: #4F46E5;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.2s;
            }
            #ai-chat-button:hover {
                transform: scale(1.05);
            }
            #ai-chat-button svg {
                width: 30px;
                height: 30px;
                fill: white;
            }
            #ai-chat-window {
                position: fixed;
                bottom: 90px;
                right: 20px;
                width: 350px;
                height: 500px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 15px rgba(0,0,0,0.1);
                display: none;
                flex-direction: column;
                overflow: hidden;
                border: 1px solid #e5e7eb;
            }
            #ai-chat-header {
                background: #4F46E5;
                color: white;
                padding: 15px;
                font-weight: bold;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            #ai-chat-messages {
                flex: 1;
                padding: 15px;
                overflow-y: auto;
                background: #f9fafb;
            }
            .ai-message {
                margin-bottom: 10px;
                max-width: 80%;
                padding: 10px;
                border-radius: 10px;
                font-size: 14px;
                line-height: 1.4;
            }
            .ai-message.user {
                background: #4F46E5;
                color: white;
                align-self: flex-end;
                margin-left: auto;
            }
            .ai-message.bot {
                background: #e5e7eb;
                color: #1f2937;
                align-self: flex-start;
            }
            #ai-chat-input-area {
                padding: 15px;
                border-top: 1px solid #e5e7eb;
                display: flex;
            }
            #ai-chat-input {
                flex: 1;
                padding: 10px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                outline: none;
            }
            #ai-chat-send {
                margin-left: 10px;
                padding: 10px 15px;
                background: #4F46E5;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
            }
            #ai-chat-send:disabled {
                background: #9ca3af;
                cursor: not-allowed;
            }
        `;
        document.head.appendChild(style);

        // Create Container
        const container = document.createElement('div');
        container.id = 'ai-chat-widget-container';
        document.body.appendChild(container);

        // Create Button
        const button = document.createElement('div');
        button.id = 'ai-chat-button';
        button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
            </svg>
        `;
        container.appendChild(button);

        // Create Window
        const windowDiv = document.createElement('div');
        windowDiv.id = 'ai-chat-window';
        windowDiv.innerHTML = `
            <div id="ai-chat-header">
                <span>Chat Assistant</span>
                <span style="cursor:pointer" id="ai-chat-close">&times;</span>
            </div>
            <div id="ai-chat-messages"></div>
            <div id="ai-chat-input-area">
                <input type="text" id="ai-chat-input" placeholder="Type a message...">
                <button id="ai-chat-send">Send</button>
            </div>
        `;
        container.appendChild(windowDiv);

        // State
        let isOpen = false;
        let sessionId = localStorage.getItem('ai_chat_session_id') || 'sess_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('ai_chat_session_id', sessionId);

        // Elements
        const messagesDiv = document.getElementById('ai-chat-messages');
        const input = document.getElementById('ai-chat-input');
        const sendBtn = document.getElementById('ai-chat-send');
        const closeBtn = document.getElementById('ai-chat-close');

        // Toggle
        button.addEventListener('click', () => {
            isOpen = !isOpen;
            windowDiv.style.display = isOpen ? 'flex' : 'none';
            button.style.display = isOpen ? 'none' : 'flex';
            if (isOpen) input.focus();
        });

        closeBtn.addEventListener('click', () => {
            isOpen = false;
            windowDiv.style.display = 'none';
            button.style.display = 'flex';
        });

        // Add Message
        function addMessage(text, sender) {
            const div = document.createElement('div');
            div.className = `ai-message ${sender}`;
            div.textContent = text;
            messagesDiv.appendChild(div);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }

        // Send Message
        async function sendMessage() {
            const text = input.value.trim();
            if (!text) return;

            addMessage(text, 'user');
            input.value = '';
            input.disabled = true;
            sendBtn.disabled = true;

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        message: text,
                        bot_token: botToken,
                        external_user_id: sessionId,
                        platform: 'web'
                    })
                });

                const data = await response.json();

                if (data.response) {
                    addMessage(data.response, 'bot');
                } else {
                    addMessage('Sorry, something went wrong.', 'bot');
                }

            } catch (error) {
                console.error('Chat Error:', error);
                addMessage('Error connecting to server.', 'bot');
            } finally {
                input.disabled = false;
                sendBtn.disabled = false;
                input.focus();
            }
        }

        sendBtn.addEventListener('click', sendMessage);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWidget);
    } else {
        initWidget();
    }

})();
