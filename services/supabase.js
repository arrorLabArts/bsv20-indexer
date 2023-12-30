const { createClient } = require("@supabase/supabase-js");

class SupabaseService {
  static instance;

  _supabase;

  constructor() {
    if (!SupabaseService.instance) {
      this._supabase = createClient(
        process.env.SUPABASE_PROJECT_URL,
        process.env.SUPABASE_ANNON_KEY
      );
      SupabaseService.instance = this;
    }

    return SupabaseService.instance;
  }

  get client() {
    return this._supabase;
  }
}

module.exports = SupabaseService;