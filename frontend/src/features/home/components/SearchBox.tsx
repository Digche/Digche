// src/features/home/components/SearchBox.tsx

"use client";

import { useState } from "react";
import SearchInput from "@/shared/components/SearchInput";

export default function SearchBox() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="w-full max-w-md px-4 sm:px-0">
      <SearchInput
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="جست و جو در غذاها..."
      />
    </div>
  );
}