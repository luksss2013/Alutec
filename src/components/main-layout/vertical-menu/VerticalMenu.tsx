import { Menu } from "antd";
import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

const Logo = styled.div`
  height: 32px;
  background: #ccc;
  margin: 16px;
`;

const VerticalMenu = () => {
  return (
    <>
      <Logo />

      <Menu mode="inline">
        <Menu.Item key="1">
          <Link to="/clientes">
            <a>Clientes</a>
          </Link>
        </Menu.Item>
        <Menu.Item key="2">Fornecedores</Menu.Item>
      </Menu>
    </>
  );
};

export default VerticalMenu;
