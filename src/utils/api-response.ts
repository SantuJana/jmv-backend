type ApiResponseInput<TData = unknown> = {
  success?: boolean;
  message: string;
  data?: TData;
  errors?: unknown;
  meta?: Record<string, unknown>;
};

export const buildApiResponse = <TData = unknown>({
  success = true,
  message,
  data,
  errors,
  meta
}: ApiResponseInput<TData>) => ({
  success,
  message,
  data,
  errors,
  meta
});
