import "./styles/antd.css";
import "./styles/globals.css";
import "./styles/Home.module.css";
import React from "react";
import MainLayout from "./components/main-layout/MainLayout";
import ptBR from "antd/lib/locale/pt_BR";
import { ConfigProvider } from "antd";

const MyApp: React.FC = () => (
  <div className="App">
    <ConfigProvider locale={ptBR}>
      <MainLayout></MainLayout>
    </ConfigProvider>
  </div>
);

export default MyApp;
