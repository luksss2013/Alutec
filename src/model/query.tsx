import { PaginationProps } from "antd";

export interface Query {
  pagination?: PaginationProps;
  sorter?: Sorter;
  search?: string;
}

export interface Pagination {
  current: number;
  pageSize: number;
}

export interface Sorter {
  sort: string;
  order: string;
}
