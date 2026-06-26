"use client";

import type { FormEvent } from "react";
import { Send, X } from "lucide-react";

type MessageReplyFormProps = {
  replyText: string;
  onReplyTextChange: (value: string) => void;
  onSubmitReply: (event: FormEvent<HTMLFormElement>) => void;
  onCloseReplyBox: () => void;
};

export default function MessageReplyForm({
  replyText,
  onReplyTextChange,
  onSubmitReply,
  onCloseReplyBox,
}: MessageReplyFormProps) {
  return (
    <form
      onSubmit={onSubmitReply}
      className="mt-4 w-full max-w-[430px] rounded-md border border-[#FF6A21] bg-[#FFF9F4] p-3"
    >
      <label className="block">
        <span className="mb-2 block text-right text-xs font-medium text-gray-700">
          پاسخ شما به این پیام
        </span>

        <textarea
          dir="rtl"
          value={replyText}
          onChange={(event) => onReplyTextChange(event.target.value)}
          rows={4}
          placeholder="پاسخ خود را بنویسید..."
          className="w-full resize-none rounded-md border border-orange-100 bg-white px-3 py-2 text-right text-sm leading-7 text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-[#FF6A21]"
        />
      </label>

      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCloseReplyBox}
          className="flex h-8 items-center gap-1 rounded-md border border-gray-300 bg-white px-3 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
        >
          <X size={14} />
          انصراف
        </button>

        <button
          type="submit"
          disabled={!replyText.trim()}
          className={`flex h-8 items-center gap-1 rounded-md px-3 text-xs font-medium transition ${
            replyText.trim()
              ? "bg-[#FF6A21] text-white hover:bg-[#e85f1d]"
              : "cursor-not-allowed bg-gray-200 text-gray-400"
          }`}
        >
          <Send size={14} />
          ارسال پاسخ
        </button>
      </div>
    </form>
  );
}
