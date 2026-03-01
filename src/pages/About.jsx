import { useState, useRef } from "react";
import emailjs from "@emailjs/browser";
import "/src/styles/About.css";
import ScrollToTop from "../components/ScrollToTop";

export default function About() {
  const formRef = useRef();
  const [status, setStatus] = useState("idle");
  const [activeFaq, setActiveFaq] = useState(null);

  const sendEmail = (e) => {
    e.preventDefault();
    setStatus("sending");

    emailjs.sendForm(
      'service_ww7iytt',    // Service ID
      'template_93cekpr',   // Template ID
      formRef.current, 
      'vo2qe35nVwXeyWl4u'   // Public Key
    )
    .then(() => {
        setStatus("success");
        setTimeout(() => setStatus("idle"), 5000);
        e.target.reset();
    }, (error) => {
        alert("Failed to send: " + error.text);
        setStatus("idle");
    });
  };

  const faqs = [
    { q: "How does Instant Matching work?", a: "Our system tracks available slots in real-time. Once a limit is reached, the post automatically closes to prevent over-application." },
    { q: "Is my activity private?", a: "Your Activity History is visible only to you, providing transparency on logins and job completions." }
  ];

  return (
    <div className={`page about-page`}>
      <header className="about-header">
        <div className="header-top">
          <h1 className="fj-main-heading">About Task<span>Nest</span></h1>
        </div>
        <p className="about-subtitle">Connecting talent with opportunity in real-time.</p>
      </header>

      {/* MISSION & FEATURES */}
      <section className="about-mission card">
        <h2>Our Mission</h2>
        <p>Removing the friction of traditional job boards to empower communities.</p>
      </section>

      <div className="about-grid">
        <div className="card about-feature-card">
          <span className="material-icons">bolt</span>
          <h3>Instant Matching</h3>
          <p>Real-time slot tracking ensures efficiency.</p>
        </div>
        <div className="card about-feature-card">
          <span className="material-icons">verified_user</span>
          <h3>Verified Profiles</h3>
          <p>Building trust within our ecosystem.</p>
        </div>
        <div className="card about-feature-card">
          <span className="material-icons">devices</span>
          <h3>Adaptive Design</h3>
          <p>Manage workflow from any device.</p>
        </div>
      </div>

      {/* FAQ SECTION */}
      <section className="about-faq card">
        <h2>Common Questions</h2>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className={`faq-item ${activeFaq === index ? 'active' : ''}`} onClick={() => setActiveFaq(activeFaq === index ? null : index)}>
              <div className="faq-question">
                {faq.q} <span className="material-icons">{activeFaq === index ? 'expand_less' : 'expand_more'}</span>
              </div>
              {activeFaq === index && <div className="faq-answer">{faq.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* TRANSPARENCY */}
      <section className="about-transparency card">
        <h2>Platform Transparency</h2>
        <p>With <strong>Activity History</strong>, track every login and job completion.</p>
        <ul className="transparency-list">
          <li><span className="material-icons">history</span> Session Monitoring</li>
          <li><span className="material-icons">task_alt</span> Job Completion Logs</li>
        </ul>
      </section>

      {/* CONTACT */}
      <section className="about-contact card">
        <h2>Contact Us</h2>
        {status === "success" ? (
          <div className="success-container">
            <div className="success-pulse"><span className="material-icons">check_circle</span></div>
            <p>Message sent successfully!</p>
          </div>
        ) : (
          <form ref={formRef} onSubmit={sendEmail} className="contact-form">
            <input type="text" name="name" placeholder="Your Name" required />
            <input type="email" name="email" placeholder="Contact Email" required />
            <textarea name="message" placeholder="Your Message" required />
            <button type="submit" className="contact-send-btn" disabled={status === "sending"}>
              {status === "sending" ? "Sending..." : "Send Message"}
            </button>
          </form>
        )}
      </section>

      <ScrollToTop />
    </div>
  );
}