import { Action } from "../../../model/action";
import { Paginated } from "../../../model/paginated";
import { Query } from "../../../model/query";
import { CostumerResponse } from "../model/CostumerResponse";
import { ActionTypes } from "./Action";

export interface CostumerState {
  loading?: boolean;
  clients?: Paginated<CostumerResponse>;
  query: Query;
  isModalOpen?: boolean;
  loadingModal?: boolean;
}

const initialState: CostumerState = {
  query: {
    pagination: {
      current: 1,
      pageSize: 5,
      total: 0,
      defaultPageSize: 5,
    },
    sorter: {
      sort: "",
      order: "",
    },
  },
  loadingModal: false,
};

export default function clientsReducer(state = initialState, action: Action) {
  switch (action.type) {
    case ActionTypes.GET_ALL_COSTUMERS_TRIGGER:
      return {
        ...state,
        loading: true,
        query: {
          ...state.query,
          pagination: {
            ...state.query.pagination,
            ...action.payload.pagination,
          },
        },
      };
    case ActionTypes.GET_ALL_COSTUMERS_SUCCESS:
      return {
        ...state,
        loading: false,
        clients: action.payload,
        query: {
          ...state.query,
          pagination: {
            ...state.query.pagination,
            total: action.payload.totalElements,
          },
        },
      };
    case ActionTypes.GET_ALL_COSTUMERS_ERROR:
      return {
        ...state,
        loading: false,
      };
    case ActionTypes.CREATE_COSTUMER_TRIGGER:
      return {
        ...state,
        loadingModal: true,
      };
    case ActionTypes.CREATE_COSTUMER_SUCCESS:
      return {
        ...state,
        loadingModal: false,
      };
    case ActionTypes.CREATE_COSTUMER_ERROR:
      return {
        ...state,
        loadingModal: false,
      };
    case ActionTypes.SET_MODAL_VISIBILITY:
      return {
        ...state,
        isModalOpen: action.payload,
      };
    default:
      return state;
  }
}
