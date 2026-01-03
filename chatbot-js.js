(function() {
    
    // Configuration
    const WORKER_URL = 'https://gemini-rest-worker.vm002248.workers.dev/';
    
    // Create chatbot HTML structure
    function createChatbotHTML() {
        const chatbotHTML = `
            <!-- Floating Chat Button -->
            <button class="chat-fab" id="chatFab">
		<svg class="icon-chat" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
		    <path d="M20 3H4a2 2 0 0 0-2 2v15l3-3h15a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" 
        		fill="none"
        		stroke="white"
        		stroke-width="2"
        		stroke-linecap="round"
       		 	stroke-linejoin="round"/>
		</svg>
<svg class="icon-close" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path 
        d="M6 6l12 12M18 6L6 18"
        fill="none"
        stroke="white"
        stroke-width="2"
        stroke-linecap="round"
    />
</svg>


                <span class="chat-badge" id="chatBadge">1</span>
            </button>

            <!-- Chat Window -->
            <div class="chat-window" id="chatWindow">
                <div class="chat-header">
                    <div class="chat-header-content">
                        <div class="status-dot"></div>
                        <div>
                            <h3>Havsite Assistant</h3>
                            <div class="chat-header-subtitle">We typically reply instantly</div>
                        </div>
                    </div>
                    <button class="minimize-btn" id="minimizeBtn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </button>
                </div>

                <div class="chat-messages" id="chatMessages">
                    <div class="message bot">
                        <div class="message-avatar">AI</div>
                        <div class="message-content">
                            👋 Hi! I'm the Havsite assistant. Ask me anything about our platform, features, or privacy!
                        </div>
                    </div>
                </div>

                <div class="chat-input-container">
                    <div class="chat-input-wrapper">
                        <input 
                            type="text" 
                            class="chat-input" 
                            id="chatInput" 
                            placeholder="Type your message..."
                            autocomplete="off"
                        >
                        <button class="send-button" id="sendButton">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        const container = document.createElement('div');
        container.innerHTML = chatbotHTML;
        document.body.appendChild(container);
    }
    
    // Initialize chatbot when DOM is ready
    function initChatbot() {
        createChatbotHTML();
        
        const chatFab = document.getElementById('chatFab');
        const chatWindow = document.getElementById('chatWindow');
        const chatMessages = document.getElementById('chatMessages');
        const chatInput = document.getElementById('chatInput');
        const sendButton = document.getElementById('sendButton');
        const minimizeBtn = document.getElementById('minimizeBtn');
        const chatBadge = document.getElementById('chatBadge');
        
        let conversationHistory = [];
        let isProcessing = false;
        let isOpen = false;

        // Create typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'message bot';
        typingIndicator.innerHTML = `
            <div class="message-avatar">AI</div>
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;

        // Toggle chat window
        function toggleChat() {
            isOpen = !isOpen;
            chatFab.classList.toggle('open');
            chatWindow.classList.toggle('open');
            
            if (isOpen) {
                chatInput.focus();
                chatBadge.classList.remove('show');
            }
        }

        chatFab.addEventListener('click', toggleChat);
        minimizeBtn.addEventListener('click', toggleChat);

        function addMessage(text, isUser) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
            
            const formattedText = isUser ? escapeHtml(text) : formatMarkdown(text);
            
            messageDiv.innerHTML = `
                <div class="message-avatar">${isUser ? 'YOU' : 'AI'}</div>
                <div class="message-content">${formattedText}</div>
            `;
            
            chatMessages.appendChild(messageDiv);
            scrollToBottom();

            // Show badge if window is closed and message is from bot
            if (!isOpen && !isUser) {
                chatBadge.classList.add('show');
            }
        }

        function formatMarkdown(text) {
            text = text.replace(/&/g, '&amp;')
                      .replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;');
            
            text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
                return `<pre><code class="language-${lang || 'text'}">${code.trim()}</code></pre>`;
            });
            
            text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
            text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
            text = text.replace(/__(.+?)__/g, '<strong>$1</strong>');
            text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
            text = text.replace(/_(.+?)_/g, '<em>$1</em>');
            text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
            text = text.replace(/^### (.+)$/gm, '<h3>$1</h3>');
            text = text.replace(/^## (.+)$/gm, '<h2>$1</h2>');
            text = text.replace(/^# (.+)$/gm, '<h1>$1</h1>');
            text = text.replace(/^\* (.+)$/gm, '<li>$1</li>');
            text = text.replace(/^- (.+)$/gm, '<li>$1</li>');
            text = text.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
            text = text.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
            text = text.replace(/\n\n/g, '<br><br>');
            text = text.replace(/\n/g, '<br>');
            
            return text;
        }

        function showTypingIndicator() {
            typingIndicator.querySelector('.typing-indicator').classList.add('active');
            chatMessages.appendChild(typingIndicator);
            scrollToBottom();
        }

        function hideTypingIndicator() {
            if (typingIndicator.parentNode) {
                typingIndicator.parentNode.removeChild(typingIndicator);
            }
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function scrollToBottom() {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        async function sendMessage() {
            const message = chatInput.value.trim();
            
            if (!message || isProcessing) return;
            
            isProcessing = true;
            sendButton.disabled = true;
            chatInput.disabled = true;
            
            addMessage(message, true);
            chatInput.value = '';
            
            conversationHistory.push({
                role: 'user',
                parts: [{ text: message }]
            });
            
            showTypingIndicator();
            
            try {
                const response = await fetch(WORKER_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: message,
                        history: conversationHistory
                    })
                });
                
                const data = await response.json();
                hideTypingIndicator();
                
                if (data.error) {
                    console.error('Worker error:', data);
                    addMessage('Sorry, something went wrong. Please try again.', false);
                    return;
                }
                
                const botMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                                 'Sorry, I could not generate a response.';
                
                addMessage(botMessage, false);
                
                conversationHistory.push({
                    role: 'model',
                    parts: [{ text: botMessage }]
                });
                
            } catch (error) {
                hideTypingIndicator();
                console.error('Error:', error);
                addMessage('Sorry, something went wrong. Please try again.', false);
            } finally {
                isProcessing = false;
                sendButton.disabled = false;
                chatInput.disabled = false;
                chatInput.focus();
            }
        }

        sendButton.addEventListener('click', sendMessage);
        
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initChatbot);
    } else {
        initChatbot();
    }
})();