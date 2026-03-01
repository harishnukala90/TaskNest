export default function JobCard({ job, onApply }) {
  return (
<<<<<<< HEAD
    <div className="card">
      <h3>{job.title}</h3>
      <p>{job.location}</p>
      <p>{job.wage}</p>
      <p>
      {job.appliedWorkers.length}/{job.requiredWorkers}</p>
      <button onClick={onApply}>Apply</button>
=======
    <div className="jc-1 card">
      <h3 className="jc-2">{job.title}</h3>
      <p className="jc-3">{job.location}</p>
      <p className="jc-4">{job.wage}</p>
      <p className="jc-5">{job.appliedWorkers.length}/{job.requiredWorkers}</p>
      <button className="apply-job jc-6" onClick={onApply}>Apply</button>
>>>>>>> 8d2cd8c (final 1/5)
    </div>
  );
}
