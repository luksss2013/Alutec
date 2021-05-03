import { Paginated } from "../../../model/paginated";
import { Query } from "../../../model/query";
import { CostumerRequest } from "../model/CostumerRequest";
import { CostumerResponse } from "../model/CostumerResponse";

export const ActionTypes = {
  GET_ALL_COSTUMERS_TRIGGER: "[Costumer] get all costumer trigger",
  GET_ALL_COSTUMERS_SUCCESS: "[Costumer] get all costumer success",
  GET_ALL_COSTUMERS_ERROR: "[Costumer] get all costumer error",

  CREATE_COSTUMER_TRIGGER: "[Costumer] create costumer trigger",
  CREATE_COSTUMER_SUCCESS: "[Costumer] create costumer success",
  CREATE_COSTUMER_ERROR: "[Costumer] create costumer error",

  SET_MODAL_VISIBILITY: "[Costumers] set modal visibility",
};

export const getAllClientsTrigger = (query: Query) => {
  return {
    type: ActionTypes.GET_ALL_COSTUMERS_TRIGGER,
    payload: query,
  };
};

export const getAllClientsSuccess = (clients: Paginated<CostumerResponse>) => {
  return {
    type: ActionTypes.GET_ALL_COSTUMERS_SUCCESS,
    payload: clients,
  };
};

export const getAllClientsError = (error: any) => {
  return {
    type: ActionTypes.GET_ALL_COSTUMERS_ERROR,
    payload: error,
  };
};

export const createCostumerTrigger = (costumer: CostumerRequest) => {
  return {
    type: ActionTypes.CREATE_COSTUMER_TRIGGER,
    payload: costumer,
  };
};

export const createCostumerSuccess = () => {
  return {
    type: ActionTypes.CREATE_COSTUMER_SUCCESS,
  };
};

export const createCostumerError = () => {
  return {
    type: ActionTypes.CREATE_COSTUMER_ERROR,
  };
};

export const setModalVisibility = (isModalOpen: boolean) => {
  return {
    type: ActionTypes.SET_MODAL_VISIBILITY,
    payload: isModalOpen,
  };
};
