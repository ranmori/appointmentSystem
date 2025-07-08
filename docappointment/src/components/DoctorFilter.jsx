import React, { useState, useEffect } from "react";
import SearchInput from "./SearchInput.jsx"; // Import the SearchInput component

/**
 * DoctorFilter Component
 *
 * This component provides UI for filtering doctors, including a search bar
 * and potentially other filter options (like specialization).
 * It communicates changes in filter criteria to its parent component.
 *
 * Props:
 * - onFilterChange (function): Callback function that receives an object
 * containing the current filter criteria (e.g., { searchTerm: '...', specialization: '...' }).
 * - initialSearchTerm (string): Optional initial search term for the input.
 */
export default function DoctorFilter({
  onFilterChange,
  initialSearchTerm = "",
}) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  // You can add more filter states here, e.g.:
  // const [selectedSpecialization, setSelectedSpecialization] = useState('');

  // Use useEffect to debounce the filter change or just trigger it immediately
  // For live search, we trigger immediately from SearchInput
  useEffect(() => {
    // This useEffect ensures that when the searchTerm changes (from user typing),
    // the parent component's onFilterChange is called with the latest criteria.
    const filterCriteria = {
      searchTerm: searchTerm,
      // specialization: selectedSpecialization, // Add if you implement specialization filter
    };
    onFilterChange(filterCriteria);
  }, [searchTerm, onFilterChange]); // Add other filter states here if they exist

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Find Your Doctor
      </h3>

      {/* Search by Name or Specialization */}
      <SearchInput
        onSearch={setSearchTerm} // SearchInput's onSearch now directly updates our internal searchTerm
        placeholder="Search by name or specialization..."
      />

      {/* Example: Future Specialization Filter (currently commented out) */}
      {/* <div className="mt-4">
        <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">
          Filter by Specialization:
        </label>
        <select
          id="specialization"
          name="specialization"
          value={selectedSpecialization}
          onChange={(e) => setSelectedSpecialization(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
        >
          <option value="">All Specializations</option>
          <option value="Pediatrics">Pediatrics</option>
          <option value="Dermatology">Dermatology</option>
          <option value="Cardiology">Cardiology</option>
           Add more options as needed 
        </select>
      </div>
      */}
    </div>
  );
}
