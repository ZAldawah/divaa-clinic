const Page = () => {
    return     <main>
      <section class="subhero">
        <div class="subhero-hook1">
          <div class="subhero-hook1-text">
            <h1>RADIESSE</h1>
            <a
              href="sms:8329929422?&body=Hi%20I%27m%20interested%20in%20Radiesse%20services%20at%20Divaa"
              class="contact-button"
            >
              CONSULT NOW: (832) 992-9422
            </a>
            <p>
              Instantly restore volume while stimulating your skin's own
              collagen production with Radiesse — the biostimulatory filler that
              lifts and firms naturally over time.
            </p>
          </div>
          <div class="subhero-hook1-logo">
            <img
              src="pictures/radiesse.JPG"
              alt="Client receiving Radiesse filler at Divaa Beauty"
            />
          </div>
        </div>
      </section>

      <section class="treatment-information">
        <div class="treatment-introduction">
          <div class="treatment-introduction-text">
            <h3>What is Radiesse?</h3>
            <p>
              Radiesse is an FDA-approved injectable filler made of calcium
              hydroxylapatite microspheres. It provides immediate volume
              restoration while also stimulating your body to produce collagen
              over time — making it both a filler and a long-term rejuvenation
              treatment.
            </p>
          </div>
        </div>

        <div class="treatment-function">
          <div class="treatment-function-text">
            <h3>What can Radiesse help with?</h3>
            <ul>
              <li>Volume loss in cheeks, jawline, or lower face</li>
              <li>Skin laxity and sagging in aging areas</li>
              <li>Deep smile lines and marionette folds</li>
              <li>Jawline definition and chin enhancement</li>
              <li>Collagen stimulation for long-term firming</li>
            </ul>
          </div>
        </div>

        <div class="treatment-faq">
          <details>
            <summary>How is Radiesse different from other fillers?</summary>
            <p>
              Unlike hyaluronic acid fillers, Radiesse stimulates collagen
              production in addition to providing volume — making it ideal for
              long-term rejuvenation.
            </p>
          </details>
          <details>
            <summary>How long does Radiesse last?</summary>
            <p>
              You can expect results to last 12 to 18 months. Collagen
              production continues even after the filler itself begins to
              dissolve.
            </p>
          </details>
        </div>
      </section>
    </main>
}

export default Page;