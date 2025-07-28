import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useParams } from "react-router";
import { Transaction } from "../../types";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import { useModal } from "../../hooks/useModal";
import { useEffect, useState } from "react";
import TransactionOverallCard from "../../components/Transactions/TransactionOverallCard";
import MetaDataCard from "../../components/MetaDataCard";
import TransactionInfoCard from "../../components/Transactions/TransactionInfoCard";
import TransactionNoteCard from "../../components/Transactions/TransactionNoteCard";
import TransactionAttachmentCard from "../../components/Transactions/TransactionAttachmentCard";
import ComponentCard from "../../components/common/ComponentCard";

export default function TransactionDetails() {
  const [loading, setLoading] = useState(false);
  const [transaction, setTransaction] = useState<Transaction>({});
  const { isOpen: isOpenModalEdit,
          openModal: openModalEdit,
          closeModal: closeModalEdit
        } = useModal();
  
  const handleSave = () => {
    // Handle save logic here
    console.log("Saving changes...");
    closeModalEdit();
  };
  
  const { id: transactionId } = useParams<{ id: string }>();
  const [accName, setAccName] = useState(transactionId || "");

  const fetchTransaction = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setTransaction({
        ...data,
        date: new Date(data.dateRecorded),
        createdAt: new Date(data.dateCreated),
        dateUpdated: data.dateUpdated && new Date(data.dateUpdated),
      });
      console.log("Transaction data fetched:", data);
    } catch (error) {
      console.error("Error fetching account data:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTransaction();
  }, []);

  return (
    <>
      <PageMeta title="Giao dịch" description="Giao dịch tài chính" />
      <PageBreadcrumb pageTitles={[
          { title: "Giao dịch", path: "/transactions" },
          { title: "Chi tiết giao dịch", path: `/transactions/${transactionId}` }
        ]} />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="space-y-6">
          {loading ? (
            <p className="text-center text-gray-500 dark:text-white/50">Đang tải dữ liệu...</p>
          ) : (
            <ComponentCard
              title="Chi tiết giao dịch"
              actions={[
                {
                  actionName: "Cập nhật",
                  action: openModalEdit,
                  icon: <i className="fa-solid fa-pencil"></i>,
                }
              ]}
            >
              <TransactionOverallCard transaction={transaction} />
              <TransactionInfoCard transaction={transaction} />
              <TransactionAttachmentCard transaction={transaction} />
              <TransactionNoteCard transaction={transaction} />
              <MetaDataCard entity={transaction} />
            </ComponentCard>
          )}
        </div>
      </div>

      <Modal isOpen={isOpenModalEdit} onClose={closeModalEdit} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Cập nhật thông tin tài khoản: {transactionId}
            </h4>
          </div>
          <form className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Tên tài khoản</Label>
                  <Input
                    type="text"
                    value={accName}
                    onChange={(e) => setAccName(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModalEdit}>
                Hủy
              </Button>
              <Button size="sm" onClick={handleSave}>
                Lưu
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}