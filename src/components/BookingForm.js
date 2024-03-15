// BookingForm.js
import React, { useState } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import RoomTypeSelector from './RoomTypeSelector';
import RoomNumberSelector from './RoomNumberSelector';
import DateTimePicker from './DateTimePicker';
import './styles.css'; // Import the styles

const BookingForm = () => {
  const [userEmail, setUserEmail] = useState('');
  const [roomType, setRoomType] = useState('');
  const [roomNumber, setRoomNumber] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: userEmail,
          room_type: roomType,
          room_number: roomNumber,
          start_time: startTime,
          end_time: endTime,
        }),
      });

      if (response.ok) {
        console.log('Booking successful');
        window.location.reload(); // Refresh the page
      } else {
        const errorData = await response.json();
        console.error('Booking failed:', errorData.error);
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  return (
    <div className="outer-white-box"> {/* Apply the outer-white-box class here */}
      <Container className="center-content">
        <div className="booking-form">
          <h2 className="form-heading">Book a Room</h2>

          <Form className="text-left" onSubmit={handleSubmit}>
            <Form.Group controlId="formUserEmail" className="form-control">
              <Form.Label>Email:</Form.Label>
              <Form.Control type="email" placeholder="Enter your email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} required />
            </Form.Group>

            <RoomTypeSelector onSelectRoomType={(selectedRoomType) => setRoomType(selectedRoomType)} />

            {roomType && (
              <>
                <RoomNumberSelector roomType={roomType} onSelectRoomNumber={(selectedRoomNumber) => setRoomNumber(selectedRoomNumber)} />
                <Row>
                  <Col>
                    <DateTimePicker label="Start Time:" selectedDate={startTime} onSelectDate={(selectedDate) => setStartTime(selectedDate)} />
                  </Col>
                  <Col>
                    <DateTimePicker label="End Time:" selectedDate={endTime} onSelectDate={(selectedDate) => setEndTime(selectedDate)} />
                  </Col>
                </Row>
              </>
            )}

            <Button variant="primary" type="submit" className="submit-button">
              Book Room
            </Button>
          </Form>
        </div>
      </Container>
    </div>
  );
};

export default BookingForm;
