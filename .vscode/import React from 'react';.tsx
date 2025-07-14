import React from 'react';

interface AddItemProps {
  onViewChange: (view: string) => void;
}

const AddItem: React.FC<AddItemProps> = ({ onViewChange }) => {
  // Minimal stub for testing
  return <div>Add New Item</div>;
};

export default AddItem;
