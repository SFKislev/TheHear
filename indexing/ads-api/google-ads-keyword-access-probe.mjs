#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const REQUIRED_ENV_VARS = [
  "GOOGLE_ADS_DEVELOPER_TOKEN",
  "GOOGLE_ADS_CLIENT_ID",
  "GOOGLE_ADS_CLIENT_SECRET",
  "GOOGLE_ADS_REFRESH_TOKEN",
  "GOOGLE_ADS_CUSTOMER_ID",
];

function redact(value, keepStart = 4, keepEnd = 3) {
  if (!value || value.length <= keepStart + keepEnd) return "***";
  return `${value.slice(0, keepStart)}...${value.slice(-keepEnd)}`;
}

function toApiErrorShape(errorPayload) {
  const apiError = errorPayload?.error || {};
  return {
    code: apiError.code,
    status: apiError.status,
    message: apiError.message,
    details: apiError.details || [],
  };
}

function classifyFailure(errorShape) {
  const serialized = JSON.stringify(errorShape).toUpperCase();
  const accessSignals = [
    "DEVELOPER_TOKEN_NOT_APPROVED",
    "ACCESS_DENIED",
    "PERMISSION_DENIED",
    "DEVELOPER_TOKEN_PROHIBITED",
    "CUSTOMER_NOT_ENABLED",
    "NOT_ADS_USER",
  ];

  const authSignals = [
    "UNAUTHENTICATED",
    "INVALID_GRANT",
    "INVALID_CLIENT",
    "AUTHENTICATION_ERROR",
  ];

  if (accessSignals.some((s) => serialized.includes(s))) {
    return "likely_access_level_or_permissions";
  }
  if (authSignals.some((s) => serialized.includes(s))) {
    return "auth_or_oauth_configuration";
  }
  return "other_or_request_validation";
}

function loadDotEnvFile() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    return;
  }
  const contents = fs.readFileSync(envPath, "utf8");
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const sep = line.indexOf("=");
    if (sep === -1) continue;
    const key = line.slice(0, sep).trim();
    const value = line.slice(sep + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

async function getOAuthAccessToken({
  clientId,
  clientSecret,
  refreshToken,
}) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(
      `OAuth token exchange failed (${response.status}): ${JSON.stringify(
        payload
      )}`
    );
  }
  return payload.access_token;
}

async function callGoogleAdsEndpoint({
  version,
  customerId,
  loginCustomerId,
  accessToken,
  developerToken,
  endpointPath,
  body,
}) {
  const response = await fetch(
    `https://googleads.googleapis.com/${version}/customers/${customerId}/${endpointPath}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "developer-token": developerToken,
        ...(loginCustomerId
          ? { "login-customer-id": loginCustomerId.replaceAll("-", "") }
          : {}),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  const payload = await response.json();
  if (response.ok) {
    return { ok: true, payload };
  }
  return { ok: false, error: toApiErrorShape(payload), raw: payload };
}

async function run() {
  loadDotEnvFile();
  if (!process.env.GOOGLE_ADS_CUSTOMER_ID && process.env.GOOGLE_ADS_COSTUMER_ID) {
    process.env.GOOGLE_ADS_CUSTOMER_ID = process.env.GOOGLE_ADS_COSTUMER_ID;
  }
  if (
    !process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID &&
    process.env.GOOGLE_ADS_CUSTOMER_ID
  ) {
    process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID = process.env.GOOGLE_ADS_CUSTOMER_ID;
  }

  const missing = REQUIRED_ENV_VARS.filter((name) => !process.env[name]);
  if (missing.length) {
    console.error("Missing required env vars:");
    for (const key of missing) {
      console.error(`- ${key}`);
    }
    process.exit(2);
  }

  const config = {
    version: process.env.GOOGLE_ADS_API_VERSION || "v20",
    developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN.trim(),
    clientId: process.env.GOOGLE_ADS_CLIENT_ID.trim(),
    clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET.trim(),
    refreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN.trim(),
    customerId: process.env.GOOGLE_ADS_CUSTOMER_ID.replaceAll("-", ""),
    loginCustomerId: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || "",
  };

  console.log("Google Ads access probe starting with:");
  console.log(`- API version: ${config.version}`);
  console.log(`- Customer ID: ${config.customerId}`);
  console.log(
    `- Login customer ID: ${
      config.loginCustomerId
        ? config.loginCustomerId.replaceAll("-", "")
        : "(not set)"
    }`
  );
  console.log(`- Developer token: ${redact(config.developerToken)}`);

  let accessToken;
  try {
    accessToken = await getOAuthAccessToken({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      refreshToken: config.refreshToken,
    });
  } catch (error) {
    console.error("\nOAuth step failed:");
    console.error(error.message);
    process.exit(1);
  }

  const calls = [
    {
      name: "KeywordPlanIdeaService.generateKeywordIdeas",
      endpointPath: ":generateKeywordIdeas",
      body: {
        language: "languageConstants/1000",
        geoTargetConstants: ["geoTargetConstants/2840"],
        keywordSeed: { keywords: ["news headlines"] },
        pageSize: 5,
      },
    },
    {
      name: "KeywordPlanService.mutateKeywordPlans",
      endpointPath: "keywordPlans:mutate",
      body: {
        operations: [
          {
            create: {
              name: `Access Probe Plan ${new Date().toISOString()}`,
              forecastPeriod: { dateInterval: "NEXT_QUARTER" },
            },
          },
        ],
      },
    },
  ];

  for (const call of calls) {
    console.log(`\nCalling ${call.name}...`);
    const result = await callGoogleAdsEndpoint({
      version: config.version,
      customerId: config.customerId,
      loginCustomerId: config.loginCustomerId,
      accessToken,
      developerToken: config.developerToken,
      endpointPath: call.endpointPath,
      body: call.body,
    });

    if (result.ok) {
      console.log(`- RESULT: success`);
      console.log(JSON.stringify(result.payload, null, 2));
      continue;
    }

    const classification = classifyFailure(result.error);
    console.log(`- RESULT: failure`);
    console.log(`- CLASSIFICATION: ${classification}`);
    console.log(`- ERROR: ${JSON.stringify(result.error, null, 2)}`);
    console.log(`- RAW: ${JSON.stringify(result.raw, null, 2)}`);
  }
}

run().catch((error) => {
  console.error("Unexpected failure:", error);
  process.exit(1);
});
