import React from "react";

const LogoutButton = ({ onLogout }) => {
  return (
    <button className="logout_btn" onClick={onLogout}>
      로그아웃
    </button>
  );
};

export default LogoutButton;
