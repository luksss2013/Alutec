import { Layout } from "antd";
import styled from "styled-components";

const { Content } = Layout;

const ContentContainer = styled(Content)`
  overflow: initial;
  background-color: #fff;
  margin-bottom: 50px;
`;

const StyledContentArea = styled.div`
  height: 100%;
  padding: 24px 48px;
`;

const ContentArea: React.FC = ({ children }) => {
  return (
    <ContentContainer>
      <StyledContentArea>{children}</StyledContentArea>
    </ContentContainer>
  );
};

export default ContentArea;
