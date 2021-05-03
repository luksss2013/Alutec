import { Button, Form, Input, Spin } from "antd";
import TextArea from "antd/lib/input/TextArea";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { RootState } from "../../../store/rootReducer";
import { CostumerRequest } from "../model/CostumerRequest";
import { createCostumerTrigger } from "../store/Action";

const { Item } = Form;

const InlineForm = styled.div`
  display: inline-block;
  width: calc(50% - 8px);
  margin: 0 8px;
`;

const CostumerCreateEdit: React.FC = () => {
  const layout = {
    labelCol: { span: 8 },
  };
  const dispatch = useDispatch();

  const isLoadingModal = useSelector(
    (state: RootState) => state.costumerReducer.loadingModal
  );

  const onFinish = (costumer: CostumerRequest) => {
    dispatch(createCostumerTrigger(costumer));
  };

  const onFinishFailed = (errorInfo: any) => {};

  return (
    <Spin spinning={isLoadingModal}>
      <Form
        {...layout}
        name="basic"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <Item
          label="Nome"
          name="name"
          rules={[{ required: true, message: "O campo nome é obrigatório" }]}
        >
          <Input />
        </Item>

        <Item
          label="E-mail"
          name="email"
          rules={[
            {
              type: "email",
              message: "Favor inserir um e-mail válido",
            },
            {
              required: true,
              message: "O campo e-mail é obrigatório",
            },
          ]}
        >
          <Input />
        </Item>

        <Item
          label="CPF ou CNPJ"
          name="cpfCnpj"
          rules={[
            {
              required: true,
              message: "O campo CPF ou CNPJ é obrigatório",
            },
          ]}
        >
          <Input />
        </Item>

        <Item
          label="Telefone principal"
          name="phoneOne"
          rules={[
            {
              required: true,
              message: "O campo telefone é obrigatório",
            },
            {
              len: 11,
              message: "O campo telefone deve conter 11 números",
            },
          ]}
        >
          <Input placeholder="Insira somente números"></Input>
        </Item>

        <Item
          label="Telefone secundário"
          name="phoneTwo"
          rules={[
            {
              len: 11,
              message: "O campo telefone deve conter 11 números",
            },
          ]}
        >
          <Input placeholder="Insira somente números"></Input>
        </Item>

        <Item label="CEP" name={["address", "zipCode"]}>
          <Input />
        </Item>

        <Item label="Endereço" name={["address", "street"]}>
          <Input />
        </Item>

        <Item label="Número" name={["address", "number"]}>
          <Input />
        </Item>

        <Item label="Cidade" name={["address", "city"]}>
          <Input />
        </Item>

        <Item label="Estado" name={["address", "state"]}>
          <Input />
        </Item>

        <Item label="Anotação" name="annotation">
          <TextArea rows={3} />
        </Item>

        <Item>
          <Button type="primary">Cancelar</Button>

          <Button type="primary" htmlType="submit" disabled={isLoadingModal}>
            Criar
          </Button>
        </Item>
      </Form>
    </Spin>
  );
};

export default CostumerCreateEdit;
