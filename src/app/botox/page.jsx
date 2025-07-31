const Page = () => {
    return     <main>
      <div className="subhero">
        <div className="subhero-hook1">
          <div className="subhero-hook1-text">
            <h1>BOTOX & DYSPORT</h1>
            <a
              href="sms:8329929422?&body=Hi%20I%27m%20interested%20in%20Botox%20services%20at%20Divaa"
              className="contact-button"
            >
              CONSULT NOW: (832) 992-9422
            </a>
            <p>
              Diminish fine lines and wrinkles with expertly placed neurotoxin
              injections that relax facial muscles while preserving your natural
              expression.
            </p>
          </div>
          <div className="subhero-hook1-logo">
            <img
              src="pictures/botox-image1.JPG"
              alt="Client receiving Botox at Divaa Beauty"
            />
          </div>
        </div>
    </div>

      <div className="treatment-information">
        <div className="treatment-introduction">
          <div className="treatment-introduction-text">
            <h3>What are Botox and Dysport treatments?</h3>
            <p>
              Botox and Dysport are FDA-approved injectables used to soften the
              appearance of lines caused by repetitive movement — such as
              forehead lines, crow's feet, and frown lines. These treatments are
              ideal for anyone looking to refresh their look without losing
              natural expressiveness.
            </p>
          </div>
        </div>

        <div className="treatment-function">
          <div className="treatment-function-text">
            <h3>What do Botox and Dysport treat?</h3>
            <ul>
              <li>Forehead creases</li>
              <li>Glabella lines (11's)</li>
              <li>Crow's feet</li>
              <li>Jaw tension from overactive masseter muscles</li>
              <li>Customized based on facial structure and aesthetic goals</li>
            </ul>
          </div>
        </div>

        <div className="treatment-faq">
          <details>
            <summary>Are Botox and Dysport injections painful?</summary>
            <p>
              Most clients describe Botox injections as a quick pinch. If you're
              sensitive, we can apply numbing cream to keep you comfortable.
            </p>
          </details>
          <details>
            <summary>How long do Botox and Dysport last?</summary>
            <p>
              Results typically last 3-4 months. With consistent treatments,
              results may last longer over time.
            </p>
          </details>
        </div>
    </div>
    </main>
};

export default Page;