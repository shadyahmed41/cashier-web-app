import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { translations } from '../translations'; // make sure this file exists



export default function Login({ setToken,setUsernameGlobal, lang   }) {
    const t = translations[lang]; // get translations

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // const [UsernameGlobal, setUsernameGlobal] = useState('');
  const [error, setError] = useState('');
    const navigate = useNavigate();

 const handleLogin = async () => {
    try {
      
      const res = await axios.post('http://localhost:3000/auth/login', { username, password });
      setToken(res.data.access_token);
       setUsernameGlobal(username);
      // console.log(username)
 console.log('Submitting product1:', UsernameGlobal); // check value
  console.log('Submitting product2:', username); // check value

      // ✅ Save token locally (optional, for persistence)
      localStorage.setItem('token', res.data.access_token);

      // ✅ Redirect to main app (Cashier page)
      navigate('/cashier');
    } catch (err) {
      setError(err.response?.data?.message || t.loginFailed);
    }
  };

  return (
    <div className="login-page">
      <div className="auth-card">
        <h2>{t.welcomeBack}</h2>
        <p>{t.signIn}</p>
        <input
          placeholder={t.username}
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          placeholder={t.password}
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>{t.login}</button>
        {error && <p className="error">{error}</p>}
        <p className="switch-text">
          {t.noAccount}{' '}
          <span className="switch-link" onClick={() => navigate('/register')}>
            {t.createOne}
          </span>
        </p>
      </div>
    </div>
  );
}
