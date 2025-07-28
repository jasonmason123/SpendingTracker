import { Transaction } from "../../types";

interface TransactionAttachmentCardProps {
  transaction: Transaction
}

export default function TransactionAttachmentCard({ transaction }: TransactionAttachmentCardProps) {
  const { attachmentUrl } = transaction;
  
  // Determine file type
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(attachmentUrl || "");
  const isPDF = /\.pdf$/i.test(attachmentUrl || "");

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-6">
            Tệp đính kèm
          </h4>

          {attachmentUrl ? (
            <div className="rounded-xl overflow-hidden">
              {isImage && (
                <img
                  src={attachmentUrl}
                  alt="Attachment"
                  className="max-w-full h-auto rounded-md border"
                />
              )}

              {isPDF && (
                <iframe
                  src={attachmentUrl}
                  title="PDF Attachment"
                  className="w-full h-96 rounded-md border"
                />
              )}

              {!isImage && !isPDF && (
                <a
                  href={attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Xem tệp đính kèm
                </a>
              )}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Không có tệp đính kèm</p>
          )}
        </div>
      </div>
    </div>
  );
}