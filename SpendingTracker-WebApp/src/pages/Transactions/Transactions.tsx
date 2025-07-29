import { useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import TransactionsTable from "../../components/Transactions/TransactionsTable";

export default function Transactions() {
  const navigate = useNavigate();
  return (
    <>
      <PageMeta title="Giao dịch" description="Giao dịch tài chính" />
      <PageBreadcrumb
        pageTitles={[{ title: "Giao dịch", path: "/transactions" }]}
      />
      <div className="space-y-6">
        <ComponentCard
          title="Danh sách giao dịch"
          actions={
            [
              {
                actionName: "Thêm giao dịch",
                action: () => navigate("/transactions/add"),
                icon: <i className="fa-solid fa-plus"></i>,
              },
            ]
          }
        >
          <TransactionsTable
            isSearchAndFilterIncluded
            isPaginationIncluded
            isLineCountDisplayed
          />
        </ComponentCard>
      </div>
    </>
  );
}
