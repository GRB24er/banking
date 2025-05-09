/* app/(root)/page.tsx
 * ------------------------------------------------------------
 * Dashboard Home page – now shows:
 *   • $5 000 “Welcome Bonus” (status Success, cleared)
 *   • $150 000 “Incoming Deposit” (status Pending, does NOT
 *     inflate the dashboard balance until cleared)
 * ------------------------------------------------------------
 */

import HeaderBox           from '@/components/HeaderBox';
import RecentTransactions  from '@/components/RecentTransactions';
import RightSidebar        from '@/components/RightSidebar';
import TotalBalanceBox     from '@/components/TotalBalanceBox';

import { getAccount, getAccounts }   from '@/lib/actions/bank.actions';
import { getLoggedInUser }           from '@/lib/actions/user.actions';

/* ------------------------------------------------------------
 * Constants
 * ---------------------------------------------------------- */
const HARDCODED_BONUS       = 5_000;    // Cleared, counts toward balance
const PENDING_LARGE_DEPOSIT = 150_000;  // Pending, display-only

/* ------------------------------------------------------------
 * Types used locally – adjust/remove if you already
 * export these from your own `types.ts`
 * ---------------------------------------------------------- */
type SearchParamProps = { searchParams: { id?: string; page?: string } };

interface Transaction {
  _id:        string;
  type:       string;
  amount:     number;
  status:     'Success' | 'Pending' | string;
  date:       string;     // ISO
  description?: string;
  [key: string]: any;     // allow extra fields from API
}

/* ------------------------------------------------------------
 * Component
 * ---------------------------------------------------------- */
const Home = async ({ searchParams: { id, page } }: SearchParamProps) => {
  /* 1️⃣  Data fetch */
  const currentPage = Number(page) || 1;
  const loggedIn    = await getLoggedInUser();

  const accounts = await getAccounts({ userId: loggedIn.$id });
  if (!accounts) return null; // nothing to show

  const accountsData   = accounts.data;
  const appwriteItemId =
    id || accountsData[0]?.appwriteItemId;

  const account = await getAccount({ appwriteItemId });

  /* 2️⃣  Synthetic transactions */
  const now          = new Date();
  const threeDaysAgo = new Date(now);
  threeDaysAgo.setDate(now.getDate() - 3);

  const syntheticTxns: Transaction[] = [
    {
      _id:  'synthetic-bonus-5k',
      type: 'Deposit',
      amount: -HARDCODED_BONUS,          // deposit = negative for balance math
      status: 'Success',
      date:   threeDaysAgo.toISOString(), // older → Success
      description: 'Welcome Bonus',
    },
    {
      _id:  'synthetic-pending-150k',
      type: 'Deposit',
      amount: -PENDING_LARGE_DEPOSIT,
      status: 'Pending',
      date:   now.toISOString(),          // today → Pending
      description: 'Incoming Deposit',
    },
  ];

  /* 3️⃣  Merge with real transactions (always spread an array) */
  const originalTxns: Transaction[] =
    Array.isArray(account?.transactions) ? account.transactions : [];

  const mergedTransactions: Transaction[] = [
    ...syntheticTxns,
    ...originalTxns,
  ];

  /* 4️⃣  Dashboard balance = real balance + cleared bonus only */
  const totalBalanceWithBonus =
    (accounts.totalCurrentBalance ?? 0) + HARDCODED_BONUS;

  /* 5️⃣  Render */
  return (
    <section className="home">
      <div className="home-content">
        <header className="home-header">
          <HeaderBox
            type="greeting"
            title="Welcome"
            user={loggedIn?.firstName || 'Guest'}
            subtext="Access and manage your account and transactions efficiently."
          />

          <TotalBalanceBox
            accounts={accountsData}
            totalBanks={accounts.totalBanks}
            totalCurrentBalance={totalBalanceWithBonus}
          />
        </header>

        <RecentTransactions
          accounts={accountsData}
          transactions={mergedTransactions}
          appwriteItemId={appwriteItemId}
          page={currentPage}
        />
      </div>

      <RightSidebar
        user={loggedIn}
        transactions={mergedTransactions}
        banks={accountsData.slice(0, 2)}
      />
    </section>
  );
};

export default Home;
