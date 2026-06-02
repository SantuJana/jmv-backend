export type PaginationOptions = {
  page?: number;
  limit?: number;
};

export const normalizePagination = ({ page = 1, limit = 20 }: PaginationOptions) => {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), 100);

  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
    take: safeLimit
  };
};
