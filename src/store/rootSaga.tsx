import { all, fork } from "redux-saga/effects";
import costumerSaga from "../pages/clientes/store/Saga";

export default function* root() {
  yield all([fork(costumerSaga)]);
}
