import Header from './Header';
import Nav from './Nav';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <div className="app-layout">
      <Header />
      <div className="layout-body">
        <Nav />
        <main className="page-content">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
