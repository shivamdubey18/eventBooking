export default function SeatGrid({ seats, selected, onToggle, disabled }) {
  // Group seats by row letter
  const rows = seats.reduce((acc, seat) => {
    const row = seat.seatNumber[0];
    if (!acc[row]) acc[row] = [];
    acc[row].push(seat);
    return acc;
  }, {});

  return (
    <div className="seat-section">
      <div className="stage-label">STAGE</div>
      <div className="stage-bar" />

      <div className="seat-grid">
        {Object.entries(rows).map(([row, rowSeats]) => (
          <div key={row} className="seat-row">
            <span className="row-label">{row}</span>
            <div className="row-seats">
              {rowSeats.map(seat => {
                const isSelected = selected.includes(seat.seatNumber);
                const unavailable = seat.status !== 'available';
                return (
                  <button
                    key={seat.seatNumber}
                    className={`seat ${seat.status} ${isSelected ? 'selected' : ''}`}
                    onClick={() => !unavailable && !disabled && onToggle(seat.seatNumber)}
                    disabled={unavailable || disabled}
                    title={`${seat.seatNumber} — ${seat.status}`}
                    aria-label={`Seat ${seat.seatNumber}, ${seat.status}${isSelected ? ', selected' : ''}`}
                  >
                    {seat.seatNumber.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="seat-legend">
        <span className="legend-item"><span className="legend-dot available" />Available</span>
        <span className="legend-item"><span className="legend-dot selected" />Selected</span>
        <span className="legend-item"><span className="legend-dot reserved" />On hold</span>
        <span className="legend-item"><span className="legend-dot booked" />Booked</span>
      </div>
    </div>
  );
}
