from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

app = Flask(__name__)
CORS(app, resources={r"/bookings": {"origins": "http://localhost:3000"}}, supports_credentials=True, methods=["GET", "POST", "PUT", "DELETE"], headers=["Content-Type", "Authorization"])
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
db = SQLAlchemy(app)

class RoomBooking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    room_type = db.Column(db.String(50), nullable=False)
    room_number = db.Column(db.Integer, nullable=False)
    user_email = db.Column(db.String(120), nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)

# Create the database tables
with app.app_context():
    db.create_all()

# Allow preflight requests
@app.route('/bookings', methods=['OPTIONS'])
def handle_preflight():
    response = jsonify()
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response

# Create booking
@app.route('/bookings', methods=['POST'])
def create_booking():
    data = request.json
    room_number = data.get('room_number')
    start_time = datetime.strptime(data.get('start_time'), '%Y-%m-%dT%H:%M:%S.%fZ')
    end_time = datetime.strptime(data.get('end_time'), '%Y-%m-%dT%H:%M:%S.%fZ')

    if not is_time_slot_available(room_number, start_time, end_time):
        return jsonify({'error': 'Time slot is not available for the selected room.'}), 400

    new_booking = RoomBooking(
        room_type=data.get('room_type'),
        room_number=room_number,
        user_email=data.get('user_email'),
        start_time=start_time,
        end_time=end_time
    )

    db.session.add(new_booking)
    db.session.commit()

    # Send confirmation email
    send_confirmation_email(new_booking.user_email)

    return jsonify({'message': 'Booking created successfully.'}), 201

# Utility function to send confirmation email
def send_confirmation_email(user_email):
    sender_email = 'scalerbooking@gmail.com'
    sender_password = 'Palani!@34'

    message = MIMEMultipart()
    message['From'] = sender_email
    message['To'] = user_email
    message['Subject'] = 'Booking Confirmation'
    body = 'Your booking has been confirmed.'
    message.attach(MIMEText(body, 'plain'))

    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, user_email, message.as_string())
            print('Email sent successfully')
    except Exception as e:
        print('An error occurred while sending the email:', str(e))

# Get all bookings
@app.route('/bookings', methods=['GET'])
def get_bookings():
    bookings = RoomBooking.query.all()
    booking_list = []

    for booking in bookings:
        booking_list.append({
            'id': booking.id,
            'room_type': booking.room_type,
            'room_number': booking.room_number,
            'user_email': booking.user_email,
            'start_time': booking.start_time.strftime('%Y-%m-%dT%H:%M:%S.%fZ'),
            'end_time': booking.end_time.strftime('%Y-%m-%dT%H:%M:%S.%fZ')
        })

    return jsonify({'bookings': booking_list})

# Delete a booking
@app.route('/bookings/<int:booking_id>', methods=['DELETE'])
def delete_booking(booking_id):
    booking = RoomBooking.query.get_or_404(booking_id)
    db.session.delete(booking)
    db.session.commit()
    return jsonify({'message': 'Booking deleted successfully.'}), 200

# Update booking
@app.route('/bookings/<int:booking_id>', methods=['PUT'])
def update_booking(booking_id):
    data = request.json
    booking = RoomBooking.query.get_or_404(booking_id)

    # Update the booking attributes with the data from the request
    booking.room_type = data.get('room_type', booking.room_type)
    booking.room_number = data.get('room_number', booking.room_number)
    booking.user_email = data.get('user_email', booking.user_email)
    booking.start_time = datetime.strptime(data.get('start_time'), '%Y-%m-%dT%H:%M:%S.%fZ')
    booking.end_time = datetime.strptime(data.get('end_time'), '%Y-%m-%dT%H:%M:%S.%fZ')

    # Commit the changes to the database
    db.session.commit()

    return jsonify({'message': 'Booking updated successfully.'}), 200


# Utility function to check if a time slot is available
def is_time_slot_available(room_number, start_time, end_time):
    return not RoomBooking.query.filter(
        (RoomBooking.room_number == room_number) &
        (
            (RoomBooking.start_time <= start_time) & (start_time < RoomBooking.end_time) |
            (RoomBooking.start_time < end_time) & (end_time <= RoomBooking.end_time) |
            (start_time <= RoomBooking.start_time) & (RoomBooking.end_time <= end_time)
        )
    ).count()

if __name__ == '__main__':
    app.run(debug=True)
