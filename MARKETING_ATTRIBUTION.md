# Marketing attribution reporting

The existing lead form records a coarse acquisition category, initial page path and enquiry page in leads.source_details. The first observed category is retained within the browser tab when storage is available. No campaign ID, raw query, full referrer or tracking identifier is stored for this CRM attribution. Unavailable referrals are unknown; Google/Bing search labels are observed/inferred source categories, not proof of an organic result or exact keyword.

The existing lead-to-booking action preserves the source details and appends a final Marketing channel marker to bookings.notes before the existing lead deletion. Prior records are not backfilled. Directly entered bookings and missing/ambiguous source data remain unknown. Do not infer source by matching names or phone numbers. WhatsApp link clicks are intent, not confirmed CRM leads.

## Read-only aggregate report

Run the following SELECT against the authorized private database. Do not publish raw rows or financial data in the public repository. Restrict by reporting dates in production and specify timezone. Since converted leads are deleted by the existing workflow, active lead counts are a snapshot, not a historical acquisition total; confirmed booking counts use booking creation date, not payment date. Gross booked value is not collected revenue or profit.

```sql
with records as (
  select 'active_lead' as metric,
    case when lower(trim(source)) = 'website' then
      coalesce(substring(source_details from '^Website lead form · Channel: ([a-z_]+) · Landing: '), 'unknown')
    when lower(trim(source)) = 'google' then 'google_search'
    when lower(trim(source)) in ('instagram','facebook','whatsapp','tripoto','referral','manual') then lower(trim(source))
    else 'unknown' end as channel,
    0::numeric as booked_value, 0::numeric as amount_paid
  from public.leads
  union all
  select 'confirmed_booking',
    coalesce(substring(notes from 'Marketing channel: ([a-z_]+)[[:space:]]*$'),'unknown'),
    coalesce(total_amount,0), coalesce(amount_paid,0)
  from public.bookings where lower(status) = 'confirmed'
)
select metric,
  case when channel in ('google_search','bing_search','instagram','facebook','chatgpt','gemini','perplexity','tripoto','whatsapp','travel_referral','pinterest','quora','paid_campaign','other_campaign','referral','manual') then channel else 'unknown' end as source,
  count(*) as records, sum(booked_value) as gross_booked_value, sum(amount_paid) as amount_paid
from records group by 1,2 order by 1,3 desc;
```

Review GA4 whatsapp_click, generate_lead and enquiry_whatsapp_fallback separately. The acquisition_channel event parameter may require a GA4 custom dimension for detailed reports. Exact organic search terms cannot be reliably linked to an individual enquiry; use GSC query-to-page aggregate data and GA4/CRM landing-page aggregates instead. A zero count is not evidence of a broken form. Test on a mock/staging form with a mocked successful response and failed response; never submit fake production guest details. Verify real event delivery from a legitimate enquiry and confirm source marker after the next legitimate lead conversion. No database migration is required.
