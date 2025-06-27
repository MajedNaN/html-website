const chatWidget = document.createElement('div');
chatWidget.innerHTML = `
  <style>
    #chatbox {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 320px;
      background: white;
      border: 1px solid #ccc;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      font-family: Arial;
      z-index: 9999;
      overflow: hidden;
    }
    #chatbox-header {
      background: #007b83;
      color: white;
      padding: 10px;
      font-weight: bold;
    }
    #chatbox-messages {
      height: 250px;
      overflow-y: auto;
      padding: 10px;
      font-size: 0.9rem;
    }
    #chatbox-input {
      display: flex;
      border-top: 1px solid #ccc;
    }
    #chatbox-input input {
      flex: 1;
      padding: 10px;
      border: none;
      outline: none;
    }
    #chatbox-input button {
      background: #007b83;
      color: white;
      border: none;
      padding: 0 15px;
      cursor: pointer;
    }
  </style>
  <div id="chatbox">
    <div id="chatbox-header">SmileCare Assistant 🤖</div>
    <div id="chatbox-messages"></div>
    <div id="chatbox-input">
      <input type="text" id="userInput" placeholder="اسألني أي حاجة..." />
      <button onclick="sendMessage()">➤</button>
    </div>
  </div>
`;

document.body.appendChild(chatWidget);

async function sendMessage() {
  const input = document.getElementById('userInput');
  const message = input.value.trim();
  if (!message) return;

  appendMessage('أنت', message);
  input.value = '';

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });

  const data = await response.json();
  appendMessage('SmileCare', data.reply || 'حصلت مشكلة، حاول تاني.');
}

function appendMessage(sender, text) {
  const chat = document.getElementById('chatbox-messages');
  const bubble = document.createElement('div');
  bubble.textContent = `${sender}: ${text}`;
  chat.appendChild(bubble);
  chat.scrollTop = chat.scrollHeight;
}
