import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import logoImage from './data/vatsca.svg';
import loginBackgroundImage from './data/login-background.png';
import { LOGIN_URL } from './data/config';
import './login.css';

const Login = () => {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const message = params.get('message');
    const error = params.get('error');

    if (message === 'logout_success') {
      navigate('/login', { replace: true });
    }

    if (error) {
      setErrorMessage('You denied access to your VATSIM account. Please try again if you want to proceed.');
    }

    if (user) {
      navigate('/');
    }
  }, [user, location, navigate]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Checking authentication status...</p>
      </div>
    );
  }

  const handleLogin = () => {
    setErrorMessage(null);
    window.location.href = LOGIN_URL;
  };

  return (
    <div className="login-container">
      <div
        className="login-background"
        style={{ backgroundImage: `url(${loginBackgroundImage})` }}
      />

      <div className="login-content">
        <div className="login-box">
          <div className="logo-section">
            <img className="logo" src={logoImage} alt="VATSIM Scandinavia" />
            <div className="title">AWOS Display</div>
          </div>

          <div className="info-text">
            <p className="warning-text">For Simulator Use Only on VATSIM Network</p>
            <p className="warning-text">Minimum S1 rating required</p>
          </div>

          {errorMessage && (
            <div className="error-message">
              {errorMessage}
            </div>
          )}

          <button
            onClick={handleLogin}
            className="login-button"
          >
            Login with VATSIM
          </button>

          <div className="footer">
            <p>
              <a href='https://hold.lusep.fi/#/privacy-policy'>Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
