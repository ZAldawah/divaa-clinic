const Page = () => {
    return <main>
      <section class="subhero">
        <div class="subhero-hook1">
          <div class="subhero-hook1-text">
            <h1>HYDROFACIAL</h1>
            <a
              href="sms:8329929422?&body=Hi%20I%27m%20interested%20in%20a%20Hydrofacial%20at%20Divaa"
              class="contact-button"
            >
              CONSULT NOW: (832) 992-9422
            </a>
            <p>
              Reveal clearer, healthier, radiant skin with our signature
              Hydrofacial — a deep-cleansing, hydrating treatment that leaves
              you instantly glowing.
            </p>
          </div>
          <div class="subhero-hook1-logo">
            <img
              src="pictures/hydrofacial.png"
              alt="Client receiving Hydrofacial at Divaa Beauty"
            />
          </div>
        </div>
      </section>

      <section class="treatment-information">
        <div class="treatment-introduction">
          <div class="treatment-introduction-text">
            <h3>What is a Hydrofacial?</h3>
            <p>
              A Hydrofacial is a multi-step facial treatment that combines
              gentle exfoliation, painless extraction, deep pore cleansing, and
              intense hydration using vortex fusion technology. At Divaa, we
              pair our Hydrofacial with high-grade serums customized to your
              skin's needs — perfect for all skin types and no downtime.
            </p>
          </div>
        </div>

        <div class="treatment-function">
          <div class="treatment-function-text">
            <h3>What can a Hydrofacial help with?</h3>
            <ul>
              <li>Clogged or enlarged pores</li>
              <li>Oily or congested skin</li>
              <li>Dehydration and dullness</li>
              <li>Uneven texture or tone</li>
              <li>Fine lines and mild pigmentation</li>
            </ul>
          </div>
        </div>

        <div class="treatment-faq">
          <details>
            <summary>Is there any downtime with a Hydrofacial?</summary>
            <p>
              None at all — you'll leave with a healthy glow. It's a perfect
              “glow-up” treatment before events, travel, or just routine skin
              maintenance.
            </p>
          </details>
          <details>
            <summary>How often should I get a Hydrofacial?</summary>
            <p>
              Most clients benefit from monthly treatments to maintain skin
              clarity, hydration, and glow. It's safe and effective to repeat
              regularly.
            </p>
          </details>
        </div>
      </section>
    </main>

}

export default Page;