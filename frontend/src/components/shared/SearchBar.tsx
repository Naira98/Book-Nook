import { Search } from "lucide-react";
import type { ChangeEvent } from "react";

interface SearchBarProps {
  placeholder: string;
  searchTerm: string;
  handleSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const SearchBar = ({
  placeholder,
  searchTerm,
  handleSearchChange,
}: SearchBarProps) => {
  return (
    <div className="flex flex-1 flex-col">
      <div className="relative">
        <input
          type="text"
          id="search"
          placeholder={placeholder} 
          className="w-full rounded-md border border-gray-300 py-2 pr-4 pl-10 text-sm transition-shadow focus:ring-2 focus:ring-cyan-400 focus:outline-none"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search color="#99a1af" size={20} />
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
