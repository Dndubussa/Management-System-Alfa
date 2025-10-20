import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

interface SurgeryTypeSelectorProps {
  value: string;
  onChange: (surgeryType: string, cost: number) => void;
  placeholder?: string;
}

export function SurgeryTypeSelector({ value, onChange, placeholder = 'Search and select surgery type...' }: SurgeryTypeSelectorProps) {
  const { servicePrices } = useHospital();
  const [searchTerm, setSearchTerm] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter surgery-related services from service prices
  const surgeryServices = servicePrices.filter(service => 
    service.category === 'procedure'
  );

  // Filter services based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = surgeryServices.filter(service =>
        service.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredServices(filtered);
    } else {
      setFilteredServices(surgeryServices);
    }
  }, [searchTerm, servicePrices]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (service: any) => {
    setSearchTerm(service.serviceName);
    onChange(service.serviceName, service.price);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {isOpen && filteredServices.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredServices.map((service) => (
            <button
              key={service.id}
              onClick={() => handleSelect(service)}
              className="w-full text-left px-4 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 last:border-b-0"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-900">{service.serviceName}</span>
                <span className="text-sm font-semibold text-blue-600">
                  {service.price.toLocaleString()} TZS
                </span>
              </div>
              {service.description && (
                <p className="text-xs text-gray-500 mt-1">{service.description}</p>
              )}
            </button>
          ))}
        </div>
      )}

      {isOpen && searchTerm && filteredServices.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4 text-center text-gray-500">
          No surgery types found. Try a different search term.
        </div>
      )}
    </div>
  );
}

