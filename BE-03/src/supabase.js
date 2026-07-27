const { createClient } = require('@supabase/supabase-js');

let _client;

function getClient() {
    if (!_client) {
        const url = process.env.SUPABASE_URL;
        const key = process.env.SUPABASE_KEY;
        if (!url || !key) {
            throw new Error('SUPABASE_URL and SUPABASE_KEY environment variables are required');
        }
        _client = createClient(url, key, {
            auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
        });
    }
    return _client;
}

module.exports = { getClient };
