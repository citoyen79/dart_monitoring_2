import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const DART_API_KEY = process.env.DART_API_KEY?.trim();
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN?.trim();
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID?.trim();

// Helper to send telegram message
async function sendTelegramMessage(text: string): Promise<boolean> {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return false;
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    try {
        const res = await fetch(url, {
            method: 'POST',
            cache: 'no-store',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: text,
                parse_mode: 'HTML'
            })
        });
        const d = await res.json();
        if (!d.ok) {
            console.error("Telegram send failed:", d);
            return false;
        }
        return true;
    } catch (error) {
        console.error("Telegram send error:", error);
        return false;
    }
}

export async function GET(request: Request) {
    if (!DART_API_KEY) {
        return NextResponse.json({ error: "DART API KEY가 설정되지 않았습니다." }, { status: 500 });
    }

    // Initialize Supabase Client inside the function to avoid build-time initialization errors on Vercel
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
    if (!supabaseUrl || !supabaseKey) {
        return NextResponse.json({ error: "Supabase URL or Key is missing." }, { status: 500 });
    }
    const supabase = createClient(supabaseUrl, supabaseKey, {
        global: { fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' }) }
    });

    try {
        const { data: companies, error: cmpError } = await supabase.from('companies').select('corp_code, corp_name');
        if (cmpError || !companies || companies.length === 0) {
            return NextResponse.json({ message: "모니터링할 기업이 없습니다." });
        }

        const { data: keywords } = await supabase.from('keywords').select('keyword');
        const keywordList = keywords ? keywords.map(k => k.keyword) : [];

        const today = new Date();
        // Use Korea Time (UTC+9) for DART
        today.setHours(today.getHours() + 9);
        const bgnde = today.toISOString().split('T')[0].replace(/-/g, '');

        let newAlertsCount = 0;
        const companyMap = new Map(companies.map(c => [c.corp_code, c.corp_name]));

        let pageNo = 1;
        let totalPage = 1;

        do {
            const dartUrl = `https://opendart.fss.or.kr/api/list.json?crtfc_key=${DART_API_KEY}&bgn_de=${bgnde}&end_de=${bgnde}&page_no=${pageNo}&page_count=100`;
            const res = await fetch(dartUrl, { cache: 'no-store' });
            const dartData = await res.json();

            if (dartData.status !== "000" && dartData.status !== "013") {
                return NextResponse.json({ error: "DART API 갱신 오류", details: dartData.message }, { status: 500 });
            }

            if (!dartData.list || dartData.list.length === 0) {
                break; // No filings today
            }

            totalPage = dartData.total_page || 1;

            for (const item of dartData.list) {
                if (!companyMap.has(item.corp_code)) continue;

                const corpCode = item.corp_code;
                const corpName = item.corp_name;
                const reportNm = item.report_nm;
                const rceptNo = item.rcept_no;

                const isExcluded = keywordList.some(kw => reportNm.includes(kw));
                if (isExcluded) continue;

                const { data: existing } = await supabase
                    .from('announcements')
                    .select('id')
                    .eq('rcept_no', rceptNo)
                    .single();

                if (existing) continue;

                const link = `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${rceptNo}`;
                const message = `🚨 <b>[새로운 주요 공시 알림]</b> 🚨\n\n🏢 <b>기업:</b> ${corpName}\n📄 <b>건명:</b> ${reportNm}\n\n🔗 <a href="${link}">자세히 보기 (모바일 터치)</a>`;

                const success = await sendTelegramMessage(message);

                if (success) {
                    await supabase.from('announcements').insert([{
                        rcept_no: rceptNo,
                        corp_code: corpCode,
                        corp_name: corpName,
                        report_nm: reportNm
                    }]);
                    newAlertsCount++;
                }
            }

            pageNo++;
        } while (pageNo <= totalPage && pageNo < 20); // Increased limit to 20 pages

        return NextResponse.json({ message: `Cron run successful. ${newAlertsCount} new alerts sent.` });

    } catch (err: any) {
        return NextResponse.json({ error: "Internal Error", details: err.message }, { status: 500 });
    }
}
