import { applyMiddleware, createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import sagaMiddleware from "./middleware";
import { initialState } from "./rootReducer";
import rootSaga from "./rootSaga";

export const configureStore = () => {
  const middlewares = applyMiddleware(sagaMiddleware);
  const store = createStore(initialState, {}, composeWithDevTools(middlewares));

  sagaMiddleware.run(rootSaga);

  return store;
};
