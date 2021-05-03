import { combineReducers } from "redux";
import costumerReducer, {
  CostumerState,
} from "../pages/clientes/store/Reducer";

export interface RootState {
  costumerReducer: CostumerState;
}

export const initialState = combineReducers({
  costumerReducer: costumerReducer,
});
