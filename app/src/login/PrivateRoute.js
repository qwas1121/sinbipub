import { useContext } from "react";
import { Navigate, useLocation, useRoutes } from "react-router-dom";
import { AuthContext } from "./AuthContext";

import Header from "../main/Header";
import Main from "../main/Main";
import AddMenu from "../AddMenu/AddMenu";
import Sales from "../sales/Sales";
import Inquiry from "../inquiry/Inquiry";
import Ranking from "../Ranking/Ranking";

const PrivateRoutes = () => {
  const { isLoggedIn } = useContext(AuthContext);
  const location = useLocation();

  const routes = useRoutes([
    {
      path: "/",
      element: isLoggedIn ? (
        <Main />
      ) : (
        <Navigate to="/login" state={{ from: location }} />
      ),
    },
    {
      path: "/menu",
      element: isLoggedIn ? (
        <AddMenu />
      ) : (
        <Navigate to="/login" state={{ from: location }} />
      ),
    },
    {
      path: "/sales",
      element: isLoggedIn ? (
        <Sales />
      ) : (
        <Navigate to="/login" state={{ from: location }} />
      ),
    },
    {
      path: "/inquiry",
      element: isLoggedIn ? (
        <Inquiry />
      ) : (
        <Navigate to="/login" state={{ from: location }} />
      ),
    },
    {
      path: "/ranking",
      element: isLoggedIn ? (
        <Ranking />
      ) : (
        <Navigate to="/login" state={{ from: location }} />
      ),
    },
  ]);

  return (
    <>
      {isLoggedIn && <Header />}
      {routes}
    </>
  );
};

export default PrivateRoutes;
