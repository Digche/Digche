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
