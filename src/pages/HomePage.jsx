import { Link } from 'react-router-dom';
import './HomePage.css'; // 👈 Add a CSS file for styles

function HomePage() {
  return (
    <div className="home">
      {/* Hero Section */}
      <header className="hero">
        <h1>SpendWise 💸</h1>
        <p>Your money, organized and simplified.</p>
        <div className="hero-buttons">
          <Link to="/register" className="btn btn-primary">
            Get Started
          </Link>
          <Link to="/login" className="btn btn-outline">
            Log In
          </Link>
        </div>
      </header>

      {/* Features Section */}
      <section className="features">
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
      <section className="how-it-works">
        <h2>How it works</h2>
        <ol>
          <li>1️⃣ Sign up and add your accounts</li>
          <li>2️⃣ Upload or log your transactions</li>
          <li>3️⃣ Get insights and stay on top of your money</li>
        </ol>
      </section>

      {/* Call To Action */}
      <footer className="cta">
        <h3>Ready to take control of your finances?</h3>
        <Link to="/register" className="btn btn-success">
          Create Account
        </Link>
      </footer>
    </div>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div className="feature">
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

export default HomePage;
