"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type QueryKey = readonly unknown[];

type QueryState<T> = {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
};

type QueryOptions<T> = {
  queryKey: QueryKey;
  queryFn: () => Promise<T>;
  enabled?: boolean;
};

type MutationOptions<TData, TVariables> = {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: unknown, variables: TVariables) => void;
};

function serializeQueryKey(queryKey: QueryKey) {
  return JSON.stringify(queryKey);
}

function queryKeyStartsWith(queryKey: QueryKey, prefix: QueryKey) {
  return prefix.every((value, index) => queryKey[index] === value);
}

export class QueryClient {
  private listeners = new Set<(queryKey: QueryKey) => void>();

  subscribe(listener: (queryKey: QueryKey) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  invalidateQueries(options: { queryKey: QueryKey }) {
    this.listeners.forEach((listener) => listener(options.queryKey));
  }
}

const QueryClientContext = createContext<QueryClient | null>(null);

export function QueryClientProvider({
  client,
  children,
}: {
  client: QueryClient;
  children: ReactNode;
}) {
  return (
    <QueryClientContext.Provider value={client}>
      {children}
    </QueryClientContext.Provider>
  );
}

export function useQueryClient() {
  const queryClient = useContext(QueryClientContext);

  if (!queryClient) {
    throw new Error("QueryClientProvider is missing.");
  }

  return queryClient;
}

export function useQuery<T>(options: QueryOptions<T>) {
  const queryClient = useQueryClient();
  const [version, setVersion] = useState(0);
  const queryKeyHash = serializeQueryKey(options.queryKey);
  const enabled = options.enabled ?? true;
  const queryFnRef = useRef(options.queryFn);
  const queryKeyRef = useRef(options.queryKey);

  const [state, setState] = useState<QueryState<T>>({
    data: undefined,
    isLoading: enabled,
    isError: false,
    error: null,
  });

  const refetch = useCallback(async () => {
    if (!enabled) {
      setState((current) => ({
        ...current,
        isLoading: false,
      }));
      return undefined;
    }

    setState((current) => ({
      ...current,
      isLoading: true,
      isError: false,
      error: null,
    }));

    try {
      const data = await queryFnRef.current();

      setState({
        data,
        isLoading: false,
        isError: false,
        error: null,
      });

      return data;
    } catch (error) {
      setState((current) => ({
        ...current,
        isLoading: false,
        isError: true,
        error,
      }));

      return undefined;
    }
  }, [enabled]);

  useEffect(() => {
    queryFnRef.current = options.queryFn;
    queryKeyRef.current = options.queryKey;
  }, [options.queryFn, options.queryKey]);

  useEffect(() => {
    return queryClient.subscribe((invalidatedQueryKey) => {
      if (queryKeyStartsWith(queryKeyRef.current, invalidatedQueryKey)) {
        setVersion((current) => current + 1);
      }
    });
  }, [queryClient, queryKeyHash]);

  useEffect(() => {
    let isActive = true;

    if (!enabled) {
      setState((current) => ({
        ...current,
        isLoading: false,
      }));
      return;
    }

    setState((current) => ({
      ...current,
      isLoading: true,
      isError: false,
      error: null,
    }));

    queryFnRef
      .current()
      .then((data) => {
        if (!isActive) return;

        setState({
          data,
          isLoading: false,
          isError: false,
          error: null,
        });
      })
      .catch((error) => {
        if (!isActive) return;

        setState((current) => ({
          ...current,
          isLoading: false,
          isError: true,
          error,
        }));
      });

    return () => {
      isActive = false;
    };
  }, [enabled, queryKeyHash, version]);

  return useMemo(
    () => ({
      ...state,
      refetch,
    }),
    [refetch, state]
  );
}

export function useMutation<TData, TVariables>(
  options: MutationOptions<TData, TVariables>
) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const mutate = useCallback(
    (variables: TVariables, callbacks?: Partial<MutationOptions<TData, TVariables>>) => {
      setIsPending(true);
      setError(null);

      void options
        .mutationFn(variables)
        .then((data) => {
          options.onSuccess?.(data, variables);
          callbacks?.onSuccess?.(data, variables);
        })
        .catch((caughtError) => {
          setError(caughtError);
          options.onError?.(caughtError, variables);
          callbacks?.onError?.(caughtError, variables);
        })
        .finally(() => {
          setIsPending(false);
        });
    },
    [options]
  );

  return {
    mutate,
    isPending,
    isError: Boolean(error),
    error,
  };
}
