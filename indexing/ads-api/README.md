# Google Ads API Utilities

This folder is isolated for Google Ads API tooling.

## Current tool
- `google-ads-keyword-access-probe.mjs`: probes Keyword Plan access using credentials from root `.env`.

## Run
`npm run probe-google-ads-keyword-access`

## Required env vars
- `GOOGLE_ADS_DEVELOPER_TOKEN`
- `GOOGLE_ADS_CLIENT_ID`
- `GOOGLE_ADS_CLIENT_SECRET`
- `GOOGLE_ADS_REFRESH_TOKEN`
- `GOOGLE_ADS_CUSTOMER_ID` (or legacy alias `GOOGLE_ADS_COSTUMER_ID`)
- Optional: `GOOGLE_ADS_LOGIN_CUSTOMER_ID`
