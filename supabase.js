import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
    "https://djzdeyrhndgpxjntizpy.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqemRleXJobmRncHhqbnRpenB5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODI1OTA1NSwiZXhwIjoyMDgzODM1MDU1fQ.cWpzRaOe1ELB9BLO1a2VOFoxCZXrVmdh7HcgrCJjWlQ"
);
