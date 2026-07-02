"use client";

import AdminPanel from "../../components/AdminPanel";
import { useAdminMessages } from "../hooks/useAdminMessages";
import MessageDetails from "./MessageDetails";
import MessagesTable from "./MessagesTable";

export default function AdminMessagesScreen() {
  const {
    messages,
    selectedMessage,
    selectedMessageId,
    isReplyBoxOpen,
    replyText,
    statusError,
    loadError,
    isLoading,
    refetchMessages,
    setReplyText,
    selectMessage,
    toggleMessageStatus,
    openReplyBox,
    closeReplyBox,
    submitReply,
  } = useAdminMessages();

  return (
    <AdminPanel
      className="relative"
      contentClassName="relative flex h-full flex-col px-3 py-4 sm:px-5 sm:py-5"
    >
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={refetchMessages}
            className="rounded-full bg-[#FFF1EA] px-4 py-2 text-xs font-bold text-[#FF6A21] transition hover:bg-[#FFE3D4]"
          >
            بروزرسانی
          </button>

          {isLoading && (
            <span className="text-xs font-medium text-gray-500">
              در حال دریافت پیام‌های پشتیبانی...
            </span>
          )}
        </div>

        {loadError && (
          <div className="rounded-lg bg-red-50 px-4 py-2 text-center text-xs font-medium text-red-500">
            {loadError}
          </div>
        )}

        <MessagesTable
          messages={messages}
          selectedMessageId={selectedMessageId}
          statusError={statusError}
          onSelectMessage={selectMessage}
          onToggleStatus={toggleMessageStatus}
        />

        {selectedMessage && (
          <MessageDetails
            message={selectedMessage}
            isReplyBoxOpen={isReplyBoxOpen}
            replyText={replyText}
            onReplyTextChange={setReplyText}
            onOpenReplyBox={openReplyBox}
            onCloseReplyBox={closeReplyBox}
            onSubmitReply={submitReply}
          />
        )}
      </div>
    </AdminPanel>
  );
}
