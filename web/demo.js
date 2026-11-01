(function () {
  const FIXED = {
    "hi": {
      "preCall": "मैं अभी आपके परिवार को कॉल कर रही हूँ। लाइन पर बने रहिए।",
      "verdictFake": "अच्छी ख़बर। मैंने आपके परिवार से बात कर ली है। वो बिल्कुल ठीक हैं और उन्होंने आपको कोई कॉल नहीं किया। वो कॉल नकली था। कोई पैसा या OTP मत दीजिए, और उस नंबर को ब्लॉक कर दीजिए।",
      "verdictUnconfirmed": "अभी मैं आपके परिवार से पक्की बात नहीं कर पाई। जब तक आप ख़ुद उनसे उनके पुराने नंबर पर बात न कर लें, कोई पैसा मत भेजिए। असली मुसीबत होगी तो वो थोड़ा इंतज़ार कर सकती है।",
      "authorityScam": "ध्यान से सुनिए। डिजिटल अरेस्ट नाम की कोई चीज़ क़ानून में नहीं है। पुलिस, CBI या कोर्ट वीडियो कॉल पर पैसे नहीं माँगते। अभी वो कॉल काट दीजिए, और कोई OTP या पैसा मत दीजिए। मैं आपके परिवार को बता रही हूँ।",
      "alreadyPaid": "घबराइए मत, पर अभी तुरंत 1930 पर कॉल कीजिए, शुरू के घंटे सबसे ज़रूरी होते हैं। फिर अपने बैंक को भी कॉल कीजिए। मैं आपके परिवार को अभी ख़बर कर रही हूँ।",
      "closing": "अपना ध्यान रखिए। जब भी शक हो, यही बटन दबाइए। नमस्ते।",
      "thanks": "शुक्रिया। मैं उन्हें अभी बता रही हूँ। नमस्ते।"
    },
    "en": {
      "preCall": "I'm calling your family right now. Please stay on the line.",
      "verdictFake": "Good news. I've spoken to your family. They are completely fine, and they did not call you. That call was fake. Don't give any money or OTP, and block that number.",
      "verdictUnconfirmed": "I couldn't confirm with your family just now. Don't send any money until you have spoken to them yourself on their old number. A real emergency can wait a little.",
      "authorityScam": "Please listen carefully. There is no such thing as a digital arrest in the law. Police, the CBI or courts never ask for money on a video call. Hang up that call now, and don't give any OTP or money. I'm informing your family.",
      "alreadyPaid": "Don't panic, but call 1930 right away; the first few hours matter most. Then call your bank too. I'm informing your family right now.",
      "closing": "Take care. Whenever you are in doubt, press this same button. Namaste.",
      "thanks": "Thank you. I'm letting them know right now. Namaste."
    },
    "bn": {
      "preCall": "আমি এখনই আপনার পরিবারকে ফোন করছি। লাইনে থাকুন।",
      "verdictFake": "ভালো খবর। আমি আপনার পরিবারের সঙ্গে কথা বলেছি। ওনারা একদম ভালো আছেন, আর ওনারা আপনাকে কোনো ফোন করেননি। ওই ফোনটা ভুয়ো ছিল। কোনো টাকা বা OTP দেবেন না, আর ওই নম্বরটা ব্লক করে দিন।",
      "verdictUnconfirmed": "এই মুহূর্তে আমি আপনার পরিবারের সঙ্গে নিশ্চিত হতে পারিনি। যতক্ষণ না আপনি নিজে ওনাদের পুরনো নম্বরে কথা বলছেন, কোনো টাকা পাঠাবেন না। সত্যিকারের বিপদ হলে একটু অপেক্ষা করা যায়।",
      "authorityScam": "মন দিয়ে শুনুন। আইনে ডিজিটাল অ্যারেস্ট বলে কিছু নেই। পুলিশ, CBI বা আদালত কখনো ভিডিও কলে টাকা চায় না। এখনই ওই ফোনটা কেটে দিন, আর কোনো OTP বা টাকা দেবেন না। আমি আপনার পরিবারকে জানাচ্ছি।",
      "alreadyPaid": "ঘাবড়াবেন না, কিন্তু এখনই 1930-এ ফোন করুন, প্রথম কয়েক ঘণ্টাই সবচেয়ে জরুরি। তারপর আপনার ব্যাঙ্কেও ফোন করুন। আমি এখনই আপনার পরিবারকে খবর দিচ্ছি।",
      "closing": "নিজের খেয়াল রাখবেন। যখনই সন্দেহ হবে, এই বোতামটাই টিপবেন। নমস্কার।",
      "thanks": "ধন্যবাদ। আমি এখনই ওনাকে জানাচ্ছি। নমস্কার।"
    },
    "mr": {
      "preCall": "मी आत्ताच तुमच्या कुटुंबाला फोन करत आहे. कृपया लाइनवर थांबा.",
      "verdictFake": "चांगली बातमी. मी तुमच्या कुटुंबाशी बोलले आहे. ते अगदी ठीक आहेत आणि त्यांनी तुम्हाला कोणताही फोन केला नाही. तो फोन खोटा होता. कोणतेही पैसे किंवा OTP देऊ नका, आणि तो नंबर ब्लॉक करा.",
      "verdictUnconfirmed": "आत्ता मी तुमच्या कुटुंबाशी पक्की खात्री करू शकले नाही. तुम्ही स्वतः त्यांच्याशी त्यांच्या जुन्या नंबरवर बोलत नाही तोपर्यंत कोणतेही पैसे पाठवू नका. खरी अडचण असेल तर ती थोडा वेळ थांबू शकते.",
      "authorityScam": "नीट ऐका. कायद्यात डिजिटल अरेस्ट असं काहीही नसतं. पोलीस, CBI किंवा कोर्ट व्हिडिओ कॉलवर पैसे मागत नाहीत. आत्ताच तो कॉल कट करा, आणि कोणताही OTP किंवा पैसे देऊ नका. मी तुमच्या कुटुंबाला कळवत आहे.",
      "alreadyPaid": "घाबरू नका, पण आत्ताच 1930 वर फोन करा, सुरुवातीचे तास सर्वात महत्त्वाचे असतात. मग तुमच्या बँकेलाही फोन करा. मी आत्ताच तुमच्या कुटुंबाला कळवत आहे.",
      "closing": "स्वतःची काळजी घ्या. जेव्हा जेव्हा शंका येईल, हेच बटण दाबा. नमस्कार.",
      "thanks": "धन्यवाद. मी त्यांना आत्ताच सांगते. नमस्कार."
    },
    "te": {
      "preCall": "నేను ఇప్పుడే మీ కుటుంబానికి ఫోన్ చేస్తున్నాను. దయచేసి లైన్‌లోనే ఉండండి.",
      "verdictFake": "శుభవార్త. నేను మీ కుటుంబంతో మాట్లాడాను. వారు పూర్తిగా క్షేమంగా ఉన్నారు, వారు మీకు ఎలాంటి ఫోన్ చేయలేదు. ఆ ఫోన్ నకిలీది. ఎలాంటి డబ్బు గానీ OTP గానీ ఇవ్వకండి, ఆ నంబర్‌ను బ్లాక్ చేయండి.",
      "verdictUnconfirmed": "ప్రస్తుతం నేను మీ కుటుంబంతో ఖచ్చితంగా నిర్ధారించలేకపోయాను. మీరే స్వయంగా వారి పాత నంబర్‌లో వారితో మాట్లాడే వరకు ఎలాంటి డబ్బు పంపకండి. నిజమైన ఆపద అయితే కొంచెం ఆగవచ్చు.",
      "authorityScam": "జాగ్రత్తగా వినండి. చట్టంలో డిజిటల్ అరెస్ట్ అనేది ఏదీ లేదు. పోలీసులు, CBI లేదా కోర్టు వీడియో కాల్‌లో డబ్బు అడగరు. ఇప్పుడే ఆ కాల్ కట్ చేయండి, ఎలాంటి OTP గానీ డబ్బు గానీ ఇవ్వకండి. నేను మీ కుటుంబానికి తెలియజేస్తున్నాను.",
      "alreadyPaid": "కంగారు పడకండి, కానీ వెంటనే 1930కి ఫోన్ చేయండి, మొదటి కొన్ని గంటలే చాలా ముఖ్యం. తర్వాత మీ బ్యాంకుకు కూడా ఫోన్ చేయండి. నేను ఇప్పుడే మీ కుటుంబానికి తెలియజేస్తున్నాను.",
      "closing": "జాగ్రత్తగా ఉండండి. ఎప్పుడు అనుమానం వచ్చినా, ఇదే బటన్ నొక్కండి. నమస్తే.",
      "thanks": "ధన్యవాదాలు. నేను ఇప్పుడే వారికి చెబుతున్నాను. నమస్తే."
    },
    "ta": {
      "preCall": "நான் இப்போதே உங்கள் குடும்பத்தினரை அழைக்கிறேன். தயவுசெய்து லைனிலேயே இருங்கள்.",
      "verdictFake": "நல்ல செய்தி. நான் உங்கள் குடும்பத்தினரிடம் பேசினேன். அவர்கள் நலமாக இருக்கிறார்கள், அவர்கள் உங்களுக்கு எந்த அழைப்பும் செய்யவில்லை. அந்த அழைப்பு போலியானது. எந்தப் பணமும் OTP-யும் கொடுக்காதீர்கள், அந்த எண்ணை பிளாக் செய்யுங்கள்.",
      "verdictUnconfirmed": "இப்போது உங்கள் குடும்பத்தினரிடம் உறுதியாகப் பேச முடியவில்லை. நீங்களே அவர்களின் பழைய எண்ணில் அவர்களிடம் பேசும் வரை எந்தப் பணமும் அனுப்பாதீர்கள். உண்மையான அவசரம் என்றால் சிறிது நேரம் காத்திருக்கலாம்.",
      "authorityScam": "கவனமாகக் கேளுங்கள். சட்டத்தில் டிஜிட்டல் அரெஸ்ட் என்று எதுவும் இல்லை. போலீஸ், CBI அல்லது நீதிமன்றம் வீடியோ அழைப்பில் பணம் கேட்பதில்லை. இப்போதே அந்த அழைப்பைத் துண்டியுங்கள், எந்த OTP-யும் பணமும் கொடுக்காதீர்கள். நான் உங்கள் குடும்பத்தினருக்குத் தெரிவிக்கிறேன்.",
      "alreadyPaid": "பதற வேண்டாம், ஆனால் உடனே 1930-க்கு அழையுங்கள், முதல் சில மணி நேரங்கள்தான் மிக முக்கியம். பிறகு உங்கள் வங்கிக்கும் அழையுங்கள். நான் இப்போதே உங்கள் குடும்பத்தினருக்குத் தெரிவிக்கிறேன்.",
      "closing": "உங்களைக் கவனித்துக்கொள்ளுங்கள். எப்போது சந்தேகம் வந்தாலும், இதே பட்டனை அழுத்துங்கள். வணக்கம்.",
      "thanks": "நன்றி. நான் இப்போதே அவர்களிடம் சொல்கிறேன். வணக்கம்."
    },
    "gu": {
      "preCall": "હું હમણાં જ તમારા પરિવારને ફોન કરી રહી છું. કૃપા કરીને લાઇન પર રહો.",
      "verdictFake": "સારા સમાચાર. મેં તમારા પરિવાર સાથે વાત કરી લીધી છે. તેઓ બિલકુલ ઠીક છે અને તેમણે તમને કોઈ ફોન કર્યો નથી. તે ફોન નકલી હતો. કોઈ પૈસા કે OTP ન આપશો, અને તે નંબર બ્લોક કરી દો.",
      "verdictUnconfirmed": "અત્યારે હું તમારા પરિવાર સાથે પાકી વાત કરી શકી નથી. જ્યાં સુધી તમે પોતે તેમની સાથે તેમના જૂના નંબર પર વાત ન કરી લો, ત્યાં સુધી કોઈ પૈસા ન મોકલશો. સાચી મુશ્કેલી હશે તો તે થોડી રાહ જોઈ શકે છે.",
      "authorityScam": "ધ્યાનથી સાંભળો. કાયદામાં ડિજિટલ અરેસ્ટ જેવી કોઈ વસ્તુ નથી. પોલીસ, CBI કે કોર્ટ વીડિયો કૉલ પર પૈસા માંગતા નથી. હમણાં જ તે કૉલ કાપી નાખો, અને કોઈ OTP કે પૈસા ન આપશો. હું તમારા પરિવારને જાણ કરી રહી છું.",
      "alreadyPaid": "ગભરાશો નહીં, પણ હમણાં જ 1930 પર ફોન કરો, શરૂઆતના કલાકો સૌથી મહત્ત્વના છે. પછી તમારી બેંકને પણ ફોન કરો. હું હમણાં જ તમારા પરિવારને જાણ કરી રહી છું.",
      "closing": "તમારું ધ્યાન રાખજો. જ્યારે પણ શંકા થાય, આ જ બટન દબાવજો. નમસ્તે.",
      "thanks": "આભાર. હું તેમને હમણાં જ જણાવું છું. નમસ્તે."
    },
    "kn": {
      "preCall": "ನಾನು ಈಗಲೇ ನಿಮ್ಮ ಕುಟುಂಬಕ್ಕೆ ಕರೆ ಮಾಡುತ್ತಿದ್ದೇನೆ. ದಯವಿಟ್ಟು ಲೈನ್‌ನಲ್ಲೇ ಇರಿ.",
      "verdictFake": "ಒಳ್ಳೆಯ ಸುದ್ದಿ. ನಾನು ನಿಮ್ಮ ಕುಟುಂಬದವರೊಂದಿಗೆ ಮಾತನಾಡಿದ್ದೇನೆ. ಅವರು ಸಂಪೂರ್ಣವಾಗಿ ಚೆನ್ನಾಗಿದ್ದಾರೆ, ಮತ್ತು ಅವರು ನಿಮಗೆ ಯಾವುದೇ ಕರೆ ಮಾಡಿಲ್ಲ. ಆ ಕರೆ ನಕಲಿ ಆಗಿತ್ತು. ಯಾವುದೇ ಹಣ ಅಥವಾ OTP ಕೊಡಬೇಡಿ, ಮತ್ತು ಆ ನಂಬರ್ ಅನ್ನು ಬ್ಲಾಕ್ ಮಾಡಿ.",
      "verdictUnconfirmed": "ಈಗ ನಾನು ನಿಮ್ಮ ಕುಟುಂಬದವರೊಂದಿಗೆ ಖಚಿತವಾಗಿ ಮಾತನಾಡಲು ಆಗಲಿಲ್ಲ. ನೀವೇ ಅವರ ಹಳೆಯ ನಂಬರ್‌ನಲ್ಲಿ ಅವರೊಂದಿಗೆ ಮಾತನಾಡುವವರೆಗೆ ಯಾವುದೇ ಹಣ ಕಳುಹಿಸಬೇಡಿ. ನಿಜವಾದ ತೊಂದರೆ ಇದ್ದರೆ ಸ್ವಲ್ಪ ಕಾಯಬಹುದು.",
      "authorityScam": "ಗಮನವಿಟ್ಟು ಕೇಳಿ. ಕಾನೂನಿನಲ್ಲಿ ಡಿಜಿಟಲ್ ಅರೆಸ್ಟ್ ಎಂಬುದು ಯಾವುದೂ ಇಲ್ಲ. ಪೊಲೀಸ್, CBI ಅಥವಾ ನ್ಯಾಯಾಲಯ ವೀಡಿಯೊ ಕರೆಯಲ್ಲಿ ಹಣ ಕೇಳುವುದಿಲ್ಲ. ಈಗಲೇ ಆ ಕರೆಯನ್ನು ಕಟ್ ಮಾಡಿ, ಮತ್ತು ಯಾವುದೇ OTP ಅಥವಾ ಹಣ ಕೊಡಬೇಡಿ. ನಾನು ನಿಮ್ಮ ಕುಟುಂಬಕ್ಕೆ ತಿಳಿಸುತ್ತಿದ್ದೇನೆ.",
      "alreadyPaid": "ಗಾಬರಿಯಾಗಬೇಡಿ, ಆದರೆ ಈಗಲೇ 1930 ಗೆ ಕರೆ ಮಾಡಿ, ಮೊದಲ ಕೆಲವು ಗಂಟೆಗಳೇ ಅತ್ಯಂತ ಮುಖ್ಯ. ನಂತರ ನಿಮ್ಮ ಬ್ಯಾಂಕಿಗೂ ಕರೆ ಮಾಡಿ. ನಾನು ಈಗಲೇ ನಿಮ್ಮ ಕುಟುಂಬಕ್ಕೆ ತಿಳಿಸುತ್ತಿದ್ದೇನೆ.",
      "closing": "ನಿಮ್ಮ ಬಗ್ಗೆ ಕಾಳಜಿ ವಹಿಸಿ. ಯಾವಾಗ ಅನುಮಾನ ಬಂದರೂ, ಇದೇ ಬಟನ್ ಒತ್ತಿ. ನಮಸ್ಕಾರ.",
      "thanks": "ಧನ್ಯವಾದಗಳು. ನಾನು ಈಗಲೇ ಅವರಿಗೆ ತಿಳಿಸುತ್ತಿದ್ದೇನೆ. ನಮಸ್ಕಾರ."
    },
    "ml": {
      "preCall": "ഞാൻ ഇപ്പോൾ തന്നെ നിങ്ങളുടെ കുടുംബത്തെ വിളിക്കുകയാണ്. ദയവായി ലൈനിൽ തുടരുക.",
      "verdictFake": "നല്ല വാർത്ത. ഞാൻ നിങ്ങളുടെ കുടുംബവുമായി സംസാരിച്ചു. അവർ പൂർണ്ണമായും സുഖമായിരിക്കുന്നു, അവർ നിങ്ങളെ വിളിച്ചിട്ടില്ല. ആ കോൾ വ്യാജമായിരുന്നു. പണമോ OTP-യോ ഒന്നും കൊടുക്കരുത്, ആ നമ്പർ ബ്ലോക്ക് ചെയ്യുക.",
      "verdictUnconfirmed": "ഇപ്പോൾ എനിക്ക് നിങ്ങളുടെ കുടുംബവുമായി ഉറപ്പായി സംസാരിക്കാൻ കഴിഞ്ഞില്ല. നിങ്ങൾ സ്വയം അവരുടെ പഴയ നമ്പറിൽ അവരുമായി സംസാരിക്കുന്നതുവരെ പണമൊന്നും അയയ്ക്കരുത്. യഥാർത്ഥ അത്യാവശ്യമാണെങ്കിൽ അല്പം കാത്തിരിക്കാം.",
      "authorityScam": "ശ്രദ്ധിച്ച് കേൾക്കൂ. നിയമത്തിൽ ഡിജിറ്റൽ അറസ്റ്റ് എന്നൊന്നില്ല. പോലീസോ CBI-യോ കോടതിയോ വീഡിയോ കോളിൽ പണം ചോദിക്കില്ല. ഇപ്പോൾ തന്നെ ആ കോൾ കട്ട് ചെയ്യുക, OTP-യോ പണമോ ഒന്നും കൊടുക്കരുത്. ഞാൻ നിങ്ങളുടെ കുടുംബത്തെ അറിയിക്കുന്നു.",
      "alreadyPaid": "പരിഭ്രമിക്കേണ്ട, പക്ഷേ ഉടൻ തന്നെ 1930-ൽ വിളിക്കുക, ആദ്യത്തെ കുറച്ച് മണിക്കൂറുകളാണ് ഏറ്റവും പ്രധാനം. പിന്നെ നിങ്ങളുടെ ബാങ്കിനെയും വിളിക്കുക. ഞാൻ ഇപ്പോൾ തന്നെ നിങ്ങളുടെ കുടുംബത്തെ അറിയിക്കുന്നു.",
      "closing": "സ്വയം ശ്രദ്ധിക്കൂ. എപ്പോൾ സംശയം തോന്നിയാലും, ഇതേ ബട്ടൺ അമർത്തൂ. നമസ്കാരം.",
      "thanks": "നന്ദി. ഞാൻ ഇപ്പോൾ തന്നെ അവരെ അറിയിക്കുന്നു. നമസ്കാരം."
    },
    "pa": {
      "preCall": "ਮੈਂ ਹੁਣੇ ਤੁਹਾਡੇ ਪਰਿਵਾਰ ਨੂੰ ਫ਼ੋਨ ਕਰ ਰਹੀ ਹਾਂ। ਲਾਈਨ ਉੱਤੇ ਬਣੇ ਰਹੋ।",
      "verdictFake": "ਚੰਗੀ ਖ਼ਬਰ। ਮੈਂ ਤੁਹਾਡੇ ਪਰਿਵਾਰ ਨਾਲ ਗੱਲ ਕਰ ਲਈ ਹੈ। ਉਹ ਬਿਲਕੁਲ ਠੀਕ ਹਨ ਅਤੇ ਉਨ੍ਹਾਂ ਨੇ ਤੁਹਾਨੂੰ ਕੋਈ ਫ਼ੋਨ ਨਹੀਂ ਕੀਤਾ। ਉਹ ਫ਼ੋਨ ਨਕਲੀ ਸੀ। ਕੋਈ ਪੈਸਾ ਜਾਂ OTP ਨਾ ਦਿਓ, ਅਤੇ ਉਸ ਨੰਬਰ ਨੂੰ ਬਲੌਕ ਕਰ ਦਿਓ।",
      "verdictUnconfirmed": "ਹੁਣੇ ਮੈਂ ਤੁਹਾਡੇ ਪਰਿਵਾਰ ਨਾਲ ਪੱਕੀ ਗੱਲ ਨਹੀਂ ਕਰ ਸਕੀ। ਜਦੋਂ ਤੱਕ ਤੁਸੀਂ ਆਪ ਉਨ੍ਹਾਂ ਨਾਲ ਉਨ੍ਹਾਂ ਦੇ ਪੁਰਾਣੇ ਨੰਬਰ ਉੱਤੇ ਗੱਲ ਨਾ ਕਰ ਲਓ, ਕੋਈ ਪੈਸਾ ਨਾ ਭੇਜੋ। ਅਸਲੀ ਮੁਸੀਬਤ ਹੋਵੇਗੀ ਤਾਂ ਉਹ ਥੋੜ੍ਹਾ ਇੰਤਜ਼ਾਰ ਕਰ ਸਕਦੀ ਹੈ।",
      "authorityScam": "ਧਿਆਨ ਨਾਲ ਸੁਣੋ। ਕਾਨੂੰਨ ਵਿੱਚ ਡਿਜੀਟਲ ਅਰੈਸਟ ਨਾਂ ਦੀ ਕੋਈ ਚੀਜ਼ ਨਹੀਂ ਹੈ। ਪੁਲਿਸ, CBI ਜਾਂ ਅਦਾਲਤ ਵੀਡੀਓ ਕਾਲ ਉੱਤੇ ਪੈਸੇ ਨਹੀਂ ਮੰਗਦੇ। ਹੁਣੇ ਉਹ ਕਾਲ ਕੱਟ ਦਿਓ, ਅਤੇ ਕੋਈ OTP ਜਾਂ ਪੈਸਾ ਨਾ ਦਿਓ। ਮੈਂ ਤੁਹਾਡੇ ਪਰਿਵਾਰ ਨੂੰ ਦੱਸ ਰਹੀ ਹਾਂ।",
      "alreadyPaid": "ਘਬਰਾਓ ਨਾ, ਪਰ ਹੁਣੇ ਤੁਰੰਤ 1930 ਉੱਤੇ ਫ਼ੋਨ ਕਰੋ, ਸ਼ੁਰੂ ਦੇ ਘੰਟੇ ਸਭ ਤੋਂ ਜ਼ਰੂਰੀ ਹੁੰਦੇ ਹਨ। ਫਿਰ ਆਪਣੇ ਬੈਂਕ ਨੂੰ ਵੀ ਫ਼ੋਨ ਕਰੋ। ਮੈਂ ਤੁਹਾਡੇ ਪਰਿਵਾਰ ਨੂੰ ਹੁਣੇ ਖ਼ਬਰ ਕਰ ਰਹੀ ਹਾਂ।",
      "closing": "ਆਪਣਾ ਧਿਆਨ ਰੱਖੋ। ਜਦੋਂ ਵੀ ਸ਼ੱਕ ਹੋਵੇ, ਇਹੀ ਬਟਨ ਦਬਾਓ। ਸਤ ਸ੍ਰੀ ਅਕਾਲ।",
      "thanks": "ਧੰਨਵਾਦ। ਮੈਂ ਉਨ੍ਹਾਂ ਨੂੰ ਹੁਣੇ ਦੱਸ ਰਹੀ ਹਾਂ। ਸਤ ਸ੍ਰੀ ਅਕਾਲ।"
    },
    "od": {
      "preCall": "ମୁଁ ଏବେ ଆପଣଙ୍କ ପରିବାରକୁ ଫୋନ କରୁଛି। ଦୟାକରି ଲାଇନରେ ରୁହନ୍ତୁ।",
      "verdictFake": "ଭଲ ଖବର। ମୁଁ ଆପଣଙ୍କ ପରିବାର ସହ କଥା ହୋଇସାରିଛି। ସେମାନେ ସମ୍ପୂର୍ଣ୍ଣ ଭଲରେ ଅଛନ୍ତି, ଆଉ ସେମାନେ ଆପଣଙ୍କୁ କୌଣସି ଫୋନ କରିନାହାନ୍ତି। ସେହି ଫୋନଟି ନକଲି ଥିଲା। କୌଣସି ଟଙ୍କା କିମ୍ବା OTP ଦିଅନ୍ତୁ ନାହିଁ, ଆଉ ସେହି ନମ୍ବରକୁ ବ୍ଲକ କରିଦିଅନ୍ତୁ।",
      "verdictUnconfirmed": "ଏବେ ମୁଁ ଆପଣଙ୍କ ପରିବାର ସହ ନିଶ୍ଚିତ ଭାବେ କଥା ହୋଇପାରିଲି ନାହିଁ। ଆପଣ ନିଜେ ସେମାନଙ୍କ ପୁରୁଣା ନମ୍ବରରେ ସେମାନଙ୍କ ସହ କଥା ନ ହେବା ପର୍ଯ୍ୟନ୍ତ କୌଣସି ଟଙ୍କା ପଠାନ୍ତୁ ନାହିଁ। ପ୍ରକୃତ ବିପଦ ହେଲେ ଟିକେ ଅପେକ୍ଷା କରାଯାଇପାରେ।",
      "authorityScam": "ଧ୍ୟାନ ଦେଇ ଶୁଣନ୍ତୁ। ଆଇନରେ ଡିଜିଟାଲ ଆରେଷ୍ଟ ବୋଲି କିଛି ନାହିଁ। ପୋଲିସ, CBI କିମ୍ବା କୋର୍ଟ ଭିଡିଓ କଲରେ ଟଙ୍କା ମାଗନ୍ତି ନାହିଁ। ଏବେ ସେହି କଲ କାଟି ଦିଅନ୍ତୁ, ଆଉ କୌଣସି OTP କିମ୍ବା ଟଙ୍କା ଦିଅନ୍ତୁ ନାହିଁ। ମୁଁ ଆପଣଙ୍କ ପରିବାରକୁ ଜଣାଉଛି।",
      "alreadyPaid": "ଘାବରନ୍ତୁ ନାହିଁ, କିନ୍ତୁ ଏବେ ତୁରନ୍ତ 1930ରେ ଫୋନ କରନ୍ତୁ, ପ୍ରଥମ କିଛି ଘଣ୍ଟା ସବୁଠାରୁ ଜରୁରୀ। ତା'ପରେ ଆପଣଙ୍କ ବ୍ୟାଙ୍କକୁ ମଧ୍ୟ ଫୋନ କରନ୍ତୁ। ମୁଁ ଏବେ ଆପଣଙ୍କ ପରିବାରକୁ ଖବର ଦେଉଛି।",
      "closing": "ନିଜର ଯତ୍ନ ନିଅନ୍ତୁ। ଯେତେବେଳେ ବି ସନ୍ଦେହ ହେବ, ଏହି ବଟନ ହିଁ ଦବାନ୍ତୁ। ନମସ୍କାର।",
      "thanks": "ଧନ୍ୟବାଦ। ମୁଁ ଏବେ ତାଙ୍କୁ ଜଣାଉଛି। ନମସ୍କାର।"
    },
    "as": {
      "preCall": "মই এতিয়াই আপোনাৰ পৰিয়ালক ফোন কৰি আছোঁ। অনুগ্ৰহ কৰি লাইনত থাকক।",
      "verdictFake": "ভাল খবৰ। মই আপোনাৰ পৰিয়ালৰ সৈতে কথা পাতিলোঁ। তেওঁলোক সম্পূৰ্ণ ভালে আছে, আৰু তেওঁলোকে আপোনাক কোনো ফোন কৰা নাই। সেই ফোনটো ভুৱা আছিল। কোনো টকা বা OTP নিদিব, আৰু সেই নম্বৰটো ব্লক কৰি দিয়ক।",
      "verdictUnconfirmed": "এই মুহূৰ্তত মই আপোনাৰ পৰিয়ালৰ সৈতে নিশ্চিতকৈ কথা পাতিব নোৱাৰিলোঁ। আপুনি নিজে তেওঁলোকৰ পুৰণি নম্বৰত তেওঁলোকৰ সৈতে কথা নোহোৱালৈকে কোনো টকা নপঠিয়াব। সঁচা বিপদ হ'লে অলপ অপেক্ষা কৰিব পাৰি।",
      "authorityScam": "মন দি শুনক। আইনত ডিজিটেল এৰেষ্ট বুলি একো নাই। পুলিচ, CBI বা আদালতে ভিডিঅ' কলত টকা নিবিচাৰে। এতিয়াই সেই কলটো কাটি দিয়ক, আৰু কোনো OTP বা টকা নিদিব। মই আপোনাৰ পৰিয়ালক জনাই আছোঁ।",
      "alreadyPaid": "আতংকিত নহ'ব, কিন্তু এতিয়াই 1930 ত ফোন কৰক, প্ৰথম কেইঘণ্টামানেই আটাইতকৈ গুৰুত্বপূৰ্ণ। তাৰ পিছত আপোনাৰ বেংকলৈও ফোন কৰক। মই এতিয়াই আপোনাৰ পৰিয়ালক খবৰ দি আছোঁ।",
      "closing": "নিজৰ যত্ন ল'ব। যেতিয়াই সন্দেহ হয়, এই বুটামটোকে টিপিব। নমস্কাৰ।",
      "thanks": "ধন্যবাদ। মই এতিয়াই তেওঁক জনাই আছোঁ। নমস্কাৰ।"
    },
    "hi-Latn": {
      "preCall": "Main abhi aapke parivaar ko call kar rahi hoon. Line par bane rahiye.",
      "verdictFake": "Achhi khabar. Maine aapke parivaar se baat kar li hai. Woh bilkul theek hain aur unhone aapko koi call nahi kiya. Woh call nakli tha. Koi paisa ya OTP mat dijiye, aur us number ko block kar dijiye.",
      "verdictUnconfirmed": "Abhi main aapke parivaar se pakki baat nahi kar paayi. Jab tak aap khud unse unke purane number par baat na kar lein, koi paisa mat bhejiye. Asli musibat hogi toh woh thoda intezaar kar sakti hai.",
      "authorityScam": "Dhyaan se suniye. Digital arrest naam ki koi cheez kaanoon mein nahi hai. Police, CBI ya court video call par paise nahi maangte. Abhi woh call kaat dijiye, aur koi OTP ya paisa mat dijiye. Main aapke parivaar ko bata rahi hoon.",
      "alreadyPaid": "Ghabraiye mat, par abhi turant 1930 par call kijiye, shuru ke ghante sabse zaroori hote hain. Phir apne bank ko bhi call kijiye. Main aapke parivaar ko abhi khabar kar rahi hoon.",
      "closing": "Apna dhyaan rakhiye. Jab bhi shak ho, yahi button dabaiye. Namaste.",
      "thanks": "Shukriya. Main unhe abhi bata rahi hoon. Namaste."
    }
  };

  const GREETINGS = {
    "hi": {
      "parent": "नमस्ते {parent_name} जी, मैं साथी, असली है से बोल रही हूँ। अभी आपको किसने कॉल किया था, और वो क्या माँग रहे थे?",
      "check": "नमस्ते {child_name}, मैं साथी, असली है से बोल रही हूँ, {parent_name} जी की सुरक्षा लाइन। अभी उन्हें एक कॉल आया जिसमें किसी ने {claimed_name} बनकर पैसे माँगे। क्या आपने अभी उन्हें कॉल किया था?"
    },
    "en": {
      "parent": "Namaste {parent_name} ji, I'm Saathi, speaking from Asli hai. Who called you just now, and what were they asking for?",
      "check": "Namaste {child_name}, I'm Saathi, speaking from Asli hai, {parent_name} ji's safety line. {parent_name} ji just got a call where someone pretended to be {claimed_name} and asked for money. Did you just call them?"
    },
    "bn": {
      "parent": "নমস্কার {parent_name}, আমি সাথী, আসলি হ্যায় থেকে বলছি। এইমাত্র আপনাকে কে ফোন করেছিল, আর তারা কী চাইছিল?",
      "check": "নমস্কার {child_name}, আমি সাথী, আসলি হ্যায় থেকে বলছি, {parent_name}-এর সুরক্ষা লাইন। এইমাত্র ওনার কাছে একটা ফোন এসেছিল, যেখানে কেউ {claimed_name} সেজে টাকা চেয়েছে। আপনি কি এইমাত্র ওনাকে ফোন করেছিলেন?"
    },
    "mr": {
      "parent": "नमस्कार {parent_name} जी, मी साथी, असली है मधून बोलत आहे. आत्ता तुम्हाला कोणी फोन केला होता, आणि ते काय मागत होते?",
      "check": "नमस्कार {child_name}, मी साथी, असली है मधून बोलत आहे, {parent_name} जी यांची सुरक्षा लाइन. आत्ताच त्यांना एक फोन आला, ज्यात कोणीतरी {claimed_name} बनून पैसे मागितले. तुम्ही आत्ता त्यांना फोन केला होता का?"
    },
    "te": {
      "parent": "నమస్తే {parent_name} గారు, నేను సాథీ, అస్లీ హై నుండి మాట్లాడుతున్నాను. ఇప్పుడే మీకు ఎవరు ఫోన్ చేశారు, వాళ్ళు ఏమి అడిగారు?",
      "check": "నమస్తే {child_name}, నేను సాథీ, అస్లీ హై నుండి మాట్లాడుతున్నాను, {parent_name} గారి భద్రతా లైన్. ఇప్పుడే వారికి ఒక ఫోన్ వచ్చింది, అందులో ఎవరో {claimed_name} లాగా నటించి డబ్బు అడిగారు. మీరు ఇప్పుడే వారికి ఫోన్ చేశారా?"
    },
    "ta": {
      "parent": "வணக்கம் {parent_name} அவர்களே, நான் சாத்தி, அஸ்லி ஹை-யிலிருந்து பேசுகிறேன். இப்போது உங்களுக்கு யார் போன் செய்தார்கள், அவர்கள் என்ன கேட்டார்கள்?",
      "check": "வணக்கம் {child_name}, நான் சாத்தி, அஸ்லி ஹை-யிலிருந்து பேசுகிறேன், {parent_name} அவர்களின் பாதுகாப்பு லைன். இப்போது அவர்களுக்கு ஒரு அழைப்பு வந்தது, அதில் யாரோ {claimed_name} போல நடித்து பணம் கேட்டார்கள். நீங்கள் இப்போது அவர்களுக்கு போன் செய்தீர்களா?"
    },
    "gu": {
      "parent": "નમસ્તે {parent_name} જી, હું સાથી, અસલી હૈ તરફથી બોલી રહી છું. હમણાં તમને કોણે ફોન કર્યો હતો, અને તેઓ શું માંગી રહ્યા હતા?",
      "check": "નમસ્તે {child_name}, હું સાથી, અસલી હૈ તરફથી બોલી રહી છું, {parent_name} જીની સુરક્ષા લાઇન. હમણાં જ તેમને એક ફોન આવ્યો, જેમાં કોઈએ {claimed_name} બનીને પૈસા માંગ્યા. શું તમે હમણાં તેમને ફોન કર્યો હતો?"
    },
    "kn": {
      "parent": "ನಮಸ್ಕಾರ {parent_name} ಅವರೇ, ನಾನು ಸಾಥಿ, ಅಸ್ಲಿ ಹೈ ಇಂದ ಮಾತನಾಡುತ್ತಿದ್ದೇನೆ. ಈಗ ನಿಮಗೆ ಯಾರು ಫೋನ್ ಮಾಡಿದ್ದರು, ಮತ್ತು ಅವರು ಏನು ಕೇಳುತ್ತಿದ್ದರು?",
      "check": "ನಮಸ್ಕಾರ {child_name}, ನಾನು ಸಾಥಿ, ಅಸ್ಲಿ ಹೈ ಇಂದ ಮಾತನಾಡುತ್ತಿದ್ದೇನೆ, {parent_name} ಅವರ ಸುರಕ್ಷತಾ ಲೈನ್. ಈಗ ತಾನೇ ಅವರಿಗೆ ಒಂದು ಕರೆ ಬಂತು, ಅದರಲ್ಲಿ ಯಾರೋ {claimed_name} ಎಂದು ನಟಿಸಿ ಹಣ ಕೇಳಿದರು. ನೀವು ಈಗ ಅವರಿಗೆ ಫೋನ್ ಮಾಡಿದ್ದೀರಾ?"
    },
    "ml": {
      "parent": "നമസ്കാരം {parent_name}, ഞാൻ സാഥി, അസ്‌ലി ഹൈയിൽ നിന്നാണ് സംസാരിക്കുന്നത്. ഇപ്പോൾ നിങ്ങളെ ആരാണ് വിളിച്ചത്, അവർ എന്താണ് ചോദിച്ചത്?",
      "check": "നമസ്കാരം {child_name}, ഞാൻ സാഥി, അസ്‌ലി ഹൈയിൽ നിന്നാണ് സംസാരിക്കുന്നത്, {parent_name}-ന്റെ സുരക്ഷാ ലൈൻ. ഇപ്പോൾ അവർക്ക് ഒരു കോൾ വന്നു, അതിൽ ആരോ {claimed_name} ആയി അഭിനയിച്ച് പണം ചോദിച്ചു. നിങ്ങൾ ഇപ്പോൾ അവരെ വിളിച്ചിരുന്നോ?"
    },
    "pa": {
      "parent": "ਸਤ ਸ੍ਰੀ ਅਕਾਲ {parent_name} ਜੀ, ਮੈਂ ਸਾਥੀ, ਅਸਲੀ ਹੈ ਤੋਂ ਬੋਲ ਰਹੀ ਹਾਂ। ਹੁਣੇ ਤੁਹਾਨੂੰ ਕਿਸ ਨੇ ਫ਼ੋਨ ਕੀਤਾ ਸੀ, ਅਤੇ ਉਹ ਕੀ ਮੰਗ ਰਹੇ ਸਨ?",
      "check": "ਸਤ ਸ੍ਰੀ ਅਕਾਲ {child_name}, ਮੈਂ ਸਾਥੀ, ਅਸਲੀ ਹੈ ਤੋਂ ਬੋਲ ਰਹੀ ਹਾਂ, {parent_name} ਜੀ ਦੀ ਸੁਰੱਖਿਆ ਲਾਈਨ। ਹੁਣੇ ਉਨ੍ਹਾਂ ਨੂੰ ਇੱਕ ਫ਼ੋਨ ਆਇਆ, ਜਿਸ ਵਿੱਚ ਕਿਸੇ ਨੇ {claimed_name} ਬਣ ਕੇ ਪੈਸੇ ਮੰਗੇ। ਕੀ ਤੁਸੀਂ ਹੁਣੇ ਉਨ੍ਹਾਂ ਨੂੰ ਫ਼ੋਨ ਕੀਤਾ ਸੀ?"
    },
    "od": {
      "parent": "ନମସ୍କାର {parent_name}, ମୁଁ ସାଥୀ, ଅସଲି ହୈ ତରଫରୁ କହୁଛି। ଏବେ ଆପଣଙ୍କୁ କିଏ ଫୋନ କରିଥିଲା, ଆଉ ସେମାନେ କ'ଣ ମାଗୁଥିଲେ?",
      "check": "ନମସ୍କାର {child_name}, ମୁଁ ସାଥୀ, ଅସଲି ହୈ ତରଫରୁ କହୁଛି, {parent_name}ଙ୍କ ସୁରକ୍ଷା ଲାଇନ। ଏବେ ତାଙ୍କୁ ଗୋଟିଏ ଫୋନ ଆସିଥିଲା, ଯେଉଁଥିରେ କେହି {claimed_name} ସାଜି ଟଙ୍କା ମାଗିଲେ। ଆପଣ କ'ଣ ଏବେ ତାଙ୍କୁ ଫୋନ କରିଥିଲେ?"
    },
    "as": {
      "parent": "নমস্কাৰ {parent_name}, মই সাথী, অসলী হৈ-ৰ পৰা কৈছোঁ। এইমাত্ৰ আপোনাক কোনে ফোন কৰিছিল, আৰু তেওঁলোকে কি বিচাৰিছিল?",
      "check": "নমস্কাৰ {child_name}, মই সাথী, অসলী হৈ-ৰ পৰা কৈছোঁ, {parent_name}ৰ সুৰক্ষা লাইন। এইমাত্ৰ তেওঁলৈ এটা ফোন আহিছিল, য'ত কোনোবাই {claimed_name} সাজি টকা বিচাৰিছিল। আপুনি এইমাত্ৰ তেওঁক ফোন কৰিছিল নেকি?"
    },
    "hi-Latn": {
      "parent": "Namaste {parent_name} ji, main Saathi, Asli hai se bol rahi hoon. Abhi aapko kisne call kiya tha, aur woh kya maang rahe the?",
      "check": "Namaste {child_name}, main Saathi, Asli hai se bol rahi hoon, {parent_name} ji ki suraksha line. Abhi unhe ek call aaya jismein kisi ne {claimed_name} bankar paise maange. Kya aapne abhi unhe call kiya tha?"
    }
  };

  const VOICES = [
    {
      "code": "hi",
      "native": "हिंदी",
      "voice": "Aparna, Sarvam bulbul:v4-flash"
    },
    {
      "code": "en",
      "native": "English",
      "voice": "Aparna, Sarvam bulbul:v4-flash"
    },
    {
      "code": "bn",
      "native": "বাংলা",
      "voice": "Roopa, Sarvam bulbul:v4-flash"
    },
    {
      "code": "mr",
      "native": "मराठी",
      "voice": "Ishita, Sarvam bulbul:v4-flash"
    },
    {
      "code": "te",
      "native": "తెలుగు",
      "voice": "Kavitha, Sarvam bulbul:v4-flash"
    },
    {
      "code": "ta",
      "native": "தமிழ்",
      "voice": "Kavya, Sarvam bulbul:v3"
    },
    {
      "code": "gu",
      "native": "ગુજરાતી",
      "voice": "Pooja, Sarvam bulbul:v4-flash"
    },
    {
      "code": "kn",
      "native": "ಕನ್ನಡ",
      "voice": "Chaitra, Sarvam bulbul:v4-flash"
    },
    {
      "code": "ml",
      "native": "മലയാളം",
      "voice": "Kavya, Sarvam bulbul:v3"
    },
    {
      "code": "pa",
      "native": "ਪੰਜਾਬੀ",
      "voice": "Kavya, Sarvam bulbul:v3"
    },
    {
      "code": "od",
      "native": "ଓଡ଼ିଆ",
      "voice": "Kavya, Sarvam bulbul:v3"
    },
    {
      "code": "as",
      "native": "অসমীয়া",
      "voice": "Kavya, Sarvam bulbul:v3"
    }
  ];
  const SPEED = 3;
  const t = (key, vars) => window.asli.t(key, vars);
  const htmlLang = (code) => (code === "od" ? "or" : code);
  const defaultCall = (lang) => (VOICES.some((v) => v.code === lang) ? lang : "hi");

  function fitDisc() {
    const disc = document.querySelector(".mini-seal .disc");
    if (!disc) return;
    disc.style.fontSize = "";
    let size = parseFloat(getComputedStyle(disc).fontSize);
    while (disc.scrollWidth > disc.clientWidth && size > 12) {
      size -= 1;
      disc.style.fontSize = size + "px";
    }
  }

  function languageOptions(select, current) {
    const page = window.asli.lang();
    select.replaceChildren(...VOICES.map((v) => {
      const option = document.createElement("option");
      option.value = v.code;
      option.lang = htmlLang(v.code);
      option.textContent = v.code === page ? v.native : `${v.native} (${t("lang." + v.code)})`;
      option.dataset.native = v.native;
      option.dataset.local = v.code === page ? "" : t("lang." + v.code);
      return option;
    }));
    select.value = current;
  }

  const choice = document.getElementById("lang-choice");
  if (choice) {
    const say = document.getElementById("lang-line");
    const voice = document.getElementById("lang-voice");
    const paintVoice = () => {
      const v = VOICES.find((x) => x.code === choice.value) || VOICES[0];
      say.lang = htmlLang(v.code);
      say.textContent = FIXED[v.code].verdictFake;
      voice.textContent = `${t("langs.voice")} ${v.voice}`;
    };
    choice.addEventListener("change", paintVoice);
    window.asli.onLang((lang) => {
      languageOptions(choice, choice.value || defaultCall(lang));
      paintVoice();
      fitDisc();
    });
  }

  const sim = document.getElementById("sim");
  if (!sim) return;

  const opening = [
    { t: 0, phone: "parent", event: "ev.press" },
    { t: 5, phone: "parent", state: "on", event: "ev.callback" },
    { t: 7, phone: "parent", who: "saathi", fixed: true, greet: "parent" },
  ];
  const callFamily = (claimed) => [
    { t: 22, phone: "parent", who: "saathi", fixed: true, say: "preCall" },
    { t: 23, phone: "family", state: "rahulRinging", event: "ev.rahulRings" },
    { t: 30, phone: "family", state: "rahulOn", who: "check", fixed: true, greet: "check", claimed },
    { t: 32, phone: "parent", who: "saathi", line: "call.holding" },
  ];
  const SCENARIOS = {
    fake: [
      ...opening,
      { t: 15, phone: "parent", who: "sunita", line: "call.fake.parent" },
      ...callFamily("son"),
      { t: 41, phone: "family", who: "rahul", line: "call.rahul.no" },
      { t: 43, phone: "family", state: "ended", who: "check", fixed: true, say: "thanks" },
      { t: 44, phone: "parent", event: "ev.safeFires" },
      { t: 44, phone: "parent", who: "saathi", fixed: true, tone: "safe", say: "verdictFake", verdict: ["verdict.fake", "safe"] },
      { t: 52, phone: "family", state: "alerted", event: "ev.summary" },
    ],
    real: [
      ...opening,
      { t: 15, phone: "parent", who: "sunita", line: "call.real.parent" },
      ...callFamily("rahul"),
      { t: 40, phone: "family", who: "rahul", line: "call.rahul.yes" },
      { t: 43, phone: "family", who: "check", line: "call.askWord" },
      { t: 47, phone: "family", who: "rahul", line: "call.familyWord" },
      { t: 49, phone: "family", state: "ended", who: "check", fixed: true, say: "thanks" },
      { t: 50, phone: "parent", event: "ev.wordMatches" },
      { t: 51, phone: "parent", who: "saathi", tone: "safe", line: "call.verdictReal", verdict: ["verdict.real", "safe"] },
    ],
    cbi: [
      ...opening,
      { t: 15, phone: "parent", who: "sunita", line: "call.cbi.parent" },
      { t: 21, phone: "parent", who: "saathi", fixed: true, tone: "warn", say: "authorityScam", verdict: ["verdict.cbi", "warn"] },
      { t: 24, phone: "family", state: "alerted", event: "ev.alert" },
      { t: 36, phone: "parent", who: "sunita", line: "call.cbi.hangup" },
      { t: 39, phone: "parent", who: "saathi", line: "call.cbi.block" },
      { t: 44, phone: "parent", who: "sunita", line: "call.cbi.thanks" },
      { t: 46, phone: "parent", state: "ended", who: "saathi", fixed: true, say: "closing" },
    ],
    paid: [
      ...opening,
      { t: 15, phone: "parent", who: "sunita", line: "call.paid.parent" },
      { t: 20, phone: "parent", who: "saathi", fixed: true, tone: "warn", say: "alreadyPaid", verdict: ["verdict.paid", "warn"] },
      { t: 23, phone: "family", state: "alerted", event: "ev.alertMother" },
      { t: 34, phone: "parent", who: "sunita", line: "call.paid.calling" },
      { t: 37, phone: "parent", state: "ended", who: "saathi", fixed: true, say: "closing" },
    ],
    noanswer: [
      ...opening,
      { t: 15, phone: "parent", who: "sunita", line: "call.fake.parent" },
      { t: 22, phone: "parent", who: "saathi", fixed: true, say: "preCall" },
      { t: 23, phone: "family", state: "rahulRinging", event: "ev.rahulRings" },
      { t: 37, phone: "parent", who: "saathi", line: "call.none.holding1" },
      { t: 50, phone: "family", state: "rahulMissed", event: "ev.nextContact" },
      { t: 51, phone: "family", state: "priyaRinging", event: "ev.priyaRings" },
      { t: 52, phone: "parent", who: "saathi", line: "call.none.holding2" },
      { t: 80, phone: "family", state: "priyaMissed", event: "ev.priyaMissed" },
      { t: 97, phone: "parent", event: "ev.timeout" },
      { t: 97, phone: "parent", who: "saathi", fixed: true, tone: "warn", say: "verdictUnconfirmed", verdict: ["verdict.none", "warn"] },
    ],
  };
  const SIDE = { saathi: "agent", check: "agent", sunita: "person", rahul: "person" };

  const screens = { parent: document.getElementById("parent-log"), family: document.getElementById("family-log") };
  const stateEls = { parent: document.getElementById("parent-state"), family: document.getElementById("family-state") };
  const clock = document.getElementById("sim-seconds");
  const verdictEl = document.getElementById("sim-verdict");
  const playBtn = document.getElementById("sim-play");
  const stepBtn = document.getElementById("sim-step");
  const callSelect = document.getElementById("call-lang");

  let steps = [];
  let next = 0;
  let simTime = 0;
  let running = false;
  let lastTick = 0;
  let timer = null;
  let frame = null;
  let callLang = "hi";
  let callChosen = false;
  let callDict = {};
  let pageDict = {};

  function spoken(step, lang, dict) {
    if (step.say) return FIXED[lang][step.say];
    if (step.greet) {
      const names = {
        parent_name: dict["call.name.sunita"],
        child_name: dict["call.name.rahul"],
        claimed_name: step.claimed === "son" ? dict["call.claimed.son"] : dict["call.name.rahul"],
      };
      return GREETINGS[lang][step.greet].replace(/\{(\w+)\}/g, (match, key) => names[key] ?? match);
    }
    return dict[step.line] || "";
  }

  function render(step) {
    const line = document.createElement("div");
    if (step.event) {
      line.className = "line event";
      line.textContent = t(step.event);
    } else {
      line.className = `line ${SIDE[step.who]}${step.fixed ? " fixed" : ""}${step.tone ? " verdict-" + step.tone : ""}`;
      const who = document.createElement("span");
      who.className = "who";
      who.textContent = t("who." + step.who);
      if (step.fixed) {
        const badge = document.createElement("span");
        badge.className = "badge";
        badge.textContent = t("sim.fixed");
        who.append(" ", badge);
      }
      const bubble = document.createElement("span");
      bubble.className = "bubble";
      const said = document.createElement("span");
      said.className = "said";
      said.lang = htmlLang(callLang);
      said.textContent = spoken(step, callLang, callDict);
      bubble.append(said);
      const page = window.asli.lang();
      if (page !== callLang) {
        const sub = document.createElement("span");
        sub.className = "sub";
        sub.lang = htmlLang(page);
        sub.textContent = spoken(step, page, pageDict);
        bubble.append(sub);
      }
      line.append(who, bubble);
    }
    const screen = screens[step.phone];
    screen.appendChild(line);
    screen.scrollTop = screen.scrollHeight;
  }

  function shown() {
    return steps.slice(0, next);
  }

  function paintStates() {
    for (const phone of ["parent", "family"]) {
      const last = shown().filter((s) => s.phone === phone && s.state).pop();
      stateEls[phone].textContent = t("state." + (last ? last.state : "idle"));
    }
  }

  function paintVerdict() {
    const step = shown().filter((s) => s.verdict).pop();
    verdictEl.className = "verdict" + (step ? " " + step.verdict[1] : "");
    verdictEl.textContent = step ? t(step.verdict[0]) : "";
  }

  function paintButtons() {
    const done = next >= steps.length;
    playBtn.textContent = t(running ? "sim.pause" : done ? "sim.again" : "sim.play");
    stepBtn.disabled = done;
  }

  function paintClock() {
    clock.textContent = String(Math.floor(simTime));
  }

  function renderAll() {
    screens.parent.innerHTML = "";
    screens.family.innerHTML = "";
    shown().forEach(render);
    paintStates();
    paintVerdict();
    paintButtons();
  }

  function stop() {
    running = false;
    clearTimeout(timer);
    cancelAnimationFrame(frame);
  }

  function reset() {
    stop();
    steps = SCENARIOS[sim.querySelector("input[name=scenario]:checked").value].slice().sort((a, b) => a.t - b.t);
    next = 0;
    simTime = 0;
    paintClock();
    renderAll();
  }

  function advance() {
    simTime = Math.max(simTime, steps[next].t);
    render(steps[next++]);
    paintStates();
    paintVerdict();
    paintClock();
  }

  function schedule() {
    clearTimeout(timer);
    if (!running) return;
    if (next >= steps.length) {
      stop();
      paintButtons();
      return;
    }
    timer = setTimeout(() => {
      advance();
      schedule();
    }, Math.max(0, (steps[next].t - simTime) * 1000 / SPEED));
  }

  function tick(now) {
    if (!running) return;
    simTime = Math.min(simTime + (now - lastTick) / 1000 * SPEED, steps[next] ? steps[next].t : simTime);
    lastTick = now;
    paintClock();
    frame = requestAnimationFrame(tick);
  }

  function play() {
    if (next >= steps.length) reset();
    running = true;
    lastTick = performance.now();
    frame = requestAnimationFrame(tick);
    schedule();
    paintButtons();
  }

  async function setCallLang(lang) {
    callLang = lang;
    callDict = await window.asli.load(lang);
    callSelect.value = lang;
    renderAll();
  }

  playBtn.addEventListener("click", () => {
    if (running) {
      stop();
      paintButtons();
    } else {
      play();
    }
  });

  stepBtn.addEventListener("click", () => {
    stop();
    if (next < steps.length) {
      simTime = steps[next].t;
      advance();
    }
    paintButtons();
  });

  sim.addEventListener("change", (event) => {
    if (event.target.name !== "scenario") return;
    const wasRunning = running;
    reset();
    if (wasRunning) play();
  });

  callSelect.addEventListener("change", () => {
    callChosen = true;
    setCallLang(callSelect.value);
  });

  window.asli.onLang(async (lang) => {
    pageDict = await window.asli.load(lang);
    languageOptions(callSelect, callChosen ? callLang : defaultCall(lang));
    await setCallLang(callSelect.value);
  });

  reset();
})();
