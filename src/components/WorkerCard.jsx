<<<<<<< HEAD
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
=======
import React from 'react';

export default function WorkerCard({ worker, onRemove, children }) {
  return (
    // Removed style={cursor: pointer} here because the Dashboard wrapper handles the click
    <div className="card worker-card__container">
      <div className="worker-card__header">
        <h4 className="worker-card__name">{worker.profile?.name || worker.name}</h4>
        
        {worker.status === "approved" && (
          <span className="worker-card__approved-badge">✓ Approved</span>
        )}
      </div>

      <p className="worker-card__description">{worker.profile?.description || "No description provided."}</p>

      {children}

      {onRemove && (
        <button
          className="remove-btn worker-card__remove-action"
          style={{ marginTop: "12px" }}
          onClick={(e) => {
            e.stopPropagation(); // VERY IMPORTANT: prevents opening the modal
            onRemove();
          }}
        >
          Remove Worker
>>>>>>> 8d2cd8c (final 1/5)
        </button>
      )}
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 8d2cd8c (final 1/5)
