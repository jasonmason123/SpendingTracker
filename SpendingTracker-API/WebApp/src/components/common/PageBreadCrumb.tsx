import { Link } from "react-router";
import { PageTitle } from "../../types";

interface BreadcrumbProps {
  pageTitles: PageTitle[];
}

const PageBreadcrumb: React.FC<BreadcrumbProps> = ({ pageTitles }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <h2
        className="text-xl font-semibold text-gray-800 dark:text-white/90"
        x-text="pageName"
      >
        {pageTitles[pageTitles.length - 1].title}
      </h2>
      <nav>
        <ol className="flex items-center gap-1.5">
          <li>
            <Link
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400"
              to="/"
            >
              Trang chủ
            </Link>
          </li>
          {pageTitles.map((title, index) => (
            <li
              key={index}
              className={`inline-flex items-center gap-1.5 text-sm
                ${index === pageTitles.length - 1 ? "text-gray-800 dark:text-white/90" :
                  "text-gray-500 dark:text-gray-400"}`}
            >
              <svg
                className="stroke-current text-gray-500 dark:text-gray-400"
                width="17"
                height="16"
                viewBox="0 0 17 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
                  stroke=""
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <Link
                className="hover:text-gray-800 dark:hover:text-white/90"
                to={title.path}
                state={title.state}
              >
                {title.title}
              </Link>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
};

export default PageBreadcrumb;
