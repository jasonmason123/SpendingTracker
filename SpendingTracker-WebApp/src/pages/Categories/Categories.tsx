import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import CategoriesTable from "../../components/Categories/CategoriesTable";
import { useNavigate } from "react-router";

export default function Categories() {
  const navigate = useNavigate();
  return (
    <>
      <PageMeta title="Danh mục" description="Quản lý danh mục" />
      <PageBreadcrumb pageTitles={[{ title: "Danh mục", path: "/categories" }]} />
      <div className="space-y-6">
        <ComponentCard
          title="Danh sách danh mục"
          actions={
            [
              {
                actionName: "Thêm danh mục",
                action: () => navigate("/categories/add"),
                icon: <i className="fa-solid fa-plus"></i>,
              },
            ]
          }
        >
          <CategoriesTable isSearchIncluded isPaginationIncluded />
        </ComponentCard>
      </div>
    </>
  );
}


