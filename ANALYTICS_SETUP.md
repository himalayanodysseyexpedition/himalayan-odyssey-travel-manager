# Google Analytics 4 setup

The website now includes optional event tracking for:
- `whatsapp_click` — a visitor clicks a WhatsApp enquiry link.
- `generate_lead` — a valid trip enquiry form is submitted.

**Tracking is intentionally inactive until a real GA4 Measurement ID is added.** No placeholder ID is sent to Google, and the website enquiry form, Supabase CRM save and WhatsApp flow work without analytics.

## Activate tracking

1. Open Google Analytics at https://analytics.google.com/ and create or select the property for Himalayan Odyssey Expedition.
2. Add a Web data stream for `https://himalayanexpedition.co.in`.
3. Copy its Measurement ID. It starts with `G-`.
4. Edit `analytics-config.json` and replace the empty value with the real ID, for example:

   ```json
   {
     "measurementId": "G-XXXXXXXXXX"
   }
   ```

5. Commit the change to the website's production branch after reviewing the privacy notice and any consent requirements that apply to the business.
6. In GA4 Realtime, open the website in a private browser window and verify that page views arrive. Then click a WhatsApp link and submit a test enquiry to verify the `whatsapp_click` and `generate_lead` events. Do not use real customer personal information for test events.

## Events and privacy

The event payloads intentionally exclude guest names and phone numbers. Destination, travel month, group size and page path may be sent as event parameters. Review the GA4 property settings and applicable privacy/consent requirements before activating measurement. The current `analytics-config.json` is blank by design.
