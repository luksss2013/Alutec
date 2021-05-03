import React, { useEffect, useState } from "react";
import { Button, Input, Modal, Table } from "antd";
import {
  DeleteOutlined,
  DeleteTwoTone,
  EditTwoTone,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { getAllClientsTrigger, setModalVisibility } from "./Action";
import { RootState } from "../../../store/rootReducer";
import { antTableToQuery } from "../../../modules/helper";
import ContentHeader from "../../../components/content-header/ContentHeader";
import CostumerCreateEdit from "../costumer-create-edit/CostumerCreateEdit";

const FlexContainer = styled.div`
  display: flex;
  font-size: 20px;
`;
const SeparatorSpacing = styled.div`
  margin-right: 15px;
`;

const TableHeaderRow = styled.div`
  display: flex;
  place-content: space-between;
`;

const SearchInput = styled(Input)`
  width: 200px;
  height: 33px;
`;

const columns = [
  {
    title: "Nome",
    dataIndex: "name",
    render: (text: string) => <a>{text}</a>,
    sorter: true,
  },
  {
    title: "Email",
    dataIndex: "email",
    sorter: true,
  },
  {
    title: "Endereço",
    dataIndex: "address",
    render: (address: any) =>
      `${address.street}, ${address.number} - ${address.zipCode}`,
  },
  {
    title: "Ações",
    dataIndex: "actions",
    render: () => {
      return (
        <FlexContainer>
          <a>
            <EditTwoTone />
          </a>
          <SeparatorSpacing />
          <a>
            <DeleteTwoTone />
          </a>
        </FlexContainer>
      );
    },
  },
];

const SpacedButton = styled(Button)`
  margin-bottom: 10px;
`;

const SpacedRemoveButton = styled(Button)`
  margin-bottom: 10px;
  margin-left: 10px;
`;

const ClientsPage: React.FC = () => {
  const [selectionType] = useState<"checkbox">("checkbox");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllClientsTrigger({ pagination }));
  }, []);

  const clients = useSelector(
    (state: RootState) => state.costumerReducer.clients?.content
  );

  const pagination = useSelector(
    (state: RootState) => state.costumerReducer.query.pagination
  );

  const sorter = useSelector(
    (state: RootState) => state.costumerReducer.query.sorter
  );

  const loading = useSelector(
    (state: RootState) => state.costumerReducer.loading
  );

  const isModalOpen = useSelector(
    (state: RootState) => state.costumerReducer.isModalOpen
  );

  const rowSelection = {
    selectedRowKeys,
    onChange: (rowKeys: any) => setSelectedRowKeys(rowKeys),
  };

  const hasSelected = selectedRowKeys.length > 0;

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    dispatch(getAllClientsTrigger(antTableToQuery(pagination, value, sorter)));
  };
  const [value, setValue] = useState("");

  return (
    <>
      <ContentHeader>Cadastro de clientes</ContentHeader>

      <TableHeaderRow>
        <div>
          <SpacedButton
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => dispatch(setModalVisibility(true))}
          >
            Cadastrar cliente
          </SpacedButton>

          {hasSelected ? (
            <SpacedRemoveButton type="primary" danger icon={<DeleteOutlined />}>
              Remover selecionados
            </SpacedRemoveButton>
          ) : (
            <></>
          )}
        </div>

        <SearchInput
          placeholder="Pesquisar..."
          value={value}
          prefix={<SearchOutlined style={{ color: "#1890ff" }} />}
          onChange={(e) => {
            const currValue = e.target.value;
            setValue(currValue);

            dispatch(
              getAllClientsTrigger(
                antTableToQuery(pagination, currValue, sorter)
              )
            );
          }}
        />
      </TableHeaderRow>

      <Table
        rowSelection={{
          type: selectionType,
          ...rowSelection,
        }}
        rowKey={(record) => record.id}
        columns={columns}
        dataSource={clients}
        pagination={{ position: ["bottomCenter"], ...pagination }}
        loading={loading}
        onChange={handleTableChange}
      />

      <Modal
        title="Cadastrar cliente"
        visible={isModalOpen}
        footer={null}
        onCancel={() => dispatch(setModalVisibility(false))}
      >
        <CostumerCreateEdit />
      </Modal>
    </>
  );
};

export default ClientsPage;
