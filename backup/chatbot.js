document.addEventListener('DOMContentLoaded', () => {
    const chatbotHTML = `
        <div id="chatbot" style="position: fixed; bottom: 70px; right: 20px; width: 350px; height: 500px; background: #fff; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.2); display: none; flex-direction: column; z-index: 1000;">
            <div style="background: #ff6b6b; color: white; padding: 10px; border-radius: 10px 10px 0 0; font-weight: bold; display: flex; justify-content: space-between; align-items: center;">
                <span>HARSHU - Your Assistant</span>
                <select id="language-select" style="background: #fff; color: #000; border: none; padding: 2px; font-size: 14px;">
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                </select>
            </div>
            <div id="chat-messages" style="flex: 1; padding: 10px; overflow-y: auto;"></div>
            <div id="faq-list" style="max-height: 150px; overflow-y: auto; padding: 10px; border-top: 1px solid #ddd; display: none;"></div>
            <div style="display: flex; padding: 10px; border-top: 1px solid #ddd; background: #fff; border-radius: 0 0 10px 10px;">
                <input id="chat-input" type="text" placeholder="Ask me anything..." aria-label="Chat input" style="flex: 1; padding: 5px; border: none; outline: none;" />
                <button id="chat-send" style="background: #ff6b6b; color: white; border: none; padding: 5px 15px; border-radius: 5px; cursor: pointer; margin-left: 5px; font-size: 14px; z-index: 1001;">Send</button>
            </div>
        </div>
        <button id="chat-toggle" style="position: fixed; bottom: 20px; right: 20px; background: #ff6b6b; color: white; border: none; border-radius: 50%; width: 50px; height: 50px; cursor: pointer; z-index: 1000; font-size: 24px; display: flex; align-items: center; justify-content: center;" aria-label="Open chatbot" aria-expanded="false">💬</button>
    `;
    document.body.insertAdjacentHTML('beforeend', chatbotHTML);

    const chatbot = document.getElementById('chatbot');
    const chatToggle = document.getElementById('chat-toggle');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const faqList = document.getElementById('faq-list');
    const langSelect = document.getElementById('language-select');

    let currentLang = 'en';
    const currentPageRaw = window.location.pathname.split('/').pop().replace('.html', '');
    const currentPage = currentPageRaw.replace(/-/g, ' ') || 'index'; // Normalize hyphens to spaces

    chatToggle.addEventListener('click', () => {
        const isOpen = chatbot.style.display === 'flex';
        chatbot.style.display = isOpen ? 'none' : 'flex';
        chatToggle.setAttribute('aria-expanded', !isOpen);
        if (!isOpen) {
            addMessage('Harshu', currentLang === 'en' ? `Hello, I am Harshu! Ask me about ${currentPage === 'index' ? 'our tools' : currentPage} or click an FAQ below!` : `हाय, मैं हर्षु हूँ! ${currentPage === 'index' ? 'हमारे टूल्स' : currentPage} के बारे में पूछें या नीचे FAQ पर क्लिक करें!`);
            showFAQs();
        }
    });

    langSelect.addEventListener('change', (e) => {
        currentLang = e.target.value;
        chatMessages.innerHTML = '';
        addMessage('Harshu', currentLang === 'en' ? 'Language changed to English.' : 'भाषा हिंदी में बदली गई।');
        showFAQs();
    });

    const responses = {
        "audio converter": { en: "Convert audio files to MP3, WAV, AAC, etc.", hi: "ऑडियो फाइलों को MP3, WAV, AAC आदि में बदलें।" },
        "faq:audio converter:1": { en: "What formats are supported?", hi: "कौन से फॉर्मेट सपोर्टेड हैं?", ans: { en: "MP3, WAV, AAC, FLAC.", hi: "MP3, WAV, AAC, FLAC।" } },
        "faq:audio converter:2": { en: "How to convert audio?", hi: "ऑडियो कैसे कन्वर्ट करें?", ans: { en: "Upload file, select format, click convert.", hi: "फाइल अपलोड करें, फॉर्मेट चुनें, कन्वर्ट पर क्लिक करें।" } },
        "faq:audio converter:3": { en: "Is it free?", hi: "क्या यह मुफ्त है?", ans: { en: "Yes!", hi: "हाँ!" } },
        "faq:audio converter:4": { en: "Max file size?", hi: "अधिकतम फाइल साइज?", ans: { en: "10MB.", hi: "10MB।" } },
        "faq:audio converter:5": { en: "Does it reduce quality?", hi: "क्या यह क्वालिटी कम करता है?", ans: { en: "No, quality preserved.", hi: "नहीं, क्वालिटी बरकरार रहती है।" } },
        "faq:audio converter:6": { en: "How fast is it?", hi: "यह कितना तेज है?", ans: { en: "A few seconds.", hi: "कुछ सेकंड।" } },
        "faq:audio converter:7": { en: "Multiple files at once?", hi: "कई फाइलें एक साथ?", ans: { en: "One at a time.", hi: "एक बार में एक।" } },
        "faq:audio converter:8": { en: "Is it secure?", hi: "क्या यह सुरक्षित है?", ans: { en: "Yes, files deleted after use.", hi: "हाँ, उपयोग के बाद फाइलें हटा दी जाती हैं।" } },
        "faq:audio converter:9": { en: "Output format?", hi: "आउटपुट फॉर्मेट?", ans: { en: "You choose!", hi: "आप चुनें!" } },
        "faq:audio converter:10": { en: "Why use it?", hi: "इसे क्यों इस्तेमाल करें?", ans: { en: "For device compatibility.", hi: "डिवाइस संगतता के लिए।" } },

        "doc converter": { en: "Convert documents between DOCX, PDF, TXT, etc.", hi: "दस्तावेजों को DOCX, PDF, TXT आदि में बदलें।" },
        "faq:doc converter:1": { en: "Supported formats?", hi: "सपोर्टेड फॉर्मेट?", ans: { en: "DOCX, PDF, TXT.", hi: "DOCX, PDF, TXT।" } },
        "faq:doc converter:2": { en: "How to use?", hi: "कैसे इस्तेमाल करें?", ans: { en: "Upload, select format, convert.", hi: "अपलोड करें, फॉर्मेट चुनें, कन्वर्ट करें।" } },
        "faq:doc converter:3": { en: "Is it free?", hi: "क्या यह मुफ्त है?", ans: { en: "Yes!", hi: "हाँ!" } },
        "faq:doc converter:4": { en: "Formatting preserved?", hi: "फॉर्मेटिंग बरकरार रहती है?", ans: { en: "Mostly, yes.", hi: "ज्यादातर, हाँ।" } },
        "faq:doc converter:5": { en: "Max file size?", hi: "अधिकतम फाइल साइज?", ans: { en: "10MB.", hi: "10MB।" } },
        "faq:doc converter:6": { en: "How fast?", hi: "कितना तेज?", ans: { en: "Instant for small files.", hi: "छोटी फाइलों के लिए तुरंत।" } },
        "faq:doc converter:7": { en: "Batch convert?", hi: "एक साथ कई?", ans: { en: "One at a time.", hi: "एक बार में एक।" } },
        "faq:doc converter:8": { en: "Secure?", hi: "सुरक्षित?", ans: { en: "Yes, no storage.", hi: "हाँ, कोई स्टोरेज नहीं।" } },
        "faq:doc converter:9": { en: "Output format?", hi: "आउटपुट फॉर्मेट?", ans: { en: "DOCX, PDF, etc.", hi: "DOCX, PDF आदि।" } },
        "faq:doc converter:10": { en: "Why use?", hi: "क्यों इस्तेमाल करें?", ans: { en: "Easy editing.", hi: "आसान संपादन।" } },

        "file compressor": { en: "Compress files to save space.", hi: "फाइलों को कम करके जगह बचाएं।" },
        "faq:file compressor:1": { en: "What files can I compress?", hi: "कौन सी फाइलें कम कर सकता हूँ?", ans: { en: "Images, docs, videos.", hi: "इमेज, डॉक, वीडियो।" } },
        "faq:file compressor:2": { en: "How to compress?", hi: "कैसे कम करें?", ans: { en: "Upload, click compress.", hi: "अपलोड करें, कम करें पर क्लिक करें।" } },
        "faq:file compressor:3": { en: "Is it free?", hi: "क्या यह मुफ्त है?", ans: { en: "Yes!", hi: "हाँ!" } },
        "faq:file compressor:4": { en: "Quality loss?", hi: "क्वालिटी कम होती है?", ans: { en: "Minimal.", hi: "न्यूनतम।" } },
        "faq:file compressor:5": { en: "Max size?", hi: "अधिकतम साइज?", ans: { en: "20MB.", hi: "20MB।" } },
        "faq:file compressor:6": { en: "Speed?", hi: "स्पीड?", ans: { en: "Seconds.", hi: "सेकंड।" } },
        "faq:file compressor:7": { en: "Multiple files?", hi: "कई फाइलें?", ans: { en: "One by one.", hi: "एक-एक करके।" } },
        "faq:file compressor:8": { en: "Secure?", hi: "सुरक्षित?", ans: { en: "Yes, files deleted.", hi: "हाँ, फाइलें हटाई जाती हैं।" } },
        "faq:file compressor:9": { en: "Output?", hi: "आउटपुट?", ans: { en: "ZIP or original.", hi: "ZIP या मूल।" } },
        "faq:file compressor:10": { en: "Why use?", hi: "क्यों इस्तेमाल करें?", ans: { en: "Save space.", hi: "जगह बचाएं।" } },

        "group photo maker": { en: "Combine multiple images into one group photo.", hi: "कई इमेज को एक ग्रुप फोटो में मिलाएं।" },
        "faq:group photo maker:1": { en: "How many images?", hi: "कितनी इमेज?", ans: { en: "Up to 10.", hi: "10 तक।" } },
        "faq:group photo maker:2": { en: "How to use?", hi: "कैसे इस्तेमाल करें?", ans: { en: "Upload images, arrange, save.", hi: "इमेज अपलोड करें, व्यवस्थित करें, सेव करें।" } },
        "faq:group photo maker:3": { en: "Free?", hi: "मुफ्त?", ans: { en: "Yes!", hi: "हाँ!" } },
        "faq:group photo maker:4": { en: "Max size?", hi: "अधिकतम साइज?", ans: { en: "5MB per image.", hi: "5MB प्रति इमेज।" } },
        "faq:group photo maker:5": { en: "Output format?", hi: "आउटपुट फॉर्मेट?", ans: { en: "JPEG.", hi: "JPEG।" } },
        "faq:group photo maker:6": { en: "Can I edit layout?", hi: "लेआउट संपादित कर सकता हूँ?", ans: { en: "Yes.", hi: "हाँ।" } },
        "faq:group photo maker:7": { en: "Speed?", hi: "स्पीड?", ans: { en: "Quick.", hi: "तेज।" } },
        "faq:group photo maker:8": { en: "Secure?", hi: "सुरक्षित?", ans: { en: "Yes, no storage.", hi: "हाँ, कोई स्टोरेज नहीं।" } },
        "faq:group photo maker:9": { en: "Resolution?", hi: "रिजॉल्यूशन?", ans: { en: "High quality.", hi: "उच्च क्वालिटी।" } },
        "faq:group photo maker:10": { en: "Why use?", hi: "क्यों इस्तेमाल करें?", ans: { en: "Create group pics easily.", hi: "ग्रुप फोटो आसानी से बनाएं।" } },

        "img compress": { en: "Reduce image size without losing quality.", hi: "इमेज साइज कम करें बिना क्वालिटी खोए।" },
        "faq:img compress:1": { en: "Supported formats?", hi: "सपोर्टेड फॉर्मेट?", ans: { en: "JPG, PNG, GIF.", hi: "JPG, PNG, GIF।" } },
        "faq:img compress:2": { en: "How to use?", hi: "कैसे इस्तेमाल करें?", ans: { en: "Upload, compress, download.", hi: "अपलोड करें, कम करें, डाउनलोड करें।" } },
        "faq:img compress:3": { en: "Free?", hi: "मुफ्त?", ans: { en: "Yes!", hi: "हाँ!" } },
        "faq:img compress:4": { en: "Max width?", hi: "अधिकतम चौड़ाई?", ans: { en: "800px.", hi: "800px।" } },
        "faq:img compress:5": { en: "Quality loss?", hi: "क्वालिटी कम होती है?", ans: { en: "No, 70% default.", hi: "नहीं, 70% डिफॉल्ट।" } },
        "faq:img compress:6": { en: "Speed?", hi: "स्पीड?", ans: { en: "Instant.", hi: "तुरंत।" } },
        "faq:img compress:7": { en: "Multiple images?", hi: "कई इमेज?", ans: { en: "One at a time.", hi: "एक बार में एक।" } },
        "faq:img compress:8": { en: "Secure?", hi: "सुरक्षित?", ans: { en: "Yes, no storage.", hi: "हाँ, कोई स्टोरेज नहीं।" } },
        "faq:img compress:9": { en: "Output?", hi: "आउटपुट?", ans: { en: "JPEG.", hi: "JPEG।" } },
        "faq:img compress:10": { en: "Why use?", hi: "क्यों इस्तेमाल करें?", ans: { en: "Boost SEO, speed.", hi: "SEO, स्पीड बढ़ाएं।" } },

        "img format converter": { en: "Convert images between PNG, JPEG, WebP.", hi: "इमेज को PNG, JPEG, WebP में बदलें।" },
        "faq:img format converter:1": { en: "What formats?", hi: "कौन से फॉर्मेट?", ans: { en: "PNG, JPEG, WebP.", hi: "PNG, JPEG, WebP।" } },
        "faq:img format converter:2": { en: "How to convert?", hi: "कैसे कन्वर्ट करें?", ans: { en: "Upload, select format, convert.", hi: "अपलोड करें, फॉर्मेट चुनें, कन्वर्ट करें।" } },
        "faq:img format converter:3": { en: "Free?", hi: "मुफ्त?", ans: { en: "Yes!", hi: "हाँ!" } },
        "faq:img format converter:4": { en: "Max size?", hi: "अधिकतम साइज?", ans: { en: "5MB.", hi: "5MB।" } },
        "faq:img format converter:5": { en: "Quality?", hi: "क्वालिटी?", ans: { en: "Preserved.", hi: "बरकरार।" } },
        "faq:img format converter:6": { en: "Speed?", hi: "स्पीड?", ans: { en: "Quick.", hi: "तेज।" } },
        "faq:img format converter:7": { en: "Multiple?", hi: "कई?", ans: { en: "One at a time.", hi: "एक बार में एक।" } },
        "faq:img format converter:8": { en: "Secure?", hi: "सुरक्षित?", ans: { en: "Yes.", hi: "हाँ।" } },
        "faq:img format converter:9": { en: "Output?", hi: "आउटपुट?", ans: { en: "Your choice.", hi: "आपकी पसंद।" } },
        "faq:img format converter:10": { en: "Why use?", hi: "क्यों इस्तेमाल करें?", ans: { en: "Format compatibility.", hi: "फॉर्मेट संगतता।" } },

        "img to pdf": { en: "Convert images to PDF documents.", hi: "इमेज को PDF दस्तावेज में बदलें।" },
        "faq:img to pdf:1": { en: "Supported formats?", hi: "सपोर्टेड फॉर्मेट?", ans: { en: "JPG, PNG.", hi: "JPG, PNG।" } },
        "faq:img to pdf:2": { en: "How to use?", hi: "कैसे इस्तेमाल करें?", ans: { en: "Upload image, convert.", hi: "इमेज अपलोड करें, कन्वर्ट करें।" } },
        "faq:img to pdf:3": { en: "Free?", hi: "मुफ्त?", ans: { en: "Yes!", hi: "हाँ!" } },
        "faq:img to pdf:4": { en: "Max size?", hi: "अधिकतम साइज?", ans: { en: "5MB.", hi: "5MB।" } },
        "faq:img to pdf:5": { en: "Quality?", hi: "क्वालिटी?", ans: { en: "High quality.", hi: "उच्च क्वालिटी।" } },
        "faq:img to pdf:6": { en: "Speed?", hi: "स्पीड?", ans: { en: "Instant.", hi: "तुरंत।" } },
        "faq:img to pdf:7": { en: "Multiple images?", hi: "कई इमेज?", ans: { en: "One per PDF.", hi: "प्रति PDF एक।" } },
        "faq:img to pdf:8": { en: "Secure?", hi: "सुरक्षित?", ans: { en: "Yes.", hi: "हाँ।" } },
        "faq:img to pdf:9": { en: "Output?", hi: "आउटपुट?", ans: { en: "PDF.", hi: "PDF।" } },
        "faq:img to pdf:10": { en: "Why use?", hi: "क्यों इस्तेमाल करें?", ans: { en: "Share images as docs.", hi: "इमेज को दस्तावेज के रूप में शेयर करें।" } },

        "multi function calculator": { en: "Calculate currency, area, weight, distance, etc.", hi: "मुद्रा, क्षेत्र, वजन, दूरी आदि की गणना करें।" },
        "faq:multi function calculator:1": { en: "What can it calculate?", hi: "यह क्या गणना कर सकता है?", ans: { en: "Currency, area, weight, distance.", hi: "मुद्रा, क्षेत्र, वजन, दूरी।" } },
        "faq:multi function calculator:2": { en: "How to use?", hi: "कैसे इस्तेमाल करें?", ans: { en: "Enter values, select type.", hi: "मान डालें, प्रकार चुनें।" } },
        "faq:multi function calculator:3": { en: "Free?", hi: "मुफ्त?", ans: { en: "Yes!", hi: "हाँ!" } },
        "faq:multi function calculator:4": { en: "Accurate?", hi: "सटीक?", ans: { en: "Yes.", hi: "हाँ।" } },
        "faq:multi function calculator:5": { en: "Currency updated?", hi: "मुद्रा अपडेटेड?", ans: { en: "Yes, real-time rates.", hi: "हाँ, रियल-टाइम दरें।" } },
        "faq:multi function calculator:6": { en: "Speed?", hi: "स्पीड?", ans: { en: "Instant.", hi: "तुरंत।" } },
        "faq:multi function calculator:7": { en: "Multiple calculations?", hi: "कई गणनाएँ?", ans: { en: "Yes.", hi: "हाँ।" } },
        "faq:multi function calculator:8": { en: "Secure?", hi: "सुरक्षित?", ans: { en: "Yes, local processing.", hi: "हाँ, स्थानीय प्रोसेसिंग।" } },
        "faq:multi function calculator:9": { en: "Units?", hi: "इकाइयाँ?", ans: { en: "Multiple units supported.", hi: "कई इकाइयाँ सपोर्टेड।" } },
        "faq:multi function calculator:10": { en: "Why use?", hi: "क्यों इस्तेमाल करें?", ans: { en: "All-in-one tool.", hi: "ऑल-इन-वन टूल।" } },

        "pdf to word": { en: "Convert PDFs to editable Word docs.", hi: "PDF को संपादन योग्य वर्ड डॉक में बदलें।" },
        "faq:pdf to word:1": { en: "Formats supported?", hi: "सपोर्टेड फॉर्मेट?", ans: { en: "PDF to DOCX.", hi: "PDF से DOCX।" } },
        "faq:pdf to word:2": { en: "How to convert?", hi: "कैसे कन्वर्ट करें?", ans: { en: "Upload PDF, convert.", hi: "PDF अपलोड करें, कन्वर्ट करें।" } },
        "faq:pdf to word:3": { en: "Free?", hi: "मुफ्त?", ans: { en: "Yes!", hi: "हाँ!" } },
        "faq:pdf to word:4": { en: "Formatting?", hi: "फॉर्मेटिंग?", ans: { en: "Mostly preserved.", hi: "ज्यादातर बरकरार।" } },
        "faq:pdf to word:5": { en: "Max size?", hi: "अधिकतम साइज?", ans: { en: "10MB.", hi: "10MB।" } },
        "faq:pdf to word:6": { en: "Speed?", hi: "स्पीड?", ans: { en: "Quick.", hi: "तेज।" } },
        "faq:pdf to word:7": { en: "Scanned PDFs?", hi: "स्कैन किए PDF?", ans: { en: "Text-based only.", hi: "केवल टेक्स्ट-आधारित।" } },
        "faq:pdf to word:8": { en: "Secure?", hi: "सुरक्षित?", ans: { en: "Yes.", hi: "हाँ।" } },
        "faq:pdf to word:9": { en: "Output?", hi: "आउटपुट?", ans: { en: "DOCX.", hi: "DOCX।" } },
        "faq:pdf to word:10": { en: "Why use?", hi: "क्यों इस्तेमाल करें?", ans: { en: "Edit PDFs easily.", hi: "PDF आसानी से संपादित करें।" } },

        "qr code generator": { en: "Create QR codes for URLs, text, etc.", hi: "URL, टेक्स्ट आदि के लिए QR कोड बनाएं।" },
        "faq:qr code generator:1": { en: "What can I encode?", hi: "क्या एनकोड कर सकता हूँ?", ans: { en: "URLs, text, contact info.", hi: "URL, टेक्स्ट, संपर्क जानकारी।" } },
        "faq:qr code generator:2": { en: "How to use?", hi: "कैसे इस्तेमाल करें?", ans: { en: "Enter data, generate.", hi: "डेटा डालें, जेनरेट करें।" } },
        "faq:qr code generator:3": { en: "Free?", hi: "मुफ्त?", ans: { en: "Yes!", hi: "हाँ!" } },
        "faq:qr code generator:4": { en: "Size?", hi: "साइज?", ans: { en: "Customizable.", hi: "कस्टमाइज़ करने योग्य।" } },
        "faq:qr code generator:5": { en: "Quality?", hi: "क्वालिटी?", ans: { en: "High resolution.", hi: "उच्च रिजॉल्यूशन।" } },
        "faq:qr code generator:6": { en: "Speed?", hi: "स्पीड?", ans: { en: "Instant.", hi: "तुरंत।" } },
        "faq:qr code generator:7": { en: "Multiple QR codes?", hi: "कई QR कोड?", ans: { en: "One at a time.", hi: "एक बार में एक।" } },
        "faq:qr code generator:8": { en: "Secure?", hi: "सुरक्षित?", ans: { en: "Yes.", hi: "हाँ।" } },
        "faq:qr code generator:9": { en: "Output?", hi: "आउटपुट?", ans: { en: "PNG.", hi: "PNG।" } },
        "faq:qr code generator:10": { en: "Why use?", hi: "क्यों इस्तेमाल करें?", ans: { en: "Quick sharing.", hi: "तेज शेयरिंग।" } },

        "text to speech": { en: "Turn text into natural audio.", hi: "टेक्स्ट को प्राकृतिक ऑडियो में बदलें।" },
        "faq:text to speech:1": { en: "Languages supported?", hi: "कौन सी भाषाएँ सपोर्टेड हैं?", ans: { en: "Multiple, browser-dependent.", hi: "कई, ब्राउज़र पर निर्भर।" } },
        "faq:text to speech:2": { en: "How to use?", hi: "कैसे इस्तेमाल करें?", ans: { en: "Type text, convert.", hi: "टेक्स्ट टाइप करें, कन्वर्ट करें।" } },
        "faq:text to speech:3": { en: "Free?", hi: "मुफ्त?", ans: { en: "Yes!", hi: "हाँ!" } },
        "faq:text to speech:4": { en: "Voice options?", hi: "आवाज के विकल्प?", ans: { en: "Browser-dependent.", hi: "ब्राउज़र पर निर्भर।" } },
        "faq:text to speech:5": { en: "Quality?", hi: "क्वालिटी?", ans: { en: "Natural sounding.", hi: "प्राकृतिक ध्वनि।" } },
        "faq:text to speech:6": { en: "Speed?", hi: "स्पीड?", ans: { en: "Quick.", hi: "तेज।" } },
        "faq:text to speech:7": { en: "Length limit?", hi: "लंबाई की सीमा?", ans: { en: "500 chars.", hi: "500 अक्षर।" } },
        "faq:text to speech:8": { en: "Secure?", hi: "सुरक्षित?", ans: { en: "Yes.", hi: "हाँ।" } },
        "faq:text to speech:9": { en: "Output?", hi: "आउटपुट?", ans: { en: "MP3.", hi: "MP3।" } },
        "faq:text to speech:10": { en: "Why use?", hi: "क्यों इस्तेमाल करें?", ans: { en: "Accessibility.", hi: "सुलभता।" } },

        "video converter": { en: "Convert videos to MP4, AVI, etc.", hi: "वीडियो को MP4, AVI आदि में बदलें।" },
        "faq:video converter:1": { en: "Supported formats?", hi: "सपोर्टेड फॉर्मेट?", ans: { en: "MP4, AVI, MKV.", hi: "MP4, AVI, MKV।" } },
        "faq:video converter:2": { en: "How to use?", hi: "कैसे इस्तेमाल करें?", ans: { en: "Upload, select format, convert.", hi: "अपलोड करें, फॉर्मेट चुनें, कन्वर्ट करें।" } },
        "faq:video converter:3": { en: "Free?", hi: "मुफ्त?", ans: { en: "Yes!", hi: "हाँ!" } },
        "faq:video converter:4": { en: "Max size?", hi: "अधिकतम साइज?", ans: { en: "20MB.", hi: "20MB।" } },
        "faq:video converter:5": { en: "Quality?", hi: "क्वालिटी?", ans: { en: "Preserved.", hi: "बरकरार।" } },
        "faq:video converter:6": { en: "Speed?", hi: "स्पीड?", ans: { en: "Depends on size.", hi: "साइज पर निर्भर।" } },
        "faq:video converter:7": { en: "Multiple?", hi: "कई?", ans: { en: "One at a time.", hi: "एक बार में एक।" } },
        "faq:video converter:8": { en: "Secure?", hi: "सुरक्षित?", ans: { en: "Yes.", hi: "हाँ।" } },
        "faq:video converter:9": { en: "Output?", hi: "आउटपुट?", ans: { en: "Your choice.", hi: "आपकी पसंद।" } },
        "faq:video converter:10": { en: "Why use?", hi: "क्यों इस्तेमाल करें?", ans: { en: "Device compatibility.", hi: "डिवाइस संगतता।" } },

        "voice converter": { en: "Translate voice in real-time.", hi: "वॉइस को रियल-टाइम में अनुवाद करें।" },
        "faq:voice converter:1": { en: "Languages supported?", hi: "कौन सी भाषाएँ सपोर्टेड?", ans: { en: "Multiple, browser-dependent.", hi: "कई, ब्राउज़र पर निर्भर।" } },
        "faq:voice converter:2": { en: "How to use?", hi: "कैसे इस्तेमाल करें?", ans: { en: "Speak, select language, translate.", hi: "बोलें, भाषा चुनें, अनुवाद करें।" } },
        "faq:voice converter:3": { en: "Free?", hi: "मुफ्त?", ans: { en: "Yes!", hi: "हाँ!" } },
        "faq:voice converter:4": { en: "Accuracy?", hi: "सटीकता?", ans: { en: "High.", hi: "उच्च।" } },
        "faq:voice converter:5": { en: "Speed?", hi: "स्पीड?", ans: { en: "Real-time.", hi: "रियल-टाइम।" } },
        "faq:voice converter:6": { en: "Voice quality?", hi: "आवाज की क्वालिटी?", ans: { en: "Clear.", hi: "साफ।" } },
        "faq:voice converter:7": { en: "Recording limit?", hi: "रिकॉर्डिंग सीमा?", ans: { en: "30 seconds.", hi: "30 सेकंड।" } },
        "faq:voice converter:8": { en: "Secure?", hi: "सुरक्षित?", ans: { en: "Yes.", hi: "हाँ।" } },
        "faq:voice converter:9": { en: "Output?", hi: "आउटपुट?", ans: { en: "Text or audio.", hi: "टेक्स्ट या ऑडियो।" } },
        "faq:voice converter:10": { en: "Why use?", hi: "क्यों इस्तेमाल करें?", ans: { en: "Language barriers.", hi: "भाषा बाधाएँ।" } },

        "default": { en: "Sorry, I can’t answer that!", hi: "माफ करें, जवाब नहीं दे सकता!" }
    };

    function showFAQs() {
        faqList.style.display = 'block';
        faqList.innerHTML = '<strong>FAQs:</strong><br>';
        const toolName = currentPage === 'index' ? '' : currentPage;
        Object.keys(responses).forEach(key => {
            if (key.startsWith(`faq:${toolName}:`) || (currentPage === 'index' && key.startsWith('faq:'))) {
                const faqDiv = document.createElement('div');
                faqDiv.style.cursor = 'pointer';
                faqDiv.style.color = '#007bff';
                faqDiv.style.margin = '5px 0';
                faqDiv.innerText = responses[key][currentLang];
                faqDiv.addEventListener('click', () => {
                    addMessage('You', responses[key][currentLang]);
                    addMessage('Harshu', responses[key].ans[currentLang]);
                });
                faqList.appendChild(faqDiv);
            }
        });
    }

    function sendMessage() {
        if (chatInput.value.trim()) {
            const userMessage = chatInput.value.trim().toLowerCase();
            addMessage('You', userMessage);
            let botResponse = responses["default"][currentLang];
            for (let key in responses) {
                if (userMessage.includes(key)) {
                    botResponse = responses[key][currentLang];
                    break;
                }
            }
            addMessage('Harshu', botResponse);
            chatInput.value = '';
        }
    }

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    chatSend.addEventListener('click', sendMessage);

    function addMessage(sender, message) {
        const msgDiv = document.createElement('div');
        msgDiv.style.marginBottom = '10px';

        const senderStrong = document.createElement('strong');
        senderStrong.textContent = sender + ':';

        const messageSpan = document.createElement('span');
        messageSpan.textContent = ' ' + message;

        msgDiv.appendChild(senderStrong);
        msgDiv.appendChild(messageSpan);
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});
