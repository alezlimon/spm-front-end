import { useEffect, useState } from 'react'
import './App.css'
import RoomCard from './components/RoomCard'

function App() {
  const [rooms, setRooms] = useState([])
  const [filter, setFilter] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetch('http://localhost:5005/api/rooms')
      .then((res) => res.json())
      .then((data) => setRooms(data))
      .catch((err) => console.error(err))
  }, [])

  const getStatusClass = (status) => {
    if (status === 'Available') return 'status-available'
    if (status === 'Occupied') return 'status-occupied'
    if (status === 'Maintenance') return 'status-maintenance'
    if (status === 'Dirty') return 'status-dirty'
    return ''
  }

  const updateRoomStatus = (roomId, newStatus) => {
    fetch(`http://localhost:5005/api/rooms/${roomId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((res) => res.json())
      .then((updatedRoom) => {
        setRooms((prevRooms) =>
          prevRooms.map((room) =>
            room._id === updatedRoom._id ? updatedRoom : room
          )
        )
      })
      .catch((err) => console.error(err))
  }

  const totalRooms = rooms.length
  const availableRooms = rooms.filter((r) => r.status === 'Available').length
  const occupiedRooms = rooms.filter((r) => r.status === 'Occupied').length
  const dirtyRooms = rooms.filter((r) => r.status === 'Dirty').length
  const maintenanceRooms = rooms.filter((r) => r.status === 'Maintenance').length

  const occupancyRate =
    totalRooms === 0 ? 0 : Math.round((occupiedRooms / totalRooms) * 100)

  const getPriorityAlert = () => {
    if (dirtyRooms >= 2) {
      return 'Priority alert: multiple rooms need cleaning.'
    }

    if (maintenanceRooms >= 1) {
      return 'Attention: at least one room is under maintenance.'
    }

    if (occupancyRate >= 80) {
      return 'High occupancy detected. Room turnover should stay efficient.'
    }

    return 'Operations are stable right now.'
  }

  const generateSummary = () => {
    if (rooms.length === 0) return ''

    return `Occupancy is at ${occupancyRate}%. You have ${availableRooms} available, ${occupiedRooms} occupied, ${dirtyRooms} dirty, and ${maintenanceRooms} in maintenance.`
  }

  const getAssistantClass = () => {
    if (dirtyRooms >= 2) return 'assistant alert-high'
    if (occupancyRate >= 80) return 'assistant alert-medium'
    return 'assistant alert-low'
  }

  const getCleaningSuggestion = () => {
    const dirtyRoomList = rooms.filter((room) => room.status === 'Dirty')

    if (dirtyRoomList.length === 0) {
      return 'No cleaning suggestion right now.'
    }

    return `Suggested action: clean Room ${dirtyRoomList[0].roomNumber} first.`
  }

  const filteredRooms = rooms
    .filter((room) => {
      if (filter === 'All') return true
      return room.status === filter
    })
    .filter((room) => {
      const searchValue = searchTerm.toLowerCase()

      return (
        room.roomNumber.toLowerCase().includes(searchValue) ||
        room.type.toLowerCase().includes(searchValue) ||
        room.status.toLowerCase().includes(searchValue)
      )
    })

  return (
    <div className="app">
      <header className="header">
        <h1>Hotel CRM</h1>
        <p>Mobile-first room operations dashboard</p>
      </header>

      <div className={getAssistantClass()}>
        <h3>Operations Assistant</h3>
        <p>{generateSummary()}</p>
        <p className="assistant-alert">{getPriorityAlert()}</p>
        <p className="assistant-suggestion">{getCleaningSuggestion()}</p>
      </div>

      <section className="summary-grid">
        <div className="summary-card" onClick={() => setFilter('All')}>
          <h3>Total Rooms</h3>
          <p>{totalRooms}</p>
        </div>

        <div className="summary-card" onClick={() => setFilter('Available')}>
          <h3>Available</h3>
          <p>{availableRooms}</p>
        </div>

        <div className="summary-card" onClick={() => setFilter('Occupied')}>
          <h3>Occupied</h3>
          <p>{occupiedRooms}</p>
        </div>

        <div className="summary-card" onClick={() => setFilter('Dirty')}>
          <h3>Dirty</h3>
          <p>{dirtyRooms}</p>
        </div>
      </section>

      <div className="filter-bar">
        <button onClick={() => setFilter('All')}>All</button>
        <button onClick={() => setFilter('Available')}>Available</button>
        <button onClick={() => setFilter('Occupied')}>Occupied</button>
        <button onClick={() => setFilter('Dirty')}>Dirty</button>
        <button onClick={() => setFilter('Maintenance')}>Maintenance</button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by room number, type, or status"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <section>
        <h2>Rooms</h2>

        {filteredRooms.length === 0 ? (
          <p>No rooms found</p>
        ) : (
          <div className="rooms-grid">
            {filteredRooms.map((room) => (
              <RoomCard
                key={room._id}
                room={room}
                getStatusClass={getStatusClass}
                updateRoomStatus={updateRoomStatus}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default App