import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { Category, FlagBoolean } from "../../types";
import { fetchCategory } from "../../api_caller/CategoryApiCaller";

export default function CategoryDetails() {
  const { id } = useParams();
  const [category, setCategory] = useState<Category | undefined>();

  useEffect(() => {
    if (!id) return;
    fetchCategory(parseInt(id))
      .then((data) => setCategory(data))
      .catch((err) => console.error("Error fetching category:", err));
  }, [id]);

  return (
    <>
      <PageMeta title={`Danh mục #${id}`} description={`Thông tin danh mục #${id}`} />
      <PageBreadcrumb
        pageTitles={[
          { title: "Danh mục", path: "/categories" },
          { title: `#${id}`, path: `/categories/${id}` },
        ]}
      />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Thông tin danh mục</h3>
          {id && (
            <Link
              to={`/categories/${id}/edit`}
              className="text-sm text-blue-600 hover:text-blue-700"
              state={{ category }}
            >
              Chỉnh sửa
            </Link>
          )}
        </div>

        <div className="space-y-3 text-sm">
          <div><span className="text-gray-500">ID:</span> <span className="dark:text-white">{category?.id}</span></div>
          <div><span className="text-gray-500">Tên:</span> <span className="dark:text-white">{category?.name}</span></div>
          <div><span className="text-gray-500">Trạng thái:</span> <span className="dark:text-white">{category?.flagDel === FlagBoolean.TRUE ? "Đã xóa" : "Đang dùng"}</span></div>
          <div><span className="text-gray-500">Tạo lúc:</span> <span className="dark:text-white">{category?.createdAt && new Date(category.createdAt).toLocaleString("vi-VN")}</span></div>
          <div><span className="text-gray-500">Cập nhật lúc:</span> <span className="dark:text-white">{category?.updatedAt && new Date(category.updatedAt).toLocaleString("vi-VN")}</span></div>
        </div>
      </div>
    </>
  );
}


