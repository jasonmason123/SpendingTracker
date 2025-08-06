export default function DevInfoCard() {
  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Thông tin cá nhân
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Tên
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                Minh Sơn
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Họ
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                Bùi
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Địa chỉ email
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                buiminhson940@gmail.com
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Số điện thoại
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                +84 921 799 939
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Tiểu sử
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                Kỹ sư phần mềm / Software Engineer
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
