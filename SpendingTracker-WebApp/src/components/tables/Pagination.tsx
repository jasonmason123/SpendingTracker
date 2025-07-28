import { DEFAULT_PAGE_NUMBER } from "../../types";

interface PaginationProps {
  className?: string;
  pageNumber?: number;
  pageCount?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export default function Pagination({
  className,
  pageNumber = DEFAULT_PAGE_NUMBER,
  pageCount = 0,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  return (
    <div className={className}>
      <div className="text-sm text-gray-700 dark:text-white">
        <span className="text-sm text-gray-400">Số dòng/trang:</span>
        <select
          onChange={(e) => {
            const newPageSize = Number.parseInt(e.target.value, 10)
            onPageSizeChange(newPageSize)
          }}
          className="hover:underline text-sm focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-white/30"
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
      </div>
      <div>
        <span className="text-sm text-gray-400">Trang </span>
        <span className="text-sm dark:text-white">
          {pageNumber}/{pageCount}
        </span>
        {pageCount > 1 && (
          <>
            <button
              onClick={() => {
                if (pageNumber > 1) {
                  const newPage = pageNumber - 1
                  onPageChange(newPage)
                }
              }}
              className="px-3 py-1 text-sm text-gray-400 rounded hover:text-gray-700 dark:hover:text-white"
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <button
              onClick={() => {
                if (pageNumber < pageCount) {
                  const newPage = pageNumber + 1
                  onPageChange(newPage)
                }
              }}
              className="px-3 py-1 text-sm text-gray-400 rounded hover:text-gray-700 dark:hover:text-white"
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </>
        )}
      </div>
    </div>
  );
}