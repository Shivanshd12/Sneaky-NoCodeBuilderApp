
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://trnfmuqfzkvxtcyadmjq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRybmZtdXFmemt2eHRjeWFkbWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3Mjk0OTEsImV4cCI6MjA3OTMwNTQ5MX0.6IJu2IB2P1zKqluMwOB6OaDh9OoIR59BCIIUQNVnxEM";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);