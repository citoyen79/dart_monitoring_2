const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log("Fetching companies...");
    const { data: companies, error: cmpErr } = await supabase.from('companies').select('*');
    console.log("Companies:", companies, "| error:", cmpErr);
    
    console.log("Fetching keywords...");
    const { data: keywords } = await supabase.from('keywords').select('*');
    console.log("Keywords:", keywords);
    
    console.log("Fetching announcements...");
    const { data: announcements } = await supabase.from('announcements').select('*');
    console.log("Previous Announcements:", announcements?.length);
    if(announcements?.length > 0) {
        console.log("Last 2 Announcements:", announcements.slice(-2));
    }
}

check();
