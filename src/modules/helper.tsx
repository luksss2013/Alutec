import { FilterValue, TablePaginationConfig } from "antd/lib/table/interface";
import { Query } from "../model/query";

export const queryToParams = (query: Query): URLSearchParams => {
  const params = new URLSearchParams();

  params.append(
    "page",
    query.pagination?.current ? (query.pagination.current - 1).toString() : "0"
  );

  params.append(
    "size",
    query.pagination?.pageSize ? query.pagination.pageSize.toString() : "5"
  );

  if (query.sorter?.sort) {
    params.append("sort", `${query.sorter?.sort},${query.sorter?.order}`);
  }

  if (query.search) {
    params.append("search", query.search);
  }

  return params;
};

export const antTableToQuery = (
  pagination: any,
  search: string,
  sorter: any
): Query => {
  return {
    pagination: pagination,
    sorter: {
      sort: sorter.column?.dataIndex,
      order: sorter?.order === "ascend" ? "ASC" : "DESC",
    },
    search: search,
  };
};
