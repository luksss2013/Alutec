import { Sorter } from "./query";

export interface Params {
  pageSize: number;
  page: number;
  sort: Sorter[];
}
