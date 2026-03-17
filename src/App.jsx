import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [bookings, setBookings] = useState([])
  const [rooms, setRooms] = useState([])

  const [guestName, setGuestName] = useState('')
  const [roomId, setRoomId] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')

  useEffect(() => {
    fetch('http://localhost:5005/api/bookings')
      .then((res) => res.json())
      .then((data) => setBookings(data))
      .catch((err) => console.error(err))

    fetch('http://localhost:5005/api/rooms')
      .then((res) => res.json())
      .then((data) => setRooms(data))
      .catch((err) => console.error(err))
  }, [])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getRoomDisplay = (booking) => {
    if (booking.room && typeof booking.room === 'object') {
      return booking.room.roomNumber
    }

    const matchingRoom = rooms.find((room) => room._id === booking.room)
    return matchingRoom ? matchingRoom.roomNumber : 'Unknown'
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const newBooking = {
      guestName,
      room: roomId,
      checkIn,
      checkOut,
    }

    fetch('http://localhost:5005/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newBooking),
    })
      .then((res) => res.json())
      .then((data) => {
        setBookings((prev) => [...prev, data])
        setGuestName('')
        setRoomId('')
        setCheckIn('')
        setCheckOut('')
      })
      .catch((err) => console.error(err))
  }

  return (
    <div>
      <h1>Hotel CRM</h1>

      <h2>Create Booking</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Guest Name"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
        />

        <select value={roomId} onChange={(e) => setRoomId(e.target.value)}>
          <option value="">Select Room</option>
          {rooms.map((room) => (
            <option key={room._id} value={room._id}>
              Room {room.roomNumber}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
        />

        <input
          type="date"
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
        />

        <button type="submit">Create Booking</button>
      </form>

      <h2>Bookings</h2>

      {bookings.length === 0 ? (
        <p>No bookings found</p>
      ) : (
        <ul>
          {bookings.map((booking) => (
            <li key={booking._id}>
              Guest: {booking.guestName} | Room: {getRoomDisplay(booking)} |
              Check-in: {formatDate(booking.checkIn)} | Check-out:{' '}
              {formatDate(booking.checkOut)}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default App