import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHeader,
  TableRow,
} from "../../ui/table";

import { ArrowRightIcon } from "../../../icons";

interface Order {
  id: number;
  name: string;
  type: string;
  status: string;
  amount: number;
}

// Define the table data using the interface
const tableData: Order[] = [
  {
    id: 1,
    name: "My Wallet",
    type: "Cash Account",
    amount: 3900,
    status: "Active",
  },
  {
    id: 2,
    name: "My Bank",
    type: "Bank Account",
    amount: 24900,
    status: "Pending",
  },
  {
    id: 3,
    name: "My Credit Card",
    type: "Credit Account",
    amount: 12700,
    status: "Active",
  },
];

export default function BasicTableOne() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="p-4 flex justify-between border-b border-gray-100 dark:border-white/[0.05] flex-col sm:flex-row gap-4">
          <form className="w-full sm:w-1/4">
            <div className="relative w-full max-w-sm flex items-center">
              <button
                type="submit"
                className="absolute left-2 text-gray-500 dark:text-gray-400 p-1"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                    fill="currentColor"
                  />
                </svg>
              </button>

              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white text-gray-800 shadow-sm shadow-theme-xs focus:border-brand-500 focus:ring-1 focus:outline-hidden focus:ring-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-white/40 dark:focus:border-brand-400 dark:focus:ring-brand-800"
              />
            </div>
          </form>
          <div className="w-full sm:w-auto flex gap-4">
            <div>
              <span className="text-gray-500 dark:text-gray-400 text-sm">Account Type: </span>
              <select
                onChange={() => {}}
                className="hover:underline text-sm focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-white/30 dark:text-white/90"
              >
                <option value="cash">Cash</option>
                <option value="bank">Bank</option>
                <option value="credit">Credit</option>
              </select>
            </div>
          </div>
        </div>
        <Table>
          {/* Table Header */}
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Name
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Type
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Amount
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {tableData.map((order) => (
              <TableRow
                key={order.id}
                className="hover:bg-gray-50 dark:hover:bg-white/[0.03] cursor-pointer"
                onClick={() => {alert('Clicked: ' + order.id)}}
              >
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  <div className="flex items-center gap-3">
                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {order.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {order.type}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {order.amount}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  <ArrowRightIcon />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableCell className="px-5 py-4 sm:px-6 text-start">
              Hi
            </TableCell>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
}
