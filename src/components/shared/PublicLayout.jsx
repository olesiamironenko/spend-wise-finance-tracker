export default function PublicLayout({ children }) {
  return (
    <div className="public-layout">
      <header className="public-header">
        <h1>Spend Wise Finance</h1>
      </header>
      <main className="public-content">{children}</main>
    </div>
  );
}
