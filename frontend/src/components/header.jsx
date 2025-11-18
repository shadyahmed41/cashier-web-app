import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Header.css';
import { translations } from '../translations'; // import your translations object
export default function Header({ onLogout ,  lang, switchLanguage}) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm(lang === 'ar' ? 'هل أنت متأكد أنك تريد تسجيل الخروج؟' : 'Are you sure you want to log out?')) {
      onLogout();
      navigate('/');
    }
  };

   return (
    <header className="header">
      <h1 className="logo">
        {lang === 'ar' ? 'نظام الكاشير' : 'Cashier System'}
      </h1>

      <nav className="nav">
        <Link
          to="/cashier"
          className={location.pathname === '/cashier' ? 'active' : ''}
        >
          {lang === 'ar' ? 'الكاشير' : 'Cashier'}
        </Link>
        <Link
          to="/add-products"
          className={location.pathname === '/add-products' ? 'active' : ''}
        >
          {lang === 'ar' ? 'إضافة منتجات' : 'Add Products'}
        </Link>
        <Link
          to="/storage"
          className={location.pathname === '/storage' ? 'active' : ''}
        >
          {lang === 'ar' ? 'المخزن' : 'Storage'}
        </Link>
        <Link
          to="/orders"
          className={location.pathname === '/orders' ? 'active' : ''}
        >
          {lang === 'ar' ? 'الطلبات' : 'Orders'}
        </Link>
        {/* Uncomment if you want Returns */}
        {/* <Link to="/returns" className={location.pathname === '/returns' ? 'active' : ''}>
          {lang === 'ar' ? 'الإرجاعات' : 'Returns'}
        </Link> */}
      </nav>

      <div className="header-right">
        {/* Language toggle button */}
        <button className="lang-btn" onClick={switchLanguage}>
          {lang === 'ar' ? 'English' : 'عربي'}
        </button>

        <button className="logout-btn" onClick={handleLogout}>
          {lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}
        </button>
      </div>
    </header>
  );
}