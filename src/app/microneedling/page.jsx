const Page = () => {
    return     <main>
      <div className="subhero">
        <div className="subhero-hook1">
          <div className="subhero-hook1-text">
            <h1>MICRONEEDLING</h1>
            <a
              href="sms:8329929422?&body=Hi%20I%27m%20interested%20in%20Microneedling%20at%20Divaa"
              className="contact-button"
            >
              CONSULT NOW: (832) 992-9422
            </a>
            <p>
              Smooth, refine, and renew your skin with professional
              microneedling — a powerful treatment that stimulates collagen and
              enhances your natural glow.
            </p>
          </div>
          <div className="subhero-hook1-logo">
            <img
              src="pictures/microneedling-image1.JPG"
              alt="Microneedling session at Divaa Beauty"
            />
          </div>
        </div>
    </div>

      <div className="treatment-information">
        <div className="treatment-introduction">
          <div className="treatment-introduction-text">
            <h3>What is Microneedling?</h3>
            <p>
              Microneedling, also known as collagen induction therapy, uses
              ultra-fine needles to create controlled micro-injuries in the
              skin. This triggers a natural healing response — boosting
              collagen, improving tone, minimizing texture, and revealing
              fresher, firmer skin with minimal downtime.
            </p>
          </div>
        </div>

        <div className="treatment-function">
          <div className="treatment-function-text">
            <h3>What can Microneedling help with?</h3>
            <ul>
              <li>Acne scars and pitted skin</li>
              <li>Fine lines and early wrinkles</li>
              <li>Large pores and uneven texture</li>
              <li>Stretch marks and discoloration</li>
              <li>Dull skin in need of a collagen boost</li>
            </ul>
          </div>
        </div>

        <div className="treatment-faq">
          <details>
            <summary>Does microneedling hurt?</summary>
            <p>
              We apply numbing cream before treatment to ensure comfort. Most
              clients feel only mild pressure or scratching sensations during
              the session.
            </p>
          </details>
          <details>
            <summary>How long before I see results?</summary>
            <p>
              Skin appears brighter and smoother within 1 week. Deeper results,
              like reduced scars and firming, continue to develop over 4-6 weeks
              as collagen rebuilds.
            </p>
          </details>
        </div>
    </div>
    </main>
}

export default Page;