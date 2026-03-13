const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
const supabase = createClient(supabaseUrl, supabaseKey);

async function clean() {
    console.log("Deleting today's phantom announcements...");
    const { data, error } = await supabase
        .from('announcements')
        .delete()
        .like('rcept_no', '20260304%');

    console.log("Deleted. Error:", error);
}

clean();
