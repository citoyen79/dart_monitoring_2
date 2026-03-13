require('dotenv').config({ path: '.env.local' });

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN?.trim();
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID?.trim();

async function sendTelegramMessage(text) {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: text,
                parse_mode: 'HTML'
            })
        });
        const d = await res.json();
        if (!d.ok) console.error("Telegram send failed:", d);
        else console.log("Telegram send success:", d);
    } catch (error) {
        console.error("Telegram send error:", error);
    }
}

const message = `🚨 <b>[새로운 주요 공시 알림]</b> 🚨\n\n🏢 <b>기업:</b> 미래에셋캐피탈\n📄 <b>건명:</b> 특수관계인에대한출자\n\n🔗 <a href="https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260304001341">자세히 보기 (모바일 터치)</a>`;

sendTelegramMessage(message);
