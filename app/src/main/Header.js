import React, { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../login/AuthContext";
import LogoutButton from "../login/Logout";

const Header = () => {
  const { isLoggedIn, logout } = useContext(AuthContext);
  const location = useLocation();

  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    if (isClicked) {
      setIsClicked(false);
    } else {
      setIsClicked(true);
    }
  };

  return (
    <>
      <div
        id="menuBG"
        className={isClicked ? "" : "clicked"}
        onClick={handleClick}
      ></div>
      <div
        id="menuIcon"
        onClick={handleClick}
        className={isClicked ? "clicked" : ""}
      >
        <div className="line line1"></div>
        <div className="line line2"></div>
        <div className="line line3"></div>
      </div>
      <div id="header" className={isClicked ? "clicked" : ""}>
        <ul className="cf header-menu">
          <li className={`logo ${location.pathname === "/" ? "active" : ""}`}>
            <Link to="/">신비한펍(메인)</Link>
          </li>
          <li className={` ${location.pathname === "/menu" ? "active" : ""}`}>
            <Link to="menu">메뉴관리 </Link>
          </li>
          <li className={` ${location.pathname === "/sales" ? "active" : ""}`}>
            <Link to="sales">매출입력/수정</Link>
          </li>
          <li
            className={` ${location.pathname === "/inquiry" ? "active" : ""}`}
          >
            <Link to="inquiry">매출확인</Link>
          </li>
          <li
            className={` ${location.pathname === "/ranking" ? "active" : ""}`}
          >
            <Link to="ranking">인기메뉴</Link>
          </li>
        </ul>
        {isLoggedIn && <LogoutButton onLogout={logout} />}
      </div>
    </>
  );
};

export default Header;
