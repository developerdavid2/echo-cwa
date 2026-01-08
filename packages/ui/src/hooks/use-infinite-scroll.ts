import useInfiniteScroll from "react-infinite-scroll-hook";

interface UseInfiniteScrollProps {
  status: "LoadingFirstPage" | "CanLoadMore" | "LoadingMore" | "Exhausted";
  loadMore: (numItems: number) => void;
  loadSize?: number;
  rootMargin?: string;
  disabled?: boolean;
}

/**
 * Custom hook for infinite scrolling using react-infinite-scroll-hook
 * Handles both top and bottom infinite scroll scenarios
 */
export const useInfiniteScrollWithHook = ({
  status,
  loadMore,
  loadSize = 10,
  rootMargin = "400px",
  disabled = false,
}: UseInfiniteScrollProps) => {
  const loading = status === "LoadingMore" || status === "LoadingFirstPage";
  const hasNextPage = status === "CanLoadMore";

  const [sentryRef] = useInfiniteScroll({
    loading,
    hasNextPage,
    onLoadMore: () => loadMore(loadSize),
    disabled,
    rootMargin,
    delayInMs: 100,
  });

  return {
    sentryRef,
    canLoadMore: status === "CanLoadMore",
    isLoadingMore: status === "LoadingMore",
    isLoadingFirstPage: status === "LoadingFirstPage",
    isExhausted: status === "Exhausted",
  };
};
