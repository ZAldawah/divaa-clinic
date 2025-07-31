const Page = () => {
    return     <main>
      <div className="subhero">
        <div className="subhero-hook1">
          <div className="subhero-hook1-text">
            <h1>RADIOFREQUENCY FACIAL</h1>
            <a
              href="sms:8329929422?&body=Hi%20I%27m%20interested%20in%20radiofrequency%20facial%20services%20at%20Divaa"
              className="contact-button"
            >
              CONSULT NOW: (832) 992-9422
            </a>
            <p>
              Lift, firm, and smooth your skin with non-invasive radiofrequency
              energy that boosts collagen and improves tone — no needles or
              downtime required.
            </p>
          </div>
          <div className="subhero-hook1-logo">
            <img
              src="pictures/rrf.png"
              alt="Client receiving radiofrequency facial at Divaa Beauty"
            />
          </div>
        </div>
    </div>

      <div className="treatment-information">
        <div className="treatment-introduction">
          <div className="treatment-introduction-text">
            <h3>What is a Radiofrequency Facial?</h3>
            <p>
              Radiofrequency (RF) facial treatment uses energy waves to heat the
              deeper layers of your skin, stimulating collagen and elastin
              production. It's a gentle, non-invasive solution for lifting and
              tightening without needles, fillers, or surgery.
            </p>
          </div>
        </div>

        <div className="treatment-function">
          <div className="treatment-function-text">
            <h3>What can RRF help with?</h3>
            <ul>
              <li>Loose or sagging skin on the face or neck</li>
              <li>Fine lines and early wrinkles</li>
              <li>Jawline and cheek contouring</li>
              <li>Improved skin elasticity and texture</li>
              <li>Boost in collagen and firmness over time</li>
            </ul>
          </div>
        </div>

        <div className="treatment-faq">
          <details>
            <summary>Does a radiofrequency facial hurt?</summary>
            <p>
              Not at all — the treatment feels like a warm massage. Most clients
              find it relaxing, and there's no downtime afterward.
            </p>
          </details>
          <details>
            <summary>How many sessions do I need?</summary>
            <p>
              Most clients benefit from a series of 3-6 sessions for optimal
              results, spaced a few weeks apart. Maintenance treatments can
              prolong the effects.
            </p>
          </details>
        </div>
    </div>
    </main>
}

export default Page;