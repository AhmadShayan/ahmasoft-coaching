import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://bcufjombzhuotcmvqxzc.supabase.co";
const SUPABASE_KEY = "sb_publishable_oXalSfSd5ipMohAf30Oknw_hwDAz_sE";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
