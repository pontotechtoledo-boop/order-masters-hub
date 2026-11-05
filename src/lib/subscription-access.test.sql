-- Deterministic regression checks; no account or subscription data is changed.
SELECT case_name, actual = expected AS passed FROM (VALUES
 ('no paid period blocks access', public.subscription_allows_write('active',NULL,NULL,'2026-11-05T00:00:00Z'),false),
 ('quarterly payment enables access', public.subscription_allows_write('active','2027-02-05T00:00:00Z',NULL,'2026-11-05T00:00:00Z'),true),
 ('annual payment enables access', public.subscription_allows_write('active','2027-11-05T00:00:00Z',NULL,'2026-11-05T00:00:00Z'),true),
 ('refunded payment blocks access', public.subscription_allows_write('unpaid','2026-12-05T00:00:00Z',NULL,'2026-11-05T00:00:00Z'),false),
 ('active grace before seven days', public.subscription_allows_write('active','2026-10-29T00:00:00Z',NULL,'2026-11-04T23:59:59Z'),true),
 ('active grace ends at seven days', public.subscription_allows_write('active','2026-10-29T00:00:00Z',NULL,'2026-11-05T00:00:00Z'),false),
 ('renewed monthly access', public.subscription_allows_write('active','2026-11-28T00:00:00Z',NULL,'2026-10-30T00:00:00Z'),true),
 ('failed renewal grace ends', public.subscription_allows_write('past_due',NULL,'2026-10-29T00:00:00Z','2026-11-05T00:00:00Z'),false),
 ('cancellation keeps paid period', public.subscription_allows_write('canceled','2026-11-28T00:00:00Z',NULL,'2026-10-30T00:00:00Z'),true),
 ('cancellation ends at period end', public.subscription_allows_write('canceled','2026-11-28T00:00:00Z',NULL,'2026-11-28T00:00:00Z'),false)
) AS checks(case_name,actual,expected);