// BookingView.js
import React, { useState, useEffect } from 'react';
import { Table, Button, Container, Modal, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import DateTimePicker from './DateTimePicker';
import './styles.css'; 

const BookingView = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [filters, setFilters] = useState({
    roomNumber: '',
    roomType: '',
    startTime: '',
    endTime: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: null,
    roomType: '',
    roomNumber: '',
    userEmail: '',
    startTime: '',
    endTime: '',
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/bookings');
      setBookings(response.data.bookings);
      setFilteredBookings(response.data.bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters({
      ...filters,
      [filterName]: value,
    });
  };

  const applyFilters = () => {
    let filteredResults = bookings;

    if (filters.roomNumber !== '') {
      filteredResults = filteredResults.filter((booking) => booking.room_number.toString() === filters.roomNumber);
    }

    if (filters.roomType !== '') {
      filteredResults = filteredResults.filter((booking) => booking.room_type === filters.roomType);
    }

    if (filters.startTime !== '') {
      filteredResults = filteredResults.filter((booking) => new Date(booking.start_time) >= new Date(filters.startTime));
    }

    if (filters.endTime !== '') {
      filteredResults = filteredResults.filter((booking) => new Date(booking.end_time) <= new Date(filters.endTime));
    }

    setFilteredBookings(filteredResults);
  };

  const deleteBooking = async (bookingId, startTime) => {
    const confirmation = window.confirm('Are you sure you want to delete this booking?');
    if (confirmation) {
      try {
        await axios.delete(`http://localhost:5000/bookings/${bookingId}`);
        const now = new Date();
        const bookingStartTime = new Date(startTime);
        const hoursDiff = (bookingStartTime - now) / (1000 * 60 * 60);

        let refundMessage = 'No refund available.';
        if (hoursDiff > 48) {
          refundMessage = 'Full refund available.';
        } else if (hoursDiff >= 24 && hoursDiff <= 48) {
          refundMessage = '50% refund available.';
        }

        alert(`Booking deleted successfully. ${refundMessage}`);
        fetchBookings(); // Refresh the bookings list
      } catch (error) {
        console.error('Error deleting booking:', error);
        alert('Failed to delete booking.');
      }
    }
  };

  const handleOpenModal = (booking) => {
    setEditFormData({
      id: booking.id,
      roomType: booking.room_type,
      roomNumber: booking.room_number,
      userEmail: booking.user_email,
      startTime: booking.start_time.split('.000')[0], // Remove milliseconds for correct display
      endTime: booking.end_time.split('.000')[0], // Remove milliseconds for correct display
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };
  

  const handleEditSubmit = async () => {
    try {
      // Parse the string dates into Date objects
      const startTime = new Date(editFormData.startTime);
      const endTime = new Date(editFormData.endTime);
      
      // Check if the parsed dates are valid Date objects
      if (isNaN(startTime) || isNaN(endTime)) {
        throw new Error('Invalid date format');   
      }
  
      // Format the start and end time strings to match the expected format
      const formattedStartTime = startTime.toISOString(); // Convert to ISO string
      const formattedEndTime = endTime.toISOString(); // Convert to ISO string
      
      await axios.put(`http://localhost:5000/bookings/${editFormData.id}`, {
        room_type: editFormData.roomType,
        room_number: editFormData.roomNumber,
        user_email: editFormData.userEmail,
        start_time: formattedStartTime,
        end_time: formattedEndTime,
      });
      
      const updatedBookings = bookings.map((booking) => {
        if (booking.id === editFormData.id) {
          return {
            ...booking,
            room_type: editFormData.roomType,
            room_number: editFormData.roomNumber,
            user_email: editFormData.userEmail,
            start_time: editFormData.startTime,
            end_time: editFormData.endTime,
          };
        }
        return booking;
      });

      setBookings(updatedBookings);
      setFilteredBookings(updatedBookings);

      handleCloseModal();
      alert('Booking updated successfully.');
    } catch (error) {
      console.error('Error editing booking:', error);
      alert('Failed to update booking.');
    }
  };

  useEffect(() => {
    applyFilters();
  }, [filters, bookings]);

  return (
    <Container className="center-content">
      <div className="table-container">
        <h2 className="form-heading">Booking View</h2>
        <Row className="mb-3">
          <Col>
            <Form>
              <Form.Group controlId="formRoomNumber" className="form-control">
                <Form.Label>Room Number:</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter room number"
                  value={filters.roomNumber}
                  onChange={(e) => handleFilterChange('roomNumber', e.target.value)}
                />
              </Form.Group>
            </Form>
          </Col>
          <Col>
            <Form>
              <Form.Group controlId="formRoomType" className="form-control">
                <Form.Label>Room Type:</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter room type"
                  value={filters.roomType}
                  onChange={(e) => handleFilterChange('roomType', e.target.value)}
                />
              </Form.Group>
            </Form>
          </Col>
          <Col>
            <Form>
              <Form.Group controlId="formStartTime" className="form-control">
                <Form.Label>Start Time:</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={filters.startTime}
                  onChange={(e) => handleFilterChange('startTime', e.target.value)}
                />
              </Form.Group>
            </Form>
          </Col>
          <Col>
            <Form>
              <Form.Group controlId="formEndTime" className="form-control">
                <Form.Label>End Time:</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={filters.endTime}
                  onChange={(e) => handleFilterChange('endTime', e.target.value)}
                />
              </Form.Group>
            </Form>
          </Col>
          <Col>
            <Button variant="primary" onClick={applyFilters} className="submit-button">
              Apply Filters
            </Button>
          </Col>
        </Row>
  
        <Table striped bordered hover className="custom-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Room Type</th>
              <th>Room Number</th>
              <th>User Email</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.id}</td>
                <td>{booking.room_type}</td>
                <td>{booking.room_number}</td>
                <td>{booking.user_email}</td>
                <td>{new Date(booking.start_time).toLocaleString()}</td>
                <td>{new Date(booking.end_time).toLocaleString()}</td>
                <td>
                <div className="button-container">
                <Button
                  className="edit-button"
                  variant="contained"
                  color="primary"
                  onClick={() => handleOpenModal(booking)}
                >
                  Edit
                </Button>
                <Button
                  className="cancel-button"
                  variant="contained"
                  color="secondary"
                  onClick={() => deleteBooking(booking.id, booking.start_time)}
                >
                  Cancel
                </Button>
              </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
  
        {/* Edit Booking Modal */}
        <Modal show={showModal && <div className="modal-overlay" onClick={() => setShowModal(false)}></div>} onHide={handleCloseModal}>
              
          <Modal.Header >
            <Modal.Title>Edit Booking</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="editFormRoomType">
                <Form.Label>Room Type:</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter room type"
                  name="roomType"
                  value={editFormData.roomType}
                  onChange={handleFormChange}
                />
              </Form.Group>
              <Form.Group controlId="editFormRoomNumber">
                <Form.Label>Room Number:</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter room number"
                  name="roomNumber"
                  value={editFormData.roomNumber}
                  onChange={handleFormChange}
                />
              </Form.Group>
              <Form.Group controlId="editFormUserEmail">
                <Form.Label>User Email:</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter user email"
                  name="userEmail"
                  value={editFormData.userEmail}
                  onChange={handleFormChange}
                />
              </Form.Group>
              <Form.Group controlId="editFormStartTime">
                <Form.Label>Start Time:</Form.Label>
                <DateTimePicker
                  label="Start Time"
                  selectedDate={new Date(editFormData.startTime)}
                  onSelectDate={(date) =>
                    handleFormChange({ target: { name: 'startTime', value: date.toISOString() } })
                  }
                />
              </Form.Group>
              <Form.Group controlId="editFormEndTime">
                <Form.Label>End Time:</Form.Label>
                <DateTimePicker
                    label="End Time"
                    selectedDate={new Date(editFormData.endTime)}
                    onSelectDate={(date) =>
                      handleFormChange({ target: { name: 'endTime', value: date.toISOString() } })
                    }
                  />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal} className="modal-button">Close</Button>
            
            <Button variant="primary" onClick={handleEditSubmit} className="modal-button">Save Changes</Button>
          </Modal.Footer>
        </Modal>
      </div>
    </Container>
  );
}  

export default BookingView;