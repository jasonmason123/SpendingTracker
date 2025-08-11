import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { Category } from "../../types";
import { createCategory, fetchCategory, updateCategory } from "../../api_caller/CategoryApiCaller";

export default function CategoryAddEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const categoryFromState: Category | undefined = location.state?.category;

  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<Category | undefined>();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!category?.name?.trim()) return;

    if(!confirm("Bạn có chắc chắn muốn lưu?")) {
      return;
    }

    try {
      setLoading(true);
      let result: Category;
      if (id) {
        result = await updateCategory({ ...category, id: parseInt(id) });
      } else {
        result = await createCategory({ name: category.name.trim() });
      }
      alert("Đã lưu danh mục thành công!");
      const navigatePath = result.id ? `/categories/${result.id}` : id ? `/categories/${id}` : "/categories";
      navigate(navigatePath);
    } catch (err) {
      console.error("Error saving category:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (categoryFromState && id) {
      setCategory(categoryFromState);
    } else if (!categoryFromState && id) {
      setLoading(true);
      fetchCategory(parseInt(id))
        .then((data) => setCategory(data))
        .catch((err) => console.error("Error fetching category:", err))
        .finally(() => setLoading(false));
    } else {
      setCategory({ name: "" });
    }
  }, [id]);

  return (
    <>
      <PageMeta
        title={id ? "Cập nhật danh mục" : "Tạo danh mục mới"}
        description={id ? "Cập nhật danh mục" : "Tạo danh mục mới"}
      />
      <PageBreadcrumb
        pageTitles={[
          { title: "Danh mục", path: "/categories" },
          { title: id ? "Cập nhật" : "Tạo mới", path: id ? `/categories/${id}/edit` : "/categories/add" },
        ]}
      />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          {id ? "Cập nhật danh mục" : "Tạo danh mục mới"}
        </h3>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Tên danh mục <span className="text-red-500">*</span>
              </p>
              <Input
                required
                disabled={loading}
                placeholder="VD: Ăn uống"
                maxLength={100}
                value={category?.name || ""}
                onChange={(e) => setCategory((prev) => ({ ...(prev || {}), name: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button size="sm" type="submit" disabled={loading}>
              Lưu
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}


