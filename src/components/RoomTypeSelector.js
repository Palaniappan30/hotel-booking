import React, { useState } from 'react';
import { Form } from 'react-bootstrap';

const RoomTypeSelector = ({ onSelectRoomType }) => {
  const [selectedRoomType, setSelectedRoomType] = useState('');

  const handleSelectRoomType = (e) => {
    const value = e.target.value;
    setSelectedRoomType(value);
    onSelectRoomType(value);
  };

  return (
    <Form.Group controlId="formRoomType">
      <Form.Label>Room Type:</Form.Label>
      <Form.Control as="select" value={selectedRoomType} onChange={handleSelectRoomType} required>
        <option value="">Select Room Type</option>
        <option value="A">Room Type A</option>
        <option value="B">Room Type B</option>
        <option value="C">Room Type C</option>
      </Form.Control>
    </Form.Group>
  );
};

export default RoomTypeSelector;