import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';

const RoomNumberSelector = ({ roomType, onSelectRoomNumber }) => {
  const [roomNumbers, setRoomNumbers] = useState([]);

  useEffect(() => {
    // Fetch room numbers based on the selected room type (you can replace this with actual API call)
    const fetchRoomNumbers = async () => {
      // Simulating fetching room numbers from the server based on roomType
      const fetchedRoomNumbers = Array.from({ length: getRoomCount(roomType) }, (_, index) => index + 1);
      setRoomNumbers(fetchedRoomNumbers);
    };

    fetchRoomNumbers();
  }, [roomType]);

  const getRoomCount = (type) => {
    // Replace this with the actual count from your data
    const roomCountMap = {
      A: 2,
      B: 3,
      C: 5,
    };
    return roomCountMap[type] || 0;
  };

  return (
    <Form.Group controlId="formRoomNumber">
      <Form.Label>Room Number:</Form.Label>
      <Form.Control as="select" onChange={(e) => onSelectRoomNumber(Number(e.target.value))} required>
        <option value="">Select Room Number</option>
        {roomNumbers.map((roomNumber) => (
          <option key={roomNumber} value={roomNumber}>
            {roomNumber}
          </option>
        ))}
      </Form.Control>
    </Form.Group>
  );
};

export default RoomNumberSelector;
