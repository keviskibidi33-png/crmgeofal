import React from 'react';
import './Header.css';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  return (
    <header className="header">
      <div className="header__left">
        <span className="logo">CRMGeoFal</span>
      </div>
      <div className="header__right">
        {user && (
          <div className="user-profile">
            <span>{user.name} ({user.role})</span>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
