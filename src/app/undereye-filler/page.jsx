const Page = () => {
    return     <main>
      <section class="subhero">
        <div class="subhero-hook1">
          <div class="subhero-hook1-text">
            <h1>UNDER-EYE FILLER</h1>
            <a
              href="sms:8329929422?&body=Hi%20I%27m%20interested%20in%20under-eye%20filler%20services%20at%20Divaa"
              class="contact-button"
            >
              CONSULT NOW: (832) 992-9422
            </a>
            <p>
              Brighten and refresh tired eyes by reducing dark circles and
              hollow tear troughs with precise, subtle filler placement.
            </p>
          </div>
          <div class="subhero-hook1-logo">
            <img
              src="pictures/undereye-filler.JPG"
              alt="Client receiving under-eye filler at Divaa Beauty"
            />
          </div>
        </div>
      </section>

      <section class="treatment-information">
        <div class="treatment-introduction">
          <div class="treatment-introduction-text">
            <h3>What is Under-Eye Filler?</h3>
            <p>
              Under-eye filler, also known as tear trough filler, is a
              hyaluronic acid-based injectable used to treat hollowing, shadows,
              and dark circles beneath the eyes. At Divaa Beauty Clinic, we use
              advanced cannula techniques to gently restore volume and achieve a
              smoother, more rested appearance.
            </p>
          </div>
        </div>

        <div class="treatment-function">
          <div class="treatment-function-text">
            <h3>What can Under-Eye Filler help with?</h3>
            <ul>
              <li>Hollow or sunken tear troughs</li>
              <li>Dark circles due to volume loss</li>
              <li>Fatigue or aged appearance</li>
              <li>Smoother transition from lower eyelid to cheek</li>
              <li>Non-surgical eye rejuvenation</li>
            </ul>
          </div>
        </div>

        <div class="treatment-faq">
          <details>
            <summary>Is under-eye filler safe?</summary>
            <p>
              Yes — when performed by experienced providers using proper
              technique and product selection. We use cannulas to reduce
              bruising and improve safety.
            </p>
          </details>
          <details>
            <summary>How long does it last?</summary>
            <p>
              Results typically last 9-12 months, though some clients may see
              longer-lasting results in this area due to low movement.
            </p>
          </details>
        </div>
      </section>
    </main>
}

export default Page;