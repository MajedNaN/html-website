const chatWidget = document.createElement('div');
chatWidget.innerHTML = `
  <style>
    #chatbox {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 320px;
      max-height: 600px; /* الارتفاع الأقصى عند الفتح */
      background: white;
      border: 1px solid #ccc;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      font-family: 'Inter', Arial, sans-serif;
      z-index: 9999;
      overflow: hidden; /* إخفاء المحتوى الزائد عند الطي */
      display: flex;
      flex-direction: column;
      transition: max-height 0.3s ease-out, box-shadow 0.3s ease-out; /* حركة سلسة للطي/الفتح */
    }

    /* حالة الودجت المطوي */
    #chatbox.collapsed {
      max-height: 50px; /* ارتفاع صغير عند الطي (فقط للرأس) */
      box-shadow: 0 1px 5px rgba(0,0,0,0.15); /* ظل أخف عند الطي */
    }

    #chatbox-header {
      background: #007b83;
      color: white;
      padding: 10px;
      font-weight: bold;
      border-top-left-radius: 9px;
      border-top-right-radius: 9px;
      cursor: pointer; /* للإشارة إلى أنه قابل للنقر */
      display: flex;
      justify-content: space-between; /* لتوزيع العنوان والأيقونة */
      align-items: center;
      user-select: none; /* منع تحديد النص عند النقر */
    }

    #chatbox-header-title {
      flex-grow: 1; /* لجعل العنوان يملأ المساحة المتاحة */
    }

    #chatbox-toggle-icon {
      font-size: 1.2rem;
      transition: transform 0.3s ease; /* حركة سلسة للأيقونة */
    }

    #chatbox.collapsed #chatbox-toggle-icon {
      transform: rotate(180deg); /* تدوير السهم عند الطي */
    }

    #chatbox-messages {
      flex-grow: 1;
      overflow-y: auto;
      padding: 10px;
      font-size: 0.9rem;
      background-color: #f0f0f0;
      min-height: 400px; /* تم إضافة هذا لجعل الودجت أكبر عند البداية */
      /* عند الطي، يجب إخفاء الرسائل */
      display: flex; /* لضمان التنسيق الصحيح */
      flex-direction: column;
    }

    #chatbox.collapsed #chatbox-messages,
    #chatbox.collapsed #chatbox-input {
        display: none; /* إخفاء محتوى الرسائل وحقل الإدخال عند الطي */
    }

    .message-bubble {
      margin-bottom: 8px;
      padding: 8px 12px;
      border-radius: 15px;
      max-width: 80%;
      word-wrap: break-word;
      direction: rtl; /* محاذاة النص داخل الفقاعة من اليمين لليسار */
    }
    .user-message {
      background-color: #dcf8c6;
      align-self: flex-end;
      margin-left: auto;
      text-align: right; /* محاذاة النص داخل فقاعة المستخدم لليمين */
    }
    .bot-message {
      background-color: #ffffff;
      border: 1px solid #e0e0e0;
      align-self: flex-start;
      margin-right: auto;
      text-align: right; /* محاذاة النص داخل فقاعة الروبوت لليمين */
    }
    .sender-name {
      font-weight: bold;
      margin-bottom: 4px;
      display: block;
      text-align: right; /* محاذاة اسم المرسل لليمين */
      direction: rtl; /* ضمان اتجاه النص الصحيح لاسم المرسل */
    }
    .sender-user {
      color: #0056b3;
    }
    .sender-bot {
      color: #007b83;
    }
    #chatbox-input {
      display: flex;
      border-top: 1px solid #ccc;
      background-color: #fff;
      border-bottom-left-radius: 9px;
      border-bottom-right-radius: 9px;
    }
    #userInput {
      flex: 1;
      padding: 10px;
      border: none;
      outline: none;
      border-bottom-left-radius: 9px;
      text-align: right; /* محاذاة النص المدخل والنص النائب لليمين */
      direction: rtl; /* اتجاه النص من اليمين لليسار */
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

    /* تصميم رمز التحميل (Spinner) */
    .loading-spinner {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 3px solid rgba(0, 0, 0, 0.3);
      border-radius: 50%;
      border-top-color: #007b83; /* لون مطابق لرأس الودجت */
      animation: spin 1s ease-in-out infinite;
      -webkit-animation: spin 1s ease-in-out infinite;
      vertical-align: middle; /* محاذاة عمودية مع النص */
      margin-left: 8px; /* مسافة بين اسم المرسل والسبينر */
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @-webkit-keyframes spin {
      0% { -webkit-transform: rotate(0deg); }
      100% { -webkit-transform: rotate(360deg); }
    }

    /* تصميم متجاوب (Responsive Design) */
    @media (max-width: 600px) {
      #chatbox {
        width: 90%;
        right: 5%;
        left: 5%;
        bottom: 10px;
        max-height: 90vh; /* تم زيادة الارتفاع على الجوال لجعله أكبر */
      }
      #chatbox.collapsed {
        max-height: 50px; /* يحافظ على الارتفاع عند الطي على الجوال */
      }
      #chatbox-messages {
        min-height: 60vh; /* تحديد min-height أكبر على الجوال */
      }
    }
  </style>
  <div id="chatbox">
    <div id="chatbox-header">
      <span id="chatbox-header-title">SmileCare Assistant 🤖</span>
      <span id="chatbox-toggle-icon">▼</span>
    </div>
    <div id="chatbox-messages"></div>
    <div id="chatbox-input">
      <input type="text" id="userInput" placeholder="اسألني أي حاجة..." />
      <button id="sendButton">➤</button>
    </div>
  </div>
`;

document.body.appendChild(chatWidget);

// الحصول على العناصر بعد إضافتها إلى DOM
const chatbox = document.getElementById('chatbox');
const chatboxHeader = document.getElementById('chatbox-header');
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

// إضافة مستمع حدث النقر لرأس الدردشة لطي/فتح الودجت
chatboxHeader.addEventListener('click', function() {
  chatbox.classList.toggle('collapsed');
  // إذا تم فتح الودجت، قم بالتمرير لأسفل لآخر رسالة
  if (!chatbox.classList.contains('collapsed')) {
    const chatMessages = document.getElementById('chatbox-messages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
});


async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return; // لا تفعل شيئًا إذا كانت الرسالة فارغة

  // إذا كان الودجت مطوياً، قم بفتحه أولاً
  if (chatbox.classList.contains('collapsed')) {
    chatbox.classList.remove('collapsed');
  }

  appendMessage('أنت', message, 'user');
  userInput.value = ''; // مسح حقل الإدخال
  userInput.focus(); // إعادة التركيز على حقل الإدخال

  // إضافة رسالة تحميل مؤقتة (الآن مع رمز تحميل)
  const loadingMessageId = 'loading-' + Date.now();
  appendMessage('SmileCare', '<div class="loading-spinner"></div>', 'bot', loadingMessageId, true); // `true` للإشارة إلى أن النص هو HTML

  try {
    const response = await fetch('https://test-widget-git-main-majednans-projects.vercel.app/api/chat', {
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

// تم تعديل الدالة لتقبل HTML في النص
function appendMessage(sender, text, type, messageId = null, isHtml = false) {
  const chatMessages = document.getElementById('chatbox-messages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `message-bubble ${type}-message`;
  if (messageId) {
    messageDiv.id = messageId; // تعيين ID لرسائل التحميل
  }

  const senderSpan = document.createElement('span');
  senderSpan.className = `sender-name sender-${type}`;
  senderSpan.textContent = sender;

  messageDiv.appendChild(senderSpan);

  if (isHtml) {
    const textContainer = document.createElement('div'); // حاوية للنص أو الـ HTML
    textContainer.innerHTML = text; // استخدام innerHTML للتعامل مع الـ HTML
    messageDiv.appendChild(textContainer);
  } else {
    const textNode = document.createTextNode(`: ${text}`); // النص بعد النقطتين
    messageDiv.appendChild(textNode);
  }

  chatMessages.appendChild(messageDiv);

  // التمرير لأسفل تلقائيا لعرض أحدث الرسائل
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function updateMessage(messageId, sender, newText) {
  const messageDiv = document.getElementById(messageId);
  if (messageDiv) {
    // إزالة أي محتوى موجود (مثل السبينر)
    while (messageDiv.lastChild && messageDiv.lastChild.nodeType !== Node.TEXT_NODE) {
      messageDiv.removeChild(messageDiv.lastChild);
    }
    // التأكد من أن الاسم لا يتغير
    const senderSpan = messageDiv.querySelector('.sender-name');
    if (senderSpan) {
        senderSpan.textContent = sender;
    }
    // إضافة النص الجديد
    const textNode = document.createTextNode(`: ${newText}`);
    messageDiv.appendChild(textNode);
  }
  const chatMessages = document.getElementById('chatbox-messages');
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
