import "./App.css";
import "./mediaquery.css";
import { Routes, Route } from "react-router-dom";

import Login from "./login/Login";
import { AuthProvider } from "./login/AuthContext";
import PrivateRoutes from "./login/PrivateRoute";

function App() {
  return (
    <>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<PrivateRoutes />} />
        </Routes>
      </AuthProvider>
    </>
  );
}

export default App;
