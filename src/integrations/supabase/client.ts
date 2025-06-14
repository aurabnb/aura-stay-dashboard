
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ahviquwdicsyqgsfnmfi.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFodmlxdXdkaWNzeXFnc2ZubWZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMTk3OTMsImV4cCI6MjA2MzY5NTc5M30.MRttR3G2FtRA5cZREEZ3LBkBCrPhA6GGAZa8wM4XFmE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
