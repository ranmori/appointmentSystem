// src/components/SearchInput.jsx

import React, { useState } from "react";
import { FiSearch } from "react-icons/fi"; // Ensure FiSearch is imported from react-icons/fi

/**
 * Reusable Search Input Component with Live Search functionality.
 *
 * This component provides a styled search input field with an icon.
 * The `onSearch` callback is triggered immediately as the user types.
 *
 * Props:
 * - onSearch (function): A callback function that receives the current search term on every input change.
 * - placeholder (string): The placeholder text for the input field.
 */
export default function SearchInput({ onSearch, placeholder = "Search..." }) {
  const [searchInput, setSearchInput] = useState("");

  /**
   * Handles the input field's change event for live search.
   * Updates local state and immediately calls the onSearch prop with the new value.
   * @param {Event} e - The input change event.
   */
  const handleChange = (e) => {
    const newSearchTerm = e.target.value;
    setSearchInput(newSearchTerm); // Update local state
    if (onSearch) {
      onSearch(newSearchTerm); // Call the provided callback for live search
    }
  };

  return (
    // Outer div for applying margin/spacing below the search bar, making it easier to integrate into layouts.
    // The search input and icon are positioned relative to this container.
    <div className=" relative w-full"> {/* Added relative and w-full here */}
      {/* Search icon positioned absolutely within the container */}
      <FiSearch 
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" 
        aria-label="Search icon" // Accessibility: Describes the icon
      />
      {/* The actual input field */}
      <input
        type="text"
        value={searchInput}
        placeholder={placeholder}
        onChange={handleChange} // Call handleChange on every input change
        className="text-gray-800 w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 bg-white shadow-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
        aria-label={placeholder} // Accessibility: Provides a label for screen readers
      />
    </div>
  );
}
