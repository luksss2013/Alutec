import { message } from "antd";
import { call, debounce, put, takeLatest } from "redux-saga/effects";

import {
  ActionTypes,
  getAllClientsSuccess,
  getAllClientsError,
  createCostumerSuccess,
  createCostumerError,
} from "./Action";
import { create, getAllClients } from "../Service";
import { Query } from "../../../model/query";
import { CostumerResponse } from "../model/CostumerResponse";

function* getCostumers(action: { type: string; payload: Query }) {
  try {
    const { response } = yield call(getAllClients, action.payload);
    yield put(getAllClientsSuccess(response.data));
  } catch (error) {
    yield put(getAllClientsError(error));
  }
}

function* createCostumerTriggerSaga(action: {
  type: string;
  payload: CostumerResponse;
}) {
  try {
    yield call(create, action.payload);

    yield put(createCostumerSuccess());
  } catch (error) {
    yield put(createCostumerError());
  }
}

function* createCostumerSuccessSaga() {
  message.success("Cliente criado com sucesso !");
}

function* createCostumerErrorSaga() {
  message.error("Falha ao criar cliente.");
}

export default function* costumerSaga() {
  yield debounce(500, ActionTypes.GET_ALL_COSTUMERS_TRIGGER, getCostumers);
  yield takeLatest(
    ActionTypes.CREATE_COSTUMER_TRIGGER,
    createCostumerTriggerSaga
  );
  yield takeLatest(
    ActionTypes.CREATE_COSTUMER_SUCCESS,
    createCostumerSuccessSaga
  );
  yield takeLatest(ActionTypes.CREATE_COSTUMER_ERROR, createCostumerErrorSaga);
}
