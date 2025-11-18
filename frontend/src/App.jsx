import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import Header from "./components/header";
import Cashier from "./pages/cashier";
import Storage from "./pages/storage";
import AddProducts from "./pages/addProducts";
import Orders from "./pages/orders";
import Returns from "./pages/returns";
import Footer from "./components/footer"; // import your footer component
import { translations } from "./translations"; // import your translations object

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [username, setUsername] = useState(
    localStorage.getItem("username") || ""
  );

  const [lang, setLang] = useState(localStorage.getItem("lang") || "ar");

  const handleLogout = () => {
    setToken("");
    setUsername("");
    localStorage.removeItem("token");
    localStorage.removeItem("username");
  };

  const switchLanguage = () => {
    const newLang = lang === "ar" ? "en" : "ar";
    setLang(newLang);
    localStorage.setItem("lang", newLang);
  };

  // If not logged in → show Login/Register
  if (!token) {
    return (
      <Routes>
        <Route path='/register' element={<Register lang={lang} />} />
        <Route
          path='/*'
          element={
            <Login
              setToken={(tok) => {
                setToken(tok);
                localStorage.setItem("token", tok);
              }}
              setUsernameGlobal={(name) => {
                setUsername(name);
                localStorage.setItem("username", name);
              }}
              lang={lang}
            />
          }
        />
      </Routes>
    );
  }

  // If logged in → show main app with header
  return (
    <>
      <div dir={lang === "ar" ? "rtl" : "ltr"}></div>
      <Header
        onLogout={handleLogout}
        lang={lang}
        switchLanguage={switchLanguage}
      />
      <main className='main-content'>
<Routes>
  <Route path='/' element={<Navigate to='/cashier' />} />
  <Route path='/cashier' element={<Cashier lang={lang} />} />
  <Route path='/add-products' element={<AddProducts username={username} lang={lang} />} />
  <Route path='/storage' element={<Storage lang={lang} />} />
  <Route path='/orders' element={<Orders lang={lang} />} />
  <Route path='/returns' element={<Returns lang={lang} />} />
</Routes>

      </main>
      <Footer></Footer>
    </>
  );
}

export default App;
