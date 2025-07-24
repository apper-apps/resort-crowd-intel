import { useState } from "react"
import ApperIcon from "@/components/ApperIcon"
import Input from "@/components/atoms/Input"
import Button from "@/components/atoms/Button"

const SearchBar = ({ onSearch, placeholder = "Search...", onClear }) => {
  const [searchTerm, setSearchTerm] = useState("")

  const handleSearch = () => {
    onSearch(searchTerm)
  }

  const handleClear = () => {
    setSearchTerm("")
    if (onClear) onClear()
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="relative flex-1">
        <ApperIcon 
          name="Search" 
          className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" 
        />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pl-10"
        />
      </div>
      <Button onClick={handleSearch} variant="primary" size="md">
        <ApperIcon name="Search" className="w-4 h-4" />
      </Button>
      {searchTerm && (
        <Button onClick={handleClear} variant="ghost" size="md">
          <ApperIcon name="X" className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}

export default SearchBar