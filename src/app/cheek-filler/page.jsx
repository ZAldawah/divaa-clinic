const Page = () => {
    return     <main>

      <div className="subhero">
        <div className="subhero-hook1">
          <div className="subhero-hook1-text">
            <h1>CHEEK FILLER</h1>
            <a
              href="sms:8329929422?&body=Hi%20I%27m%20interested%20in%20cheek%20filler%20services%20at%20Divaa"
              className="contact-button"
            >
              CONSULT NOW: (832) 992-9422
            </a>
            <p>
              Restore youthful definition and enhance natural bone structure
              with expertly placed cheek filler tailored to your facial
              features.
            </p>
          </div>
          <div className="subhero-hook1-logo">
            <img
              src="pictures/cheek-filler.JPG"
              alt="Client receiving cheek filler at Divaa Beauty"
            />
          </div>
        </div>
    </div>

      <div className="treatment-information">
        <div className="treatment-introduction">
          <div className="treatment-introduction-text">
            <h3>What is Cheek Filler?</h3>
            <p>
              Cheek filler is a dermal injectable used to restore mid-face
              volume loss, contour cheekbones, and lift sagging skin. At Divaa
              Beauty Clinic, our trained providers use premium fillers to
              highlight natural structure and rejuvenate facial harmony —
              without overfilling.
            </p>
          </div>
        </div>

        <div className="treatment-function">
          <div className="treatment-function-text">
            <h3>What can Cheek Filler help with?</h3>
            <ul>
              <li>Lift and contour the cheek area</li>
              <li>Restore volume lost due to aging</li>
              <li>Improve facial proportions and harmony</li>
              <li>Smooth smile lines and nasolabial folds indirectly</li>
              <li>Enhance definition without surgery</li>
            </ul>
          </div>
        </div>


        <div className="treatment-faq">
          <details>
            <summary>How long do cheek fillers last?</summary>
            <p>
              Cheek filler typically lasts 12-18 months depending on the product
              used and individual metabolism.
            </p>
          </details>
          <details>
            <summary>Will I look overfilled or unnatural?</summary>
            <p>
              Not at Divaa. We specialize in subtle, balanced enhancements. Our
              goal is to enhance your cheekbones without distorting your natural
              features.
            </p>
          </details>
        </div>
    </div>
    </main>
}

export default Page;