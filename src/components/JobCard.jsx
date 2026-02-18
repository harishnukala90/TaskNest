export default function JobCard({ job, onApply }) {
  return (
    <div className="card">
      <h3>{job.title}</h3>
      <p>{job.location}</p>
      <p>{job.wage}</p>
      <p>
      {job.appliedWorkers.length}/{job.requiredWorkers}</p>
      <button onClick={onApply}>Apply</button>
    </div>
  );
}
