const Page = () => {
    return     <main>
      <div className="subhero">
        <div className="subhero-hook1">
          <div className="subhero-hook1-text">
            <h1>PRP TREATMENT</h1>
            <a
              href="sms:8329929422?&body=Hi%20I%27m%20interested%20in%20PRP%20treatment%20services%20at%20Divaa"
              className="contact-button"
            >
              CONSULT NOW: (832) 992-9422
            </a>
            <p>
              Rejuvenate your skin naturally using your body's own plasma to
              stimulate collagen, restore texture, and improve tone — the
              ultimate regenerative treatment.
            </p>
          </div>
          <div className="subhero-hook1-logo">
            <img
              src="pictures/prptreatment-image1.JPG"
              alt="Client receiving PRP treatment at Divaa Beauty"
            />
          </div>
        </div>
    </div>

      <div className="treatment-information">
        <div className="treatment-introduction">
          <div className="treatment-introduction-text">
            <h3>What is PRP Treatment?</h3>
            <p>
              PRP (Platelet-Rich Plasma) treatment involves drawing a small
              amount of your blood, separating the growth factor-rich plasma,
              and reapplying it to the skin through injections or microneedling.
              It's a completely natural approach to skin rejuvenation,
              leveraging your body's own regenerative power.
            </p>
          </div>
        </div>

        <div className="treatment-function">
          <div className="treatment-function-text">
            <h3>What can PRP help with?</h3>
            <ul>
              <li>Fine lines and early wrinkles</li>
              <li>Dull or uneven skin tone</li>
              <li>Acne scars and textural irregularities</li>
              <li>Skin tightening and collagen stimulation</li>
              <li>Hair restoration in thinning areas (optional use)</li>
            </ul>
          </div>
        </div>

        <div className="treatment-faq">
          <details>
            <summary>Is PRP treatment safe?</summary>
            <p>
              Yes — PRP uses your own blood, which eliminates the risk of
              allergic reaction or rejection. It's widely considered one of the
              safest skin rejuvenation techniques available.
            </p>
          </details>
          <details>
            <summary>How long before I see results?</summary>
            <p>
              Most clients see noticeable improvements in texture and radiance
              within 2-4 weeks, with ongoing improvement as collagen continues
              to build over 1-3 months.
            </p>
          </details>
        </div>
    </div>
    </main>
}

export default Page;