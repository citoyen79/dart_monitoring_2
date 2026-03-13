require('dotenv').config({ path: '.env.local' });

const DART_API_KEY = process.env.DART_API_KEY?.trim();

async function testDart() {
    const today = new Date();
    today.setHours(today.getHours() + 9);
    const bgnde = today.toISOString().split('T')[0].replace(/-/g, '');

    console.log("Checking DART for date:", bgnde);

    try {
        let pageNo = 1;
        let totalPage = 1;
        let found = [];
        do {
            const dartUrl = `https://opendart.fss.or.kr/api/list.json?crtfc_key=${DART_API_KEY}&bgn_de=${bgnde}&end_de=${bgnde}&page_no=${pageNo}&page_count=100`;
            const res = await fetch(dartUrl);
            const dartData = await res.json();
            totalPage = dartData.total_page || 1;

            if (dartData.list) {
                const matches = dartData.list.filter(i => i.corp_code === '00251738' || i.corp_code === '00208514');
                if (matches.length > 0) found.push(...matches.map(m => `${m.corp_name} - ${m.report_nm} (Page ${pageNo})`));
            }
            pageNo++;
        } while (pageNo <= totalPage);
        console.log("Found monitored filings:", found);
    } catch (err) {
        console.error("Fetch error:", err);
    }
}

testDart();
