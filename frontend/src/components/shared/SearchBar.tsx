import { Search } from "lucide-react";
import MainButton from "./buttons/MainButton";
import { useState } from "react";
interface SearchBarProps {
  placeholder: string;
  searchTerm: string;
  handleSearchChange: (e: string) => void;
}

const SearchBar = ({
  placeholder,
  searchTerm,
  handleSearchChange,
}: SearchBarProps) => {
  const [search, setSearch] = useState(searchTerm);

  return (
    <div className="flex flex-1 flex-col">
      <div className="relative flex">
        <div className="w-full">
          <input
            type="text"
            id="search"
            placeholder={placeholder}
            className="w-full rounded-lg rounded-r-none border border-gray-300 py-2 pr-4 pl-10 text-sm transition-shadow focus:ring-2 focus:ring-sky-50 focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search color="#99a1af" size={20} />
          </div>
        </div>

        <MainButton
          onClick={() => {
            handleSearchChange(search);
          }}
          className="!h-[38px] !w-[200px] !rounded-l-none !border-transparent"
        >
          Search
        </MainButton>
      </div>
    </div>
  );
};

export default SearchBar;
