import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

import { Button, Checkbox, Form, Input } from "antd";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { setIsLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const response = await axios.post("/api/login", {
        username,
        password,
      });
      if (response.status === 200) {
        setIsLoggedIn(true);
        sessionStorage.setItem("userId", response.data.userId);
        navigate("/");
      }
    } catch (error) {
      if (error.response) {
        alert("로그인 정보가 틀렸습니다.");
      } else {
        alert("Error connecting to the server");
        console.log(error);
      }
    }
  };

  return (
    <div className="App">
      <div className="login_wrap">
        <h1>신비한Pub</h1>
        <p>로그인 해주세요.</p>
        <Form onFinish={handleSubmit}>
          <Form.Item>
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Form.Item>
          <Form.Item>
            <Input.Password
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Login
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default Login;
