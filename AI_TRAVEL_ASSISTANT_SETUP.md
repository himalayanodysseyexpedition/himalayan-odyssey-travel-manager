# AI Travel Assistant setup

This feature adds a public AI travel assistant using Gemini API + Supabase Edge Functions.

## Required secret

Create a Gemini API key in Google AI Studio, then add it to the Supabase project as an Edge Function secret:

- Name: GEMINI_API_KEY
- Value: your Google AI Studio API key

Optional:
- GEMINI_MODEL = gemini-3.8-flash

Do not put the Gemini API key in website JavaScript or commit it to GitHub.

Supabase project: ynkoiuyjevclypumnyes

## Deploy the Edge Function

Deploy supabase/functions/ai-travel-assistant/index.ts as function name ai-travel-assistant with JWT verification disabled. The function performs its own origin check and rate limiting because it is called by anonymous website guests.

The function uses the Supabase server secret key already injected into Edge Functions. It does not need a new Supabase key in the browser.

## Estimate rate card

The initial indicative stay + meals rate card in the Edge Function is:
- Narkanda ₹1,300/person/night
- Shimla ₹1,300/person/night
- Kufri ₹1,300/person/night
- Sangla ₹1,600/person/night
- Kalpa ₹1,500/person/night
- Tabo ₹1,600/person/night
- Kaza ₹1,500/person/night
- Manali ₹1,300/person/night
- Jibhi ₹1,400/person/night
- Kasol ₹1,300/person/night

Cab prices are read from published rows in public.cabs. Estimates exclude unlisted permits, tolls, parking, activities and optional extras. All estimates are indicative and require team confirmation.

## Lead capture

The assistant stores qualified enquiries in existing customers and leads tables with source Website and source details AI Travel Assistant. The existing admin dashboard already reads these tables.

Chat transcripts are not persisted. Guest contact details are submitted separately through the enquiry form and are not sent to Gemini as chat history.

## Verification checklist

1. Add the Gemini API key secret.
2. Deploy the Edge Function.
3. Test chat on the live public domain.
4. Test estimate calculation against one known cab and route.
5. Submit a test lead and confirm it appears in the existing CRM.
6. Test the widget on iPhone Safari and desktop.
7. Confirm the admin dashboard does not display the public chat widget.
