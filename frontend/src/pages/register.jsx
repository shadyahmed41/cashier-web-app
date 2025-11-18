import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { translations } from '../translations';

export default function Register({lang}) {
    const t = translations[lang]; // get translations

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await axios.post('http://localhost:3000/auth/register', { username, password });
      alert('Account created successfully');
      navigate('/'); // go back to login
    } catch (err) {
      setError(err.response?.data?.message || t.registrationFailed);
    }
  };

  return (
    <div className="register-page">
      <div className="auth-card">
        <h2>{t.createAccount}</h2>
        <p>{t.joinUs}</p>
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
        <button onClick={handleRegister}>{t.createAccount}</button>

        {error && <p className="error">{error}</p>}

        <p className="switch-text">
          {t.alreadyHaveAccount}{' '}
          <span className="switch-link" onClick={() => navigate('/')}>
            {t.login}
          </span>
        </p>
      </div>
    </div>
  );
}
