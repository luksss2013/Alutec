import styled from "styled-components";

const BorderedTitle = styled.h1`
  padding-bottom: 5px;
  margin-bottom: 20px;
  border-bottom: 1px solid #eaeaea;
  text-align: center;
`;

const ContentHeader: React.FC = ({ children }) => {
  return <BorderedTitle>{children}</BorderedTitle>;
};

export default ContentHeader;
