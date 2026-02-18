export default function WorkerCard({ worker, onRemove }) {
  return (
    <div className="card" style={{ cursor: "pointer" }}>
      <h4>{worker.profile.name}</h4>
      <p>{worker.profile.description}</p>

      {onRemove && (
        <button
          className="remove-btn"
          onClick={(e) => {
            e.stopPropagation(); // prevents popup click
            onRemove();
          }}
        >
          Remove
        </button>
      )}
    </div>
  );
}
