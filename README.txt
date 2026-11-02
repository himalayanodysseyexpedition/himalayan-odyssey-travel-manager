HIMALAYAN ODYSSEY EXPEDITION – CLOUD APP

Configured with the Supabase Project URL and publishable key supplied by the owner.
The publishable key is designed for browser use. Never add a secret/service_role key.

BEFORE LOGIN:
1. Supabase Dashboard > Authentication > Users > Add user.
2. Create your own admin email and a strong password. Confirm the user if prompted.
3. Disable public sign-ups in Authentication settings if enabled.
4. Ensure the SQL setup from the earlier step completed and Row Level Security is enabled on all seven tables.

Upload the files in this folder to a static HTTPS host. Open the hosted URL on Android Chrome and choose Install app / Add to Home screen. On iPhone use Safari > Share > Add to Home Screen.

The app uses packages, customers, leads, bookings, vendors and transactions. It relies on the owner_id defaults and RLS policies created in the earlier SQL step. Test with your admin login before adding real customer data.
