import { FlagBoolean } from "../types";
import Badge from "./ui/badge/Badge";

interface MetaDataCardProps {
    entity: any;
}

export default function MetaDataCard({ entity }: MetaDataCardProps) {
  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-6">
            Thông tin khác
          </h4>

          <div className="lg:flex grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Được tạo vào ngày
              </p>
              <p className="text-sm font-bold text-gray-800 dark:text-white/90">
                {entity?.dateCreated && new Date(entity.dateCreated).toLocaleDateString("vi-VN", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })}
              </p>
            </div>

            {entity.dateUpdated && (
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Lần cập nhật gần nhất
                </p>
                <p className="text-sm font-bold text-gray-800 dark:text-white/90">
                  {entity?.dateUpdated?.toLocaleDateString("vi-VN", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </p>
              </div>
            )}

            {entity.flagDel !== undefined && (
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Trạng thái hoạt động
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {entity?.flagDel == FlagBoolean.FALSE ? (
                    <Badge
                      color="success"
                      size="sm"
                    >
                      Đang hoạt động
                    </Badge>
                  ) : (
                    <Badge
                      color="error"
                      size="sm"
                    >
                      Đã ngừng hoạt động
                    </Badge>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
