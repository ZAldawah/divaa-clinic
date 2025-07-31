const Page = () => {
    return     <main>
      <section class="subhero">
        <div class="subhero-hook1">
          <div class="subhero-hook1-text">
            <h1>LUXURY FACIALS</h1>
            <a
              href="sms:8329929422?&body=Hi%20I%27m%20interested%20in%20facials%20at%20Divaa"
              class="contact-button"
            >
              CONSULT NOW: (832) 992-9422
            </a>
            <p>
              Treat your skin to a customized luxury facial designed to deeply
              cleanse, exfoliate, and hydrate — leaving you glowing, refreshed,
              and radiant.
            </p>
          </div>
          <div class="subhero-hook1-logo">
            <img
              src="pictures/facial-image1.jpg"
              alt="Client receiving facial at Divaa Beauty"
            />
          </div>
        </div>
      </section>

      <section class="treatment-information">
        <div class="treatment-introduction">
          <div class="treatment-introduction-text">
            <h3>What is a Divaa Signature Facial?</h3>
            <p>
              At Divaa Beauty Clinic, our facials are fully customized to your
              skin's needs. Whether you're targeting acne, dryness, dullness, or
              just need a deep refresh — we combine premium skincare products
              with expert hands-on techniques to restore your skin's balance and
              vitality.
            </p>
          </div>
        </div>

        <div class="treatment-function">
          <div class="treatment-function-text">
            <h3>What can our facials help with?</h3>
            <ul>
              <li>Congested or acne-prone skin</li>
              <li>Dryness and dehydration</li>
              <li>Dull complexion and lack of radiance</li>
              <li>Uneven texture or tone</li>
              <li>Preventative skin maintenance and relaxation</li>
            </ul>
          </div>
        </div>

        <div class="treatment-faq">
          <details>
            <summary>How often should I get a facial?</summary>
            <p>
              For optimal skin health, we recommend facials every 4-6 weeks.
              Monthly treatments can help prevent buildup, breakouts, and
              maintain long-term glow.
            </p>
          </details>
          <details>
            <summary>Are your facials suitable for sensitive skin?</summary>
            <p>
              Absolutely. Each treatment is customized based on your skin type
              and sensitivity. We use gentle, medical-grade products appropriate
              for all skin tones and conditions.
            </p>
          </details>
        </div>
      </section>
    </main>
}

export default Page;