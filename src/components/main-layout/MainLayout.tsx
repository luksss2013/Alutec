import { Layout, Breadcrumb } from "antd";
import VerticalMenu from "./vertical-menu/VerticalMenu";
import HorizontalMenu from "./horizontal-menu/HorizontalMenu";
import ContentArea from "./content-area/ContentArea";
import styled from "styled-components";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import CostumerPage from "../../pages/clientes/store/CostumerPage";

const { Header, Sider } = Layout;

const { Item } = Breadcrumb;

const StyledLayout = styled(Layout)`
  height: 100vh;
  width: 100%;
`;

const CenterLayout = styled(Layout)`
  margin: 64px 50px 0 280px;
`;

const StyledBreadcumb = styled(Breadcrumb)`
  margin: 20px 0 10px 0;
`;

const SideMenu = styled(Sider)`
  z-index: 2;
  overflow: auto;
  height: 100vh;
  position: fixed;
  left: 0;
`;

const TopMenu = styled(Header)`
  position: fixed;
  zindex: 1;
  width: 100%;
  padding: 0;
`;

const MainLayout: React.FC = () => (
  <BrowserRouter>
    <StyledLayout>
      <TopMenu>
        <HorizontalMenu />
      </TopMenu>

      <SideMenu width={230} theme="light">
        <VerticalMenu />
      </SideMenu>

      <CenterLayout>
        <StyledBreadcumb>
          <Item>Home</Item>
          <Item>List</Item>
          <Item>App</Item>
        </StyledBreadcumb>

        <ContentArea>
          <Switch>
            <Route path="/clientes" exact={true} component={CostumerPage} />
          </Switch>
        </ContentArea>
      </CenterLayout>
    </StyledLayout>
  </BrowserRouter>
);

export default MainLayout;
