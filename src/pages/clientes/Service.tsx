import axios, { AxiosResponse } from "axios";
import { Paginated } from "../../model/paginated";
import { Query } from "../../model/query";
import { queryToParams } from "../../modules/helper";
import { CostumerResponse } from "./model/CostumerResponse";

const resourceName = "customer";

export function getAllClients(
  query: Query
): Promise<
  { response: AxiosResponse<Paginated<CostumerResponse>> } | { error: any }
> {
  return axios
    .get("http://localhost:8080/api/" + resourceName, {
      params: queryToParams(query),
    })
    .then((response: AxiosResponse<Paginated<CostumerResponse>>) => ({
      response,
    }))
    .catch((error) => ({ error }));
}

export const create = (costumer: CostumerResponse): any => {
  return axios.post("http://localhost:8080/api/" + resourceName, costumer);
};
