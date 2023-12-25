const {createClient} = require("@supabase/supabase-js")

class SupabaseSservice {
    _supabase;
    constructor(){
        this._supabase = createClient(process.env.SUPABASE_PROJECT_URL, process.env.SUPABASE_ANNON_KEY);
    }
    get client(){
        return this._supabase;
    }
}


module.exports = SupabaseSservice;