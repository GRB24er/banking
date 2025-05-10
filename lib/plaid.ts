import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

// ─── 1. Resolve target environment ────────────────────────────────────────────
const PLAID_ENV = (process.env.PLAID_ENV || 'sandbox').toLowerCase();

const basePath =
  PLAID_ENV === 'production'
    ? PlaidEnvironments.production          // https://production.plaid.com
    : PlaidEnvironments.sandbox;            // https://sandbox.plaid.com

// ─── 2. Pull credentials from env ─────────────────────────────────────────────
const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET    = process.env.PLAID_SECRET;

// ─── 3. Guard-rails: bail out early on bad config ─────────────────────────────
if (!PLAID_CLIENT_ID || !PLAID_SECRET) {
  throw new Error(
    'PLAID_CLIENT_ID and PLAID_SECRET must be set in the environment.',
  );
}

if (PLAID_ENV === 'sandbox' && !PLAID_SECRET.startsWith('sandbox-')) {
  throw new Error(
    'PLAID_ENV is set to "sandbox", but PLAID_SECRET is not a sandbox secret. ' +
    'Grab the sandbox secret from the Plaid dashboard.',
  );
}

if (PLAID_ENV === 'production' && PLAID_SECRET.startsWith('sandbox-')) {
  throw new Error(
    'PLAID_ENV is "production", but you provided a sandbox secret. ' +
    'Switch to the production secret or change PLAID_ENV.',
  );
}

// ─── 4. Build the Plaid client ────────────────────────────────────────────────
const configuration = new Configuration({
  basePath,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
      'PLAID-SECRET':    PLAID_SECRET,
      'Plaid-Version':   '2020-09-14',      // keep the stable API version
    },
  },
});

export const plaidClient = new PlaidApi(configuration);
