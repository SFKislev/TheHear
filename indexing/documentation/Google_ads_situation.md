Google Ads – Current Situation After Domain Migration to TheHear.org
Technical Summary for Internal Review

Documented Facts (Based on system screenshots and configuration)

Under the-hear.com, Google Ads Search campaigns historically reached their daily budgets within approximately two to three hours. Spend behavior was consistent, and campaigns generated clicks at scale.

Google Search Console began reporting significant visibility issues for the-hear.com, including large numbers of pages categorized as “Discovered – currently not indexed.” During this same period, Google Ads spend collapsed to approximately $20–$30 per day, representing a substantial and sudden drop from previous performance.

In response, the site was migrated to thehear.org, and new Google Ads campaigns were created (or existing ones re-targeted) to use thehear.org landing pages.

Post-migration, the new campaigns pointing to thehear.org show almost no clicks and low impressions, despite budgets being unchanged and bidding strategies configured to “Maximize clicks.”

Google Ads Grant rules apply to this account, meaning the campaigns are not appearing in the standard commercial auction pool but are subject to separate constraints (quality thresholds, CTR requirements, keyword relevance restrictions).

In GA4, new conversion events have been created specifically for thehear.org, and the GA4 property has been linked to Google Ads. The conversions visible in your screenshot include:

thehear.org (web) user_engagement

thehear.org (web) engaged_user

thehear.org (web) time_exploration

thehear.org (web) page_view

These events are marked as Primary or Secondary within the Google Ads Conversions configuration.

GA4 Realtime and standard reporting confirm that users are triggering these events on thehear.org, meaning tracking is functioning correctly at the analytics level.

Despite conversion tracking working inside GA4, Google Ads reports “No recent conversions” for most of the defined conversion actions, and the campaigns for thehear.org do not reflect meaningful accrual of conversion data within the Google Ads interface.

Interpretation / Assessment (Not confirmed, requires validation with Google Ads support or diagnostics)

It is possible that Google Ads uses behavioral performance associated with a specific destination domain (historical CTR, bounce patterns, expected user response, or prior conversion behavior) when determining auction eligibility and competitiveness. If this model is domain-linked rather than campaign-linked, migrating to thehear.org may effectively reset these predictive signals.

Because this account operates under Google Grants, the platform enforces stricter participation rules, including minimum relevance and performance thresholds. A new domain with no established historical performance under these grant rules may fail to meet internal eligibility criteria, resulting in minimal impressions and no click-through even under a “Maximize Clicks” bidding strategy.

The GA4 conversions created for thehear.org may not yet provide enough frequency or consistency for Google Ads’ automated systems (or grant rules) to treat them as valid optimization signals, even though they are technically firing.

The fact that spend and impressions declined sharply before the domain migration, coinciding with GSC indexing issues, suggests that the degradation in Google Ads performance may have been influenced by the same underlying causes — either because both SEO and Ads systems react to similar quality/visibility issues, or because both systems were independently impacted by a change in the site’s footprint or perceived value. This is hypothesis, not proof.

The migration to the new domain has resolved some SEO-side parameters (the-hear.com vs. thehear.org indexing), but it has not reversed the Google Ads behavior, indicating that the cause of the collapse may not have been solely driven by indexing status.