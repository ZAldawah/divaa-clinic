const Page = () => {
    return     <main>
      <div className="subhero">
        <div className="subhero-hook1">
          <div className="subhero-hook1-text">
            <h1>SCULPTRA</h1>
            <a
              href="sms:8329929422?&body=Hi%20I%27m%20interested%20in%20Sculptra%20services%20at%20Divaa"
              className="contact-button"
            >
              CONSULT NOW: (832) 992-9422
            </a>
            <p>
              Restore volume gradually and naturally with Sculptra — a
              biostimulatory injectable that helps your skin rebuild its own
              collagen for long-lasting results.
            </p>
          </div>
          <div className="subhero-hook1-logo">
            <img
              src="pictures/sculptra.JPG"
              alt="Client receiving Sculptra at Divaa Beauty"
            />
          </div>
        </div>
    </div>

      <div className="treatment-information">
        <div className="treatment-introduction">
          <div className="treatment-introduction-text">
            <h3>What is Sculptra?</h3>
            <p>
              Sculptra is a collagen biostimulator made from poly-L-lactic acid.
              Unlike traditional fillers, Sculptra works gradually by
              stimulating your skin's natural collagen production — restoring
              volume and improving skin structure over time. Results build
              subtly and last up to 2 years.
            </p>
          </div>
        </div>

        <div className="treatment-function">
          <div className="treatment-function-text">
            <h3>What can Sculptra help with?</h3>
            <ul>
              <li>Facial volume loss due to aging</li>
              <li>Hollow cheeks and temples</li>
              <li>Smile lines and marionette folds</li>
              <li>Skin thinning and collagen depletion</li>
              <li>Gradual, natural-looking rejuvenation</li>
            </ul>
          </div>
        </div>

        <div className="treatment-faq">
          <details>
            <summary>How is Sculptra different from dermal fillers?</summary>
            <p>
              Sculptra doesn't just fill — it stimulates your body to produce
              its own collagen. Results appear gradually and last longer, with
              no “overfilled” look.
            </p>
          </details>
          <details>
            <summary>How long do results last?</summary>
            <p>
              Results can last up to 2 years. Most clients require an initial
              series of 2-3 sessions spaced a few weeks apart to build their
              ideal result.
            </p>
          </details>
        </div>
    </div>
    </main>
}

export default Page;