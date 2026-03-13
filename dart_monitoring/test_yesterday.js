require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const DART_API_KEY = process.env.DART_API_KEY?.trim();
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN?.trim();
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID?.trim();
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim(), process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim());

async function sendTelegram(text) {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: 'HTML' })
    });
    const d = await res.json();
    if (!d.ok) console.error("Telegram 실패:", d);
    return d.ok;
}

async function main() {
    // 어제 날짜 (KST)
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() + 9); // KST
    yesterday.setDate(yesterday.getDate() - 1);
    const bgnde = yesterday.toISOString().split('T')[0].replace(/-/g, '');
    console.log(`\n[1] 조회 날짜: ${bgnde} (어제)`);

    const { data: companies } = await supabase.from('companies').select('corp_code, corp_name');
    const { data: keywords } = await supabase.from('keywords').select('keyword');
    const companyMap = new Map(companies.map(c => [c.corp_code, c.corp_name]));
    const keywordList = keywords ? keywords.map(k => k.keyword) : [];
    console.log(`[2] 모니터링 기업: ${companies.length}개 | 제외 키워드: ${keywordList.length}개`);

    let found = [];
    let pageNo = 1, totalPage = 1;

    do {
        const url = `https://opendart.fss.or.kr/api/list.json?crtfc_key=${DART_API_KEY}&bgn_de=${bgnde}&end_de=${bgnde}&page_no=${pageNo}&page_count=100`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.status !== "000" && data.status !== "013") {
            console.error("DART API 오류:", data.message);
            break;
        }
        if (!data.list || data.list.length === 0) break;

        totalPage = data.total_page || 1;

        for (const item of data.list) {
            if (!companyMap.has(item.corp_code)) continue;
            if (keywordList.some(kw => item.report_nm.includes(kw))) continue;
            found.push(item);
        }
        pageNo++;
    } while (pageNo <= totalPage && pageNo < 20);

    console.log(`[3] 어제 필터링된 공시 수: ${found.length}개`);

    if (found.length === 0) {
        console.log("어제 해당 기업의 공시가 없습니다.");
        return;
    }

    // 이미 DB에 있는 것 제외
    let newItems = [];
    for (const item of found) {
        const { data: existing } = await supabase.from('announcements').select('id').eq('rcept_no', item.rcept_no).maybeSingle();
        if (!existing) newItems.push(item);
    }
    console.log(`[4] DB에 없는 신규 공시: ${newItems.length}개 (이미 전송된 것 ${found.length - newItems.length}개 제외)`);

    if (newItems.length === 0) {
        console.log("모든 공시가 이미 전송되었습니다.");
        return;
    }

    // Telegram 발송 + DB 저장
    let sentCount = 0;
    for (const item of newItems) {
        const link = `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${item.rcept_no}`;
        const message = `🚨 <b>[새로운 주요 공시 알림]</b> 🚨\n\n🏢 <b>기업:</b> ${item.corp_name}\n📄 <b>건명:</b> ${item.report_nm.trim()}\n\n🔗 <a href="${link}">자세히 보기 (모바일 터치)</a>`;

        const { error: insertErr } = await supabase.from('announcements').insert([{
            rcept_no: item.rcept_no,
            corp_code: item.corp_code,
            corp_name: item.corp_name,
            report_nm: item.report_nm,
            sent_at: new Date().toISOString()
        }]);

        if (!insertErr) {
            const ok = await sendTelegram(message);
            if (ok) {
                sentCount++;
                console.log(`  ✅ 전송: ${item.corp_name} - ${item.report_nm.trim()}`);
            }
        } else {
            console.error(`  ❌ DB 삽입 실패 (${item.rcept_no}):`, insertErr.message);
        }
    }

    console.log(`\n[완료] ${sentCount}개 공시 텔레그램 전송 완료`);
}

main();
