import React from 'react';
import { Form } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './styles.css'; // Import the CSS file

const DateTimePicker = ({ label, selectedDate, onSelectDate }) => {
  return (
    <Form.Group controlId={`form${label.replace(/\s+/g, '')}`}>
      <Form.Label>{label}</Form.Label>
      <DatePicker
        selected={selectedDate}
        onChange={(date) => onSelectDate(date)}
        showTimeSelect
        dateFormat="Pp"
        className="date-picker" // Assign className here
      />
    </Form.Group>
  );
};

export default DateTimePicker;
