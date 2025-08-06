import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import UserInfoCard from "../components/UserProfile/UserInfoCard";
import UserMetaCard from "../components/UserProfile/UserMetaCard";

export default function UserProfile() {
  return (
    <>
      <PageMeta
        title="Hồ sơ"
        description="Hồ sơ của bạn"
      />
      <PageBreadcrumb pageTitles={[
        { title: "Hồ sơ của bạn", path: "/profile" },
      ]} />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Hồ sơ của bạn
        </h3>
        <div className="space-y-6">
          <UserMetaCard />
          <UserInfoCard />
        </div>
      </div>
    </>
  );
}