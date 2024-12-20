interface SearchTableInputProps {
  onSearchChange: (keyword: string | undefined) => void;
  placeholder: string;
  timeout?: number;
  disabled?: boolean;
}

export default SearchTableInputProps;
