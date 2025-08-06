import PageBreadcrumb from "../components/common/PageBreadCrumb";
import DevMetaCard from "../components/DeveloperInfo/DevMetaCard";
import DevInfoCard from "../components/DeveloperInfo/DevInfoCard";
import DevAddressCard from "../components/DeveloperInfo/DevAddressCard";
import PageMeta from "../components/common/PageMeta";

export default function DeveloperInfo() {
  return (
    <>
      <PageMeta
        title="Nhà phát triển"
        description="Thông tin nhà phát triển"
      />
      <PageBreadcrumb pageTitles={[
        { title: "Nhà phát triển", path: "/developer" },
      ]} />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Thông tin nhà phát triển
        </h3>
        <div className="space-y-6">
          <DevMetaCard />
          <DevInfoCard />
          <DevAddressCard />
        </div>
      </div>
    </>
  );
}
