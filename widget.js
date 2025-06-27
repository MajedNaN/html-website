const chatWidget = document.createElement('div');
chatWidget.innerHTML = `
  <style>
    #chatbox {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 320px;
      max-height: 450px; /* تحديد أقصى ارتفاع للصندوق */
      background: white;
      border: 1px solid #ccc;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      font-family: 'Inter', Arial, sans-serif; /* استخدام Inter أو Arial كخط احتياطي */
      z-index: 9999;
      overflow: hidden;
      display: flex; /* استخدام فليكس بوكس للتحكم في التخطيط الداخلي */
      flex-direction: column; /* ترتيب العناصر عمودياً */
    }
    #chatbox-header {
      background: #007b83;
      color: white;
      padding: 10px;
      font-weight: bold;
      border-top-left-radius: 9px; /* تقريب الزوايا العلوية */
      border-top-right-radius: 9px;
    }
    #chatbox-messages {
      flex-grow: 1; /* جعل جزء الرسائل يتمدد لملء المساحة المتاحة */
      overflow-y: auto;
      padding: 10px;
      font-size: 0.9rem;
      background-color: #f0f0f0; /* خلفية أفتح للرسائل */
    }
    .message-bubble {
      margin-bottom: 8px;
      padding: 8px 12px;
      border-radius: 15px;
      max-width: 80%;
      word-wrap: break-word;
    }
    .user-message {
      background-color: #dcf8c6; /* لون فقاعة المستخدم */
      align-self: flex-end; /* محاذاة لليمين */
      margin-left: auto;
    }
    .bot-message {
      background-color: #ffffff; /* لون فقاعة الروبوت */
      border: 1px solid #e0e0e0;
      align-self: flex-start; /* محاذاة لليسار */
      margin-right: auto;
    }
    .sender-name {
      font-weight: bold;
      margin-bottom: 4px;
      display: block; /* لجعل الاسم يأخذ سطرًا خاصًا */
    }
    .sender-user {
      color: #0056b3; /* لون أزرق للمستخدم */
    }
    .sender-bot {
      color: #007b83; /* لون أخضر للروبوت (متطابق مع لون الهيدر) */
    }
    #chatbox-input {
      display: flex;
      border-top: 1px solid #ccc;
      background-color: #fff;
      border-bottom-left-radius: 9px; /* تقريب الزوايا السفلية */
      border-bottom-right-radius: 9px;
    }
    #userInput {
      flex: 1;
      padding: 10px;
      border: none;
      outline: none;
      border-bottom-left-radius: 9px;
    }
    #chatbox-input button {
      background: #007b83;
      color: white;
      border: none;
      padding: 0 15px;
      cursor: pointer;
      font-size: 1.2rem;
      border-bottom-right-radius: 9px;
      transition: background-color 0.2s ease;
    }
    #chatbox-input button:hover {
      background-color: #005f6b;
    }

    /* تصميم متجاوب (Responsive Design) */
    @media (max-width: 600px) {
      #chatbox {
        width: 90%;
        right: 5%;
        left: 5%;
        bottom: 10px;
        max-height: 80vh; /* ارتفاع أكبر على الجوال */
      }
    }
  </style>
  <div id="chatbox">
    <div id="chatbox-header">SmileCare Assistant 🤖</div>
    <div id="chatbox-messages"></div>
    <div id="chatbox-input">
      <input type="text" id="userInput" placeholder="اسألني أي حاجة..." />
      <button id="sendButton">➤</button>
    </div>
  </div>
`;

document.body.appendChild(chatWidget);

// الحصول على العناصر بعد إضافتها إلى DOM
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');

// إضافة مستمع حدث الضغط على زر Enter لحقل الإدخال
userInput.addEventListener('keypress', function(event) {
  // keyCode 13 هو مفتاح Enter
  if (event.key === 'Enter') {
    sendMessage();
  }
});

// إضافة مستمع حدث النقر لزر الإرسال
sendButton.addEventListener('click', sendMessage);


async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return; // لا تفعل شيئًا إذا كانت الرسالة فارغة

  appendMessage('أنت', message, 'user');
  userInput.value = ''; // مسح حقل الإدخال
  userInput.focus(); // إعادة التركيز على حقل الإدخال

  // إضافة رسالة تحميل مؤقتة
  const loadingMessageId = 'loading-' + Date.now();
  appendMessage('SmileCare', 'جاري الكتابة...', 'bot', loadingMessageId);

  try {
    const response = await fetch('https://test-telegram-fawn.vercel.app/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // إزالة رسالة التحميل وتحديثها بالاستجابة الفعلية
    updateMessage(loadingMessageId, 'SmileCare', data.reply || 'حصلت مشكلة، حاول تاني.');

  } catch (error) {
    console.error('Error sending message:', error);
    updateMessage(loadingMessageId, 'SmileCare', 'آسف، حصلت مشكلة في الاتصال. يرجى المحاولة مرة أخرى.');
  }
}

function appendMessage(sender, text, type, messageId = null) {
  const chatMessages = document.getElementById('chatbox-messages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `message-bubble ${type}-message`;
  if (messageId) {
    messageDiv.id = messageId; // تعيين ID لرسائل التحميل
  }

  const senderSpan = document.createElement('span');
  senderSpan.className = `sender-name sender-${type}`;
  senderSpan.textContent = sender;

  const textNode = document.createTextNode(`: ${text}`); // النص بعد النقطتين

  messageDiv.appendChild(senderSpan);
  messageDiv.appendChild(textNode);
  chatMessages.appendChild(messageDiv);

  // التمرير لأسفل تلقائيا لعرض أحدث الرسائل
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function updateMessage(messageId, sender, newText) {
  const messageDiv = document.getElementById(messageId);
  if (messageDiv) {
    // إزالة النص القديم وإضافة النص الجديد
    messageDiv.lastChild.nodeValue = `: ${newText}`;
    // التأكد من أن الاسم لا يتغير (قد لا تكون هذه الخطوة ضرورية لكنها آمنة)
    messageDiv.querySelector('.sender-name').textContent = sender;
  }
  const chatMessages = document.getElementById('chatbox-messages');
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
