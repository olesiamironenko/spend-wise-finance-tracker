import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 text-slate-800">
      {/* Hero Section */}
      <header className="text-center py-16 px-4">
        <h1 className="text-4xl font-bold mb-4">SpendWise 💸</h1>
        <p className="text-lg mb-6">Your money, organized and simplified.</p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/register"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50"
          >
            Log In
          </Link>
        </div>
      </header>

      {/* Features Section */}
      <section className="max-w-4xl grid md:grid-cols-2 gap-8 px-6 py-12">
        <Feature
          icon="💰"
          title="Track Spending"
          text="Easily log your income and expenses to stay on budget."
        />
        <Feature
          icon="🏦"
          title="Manage Accounts"
          text="Keep tabs on your cash, debit, and credit balances."
        />
        <Feature
          icon="👯"
          title="Share Expenses"
          text="Split bills with friends and track payoffs in one place."
        />
        <Feature
          icon="📊"
          title="Visualize Trends"
          text="Understand where your money goes with charts and summaries."
        />
      </section>

      {/* How It Works */}
      <section className="bg-white w-full py-12 border-t border-slate-200">
        <div className="max-w-3xl mx-auto text-center px-6">
          <h2 className="text-2xl font-semibold mb-6">How it works</h2>
          <ol className="text-left mx-auto inline-block space-y-2 text-slate-700">
            <li>1️⃣ Sign up and add your accounts</li>
            <li>2️⃣ Upload or log your transactions</li>
            <li>3️⃣ Get insights and stay on top of your money</li>
          </ol>
        </div>
      </section>

      {/* Call To Action */}
      <footer className="py-12 text-center">
        <h3 className="text-lg mb-4">
          Ready to take control of your finances?
        </h3>
        <Link
          to="/register"
          className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700"
        >
          Create Account
        </Link>
      </footer>
    </div>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-slate-600 text-sm">{text}</p>
    </div>
  );
}

export default HomePage;
