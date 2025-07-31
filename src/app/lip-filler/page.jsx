const Page = () => {
    return     <main>
      <div className="subhero">
        <div className="subhero-hook1">
          <div className="subhero-hook1-text">
            <h1>LIP FILLER</h1>
            <a
              href="sms:8329929422?&body=Hi%20I%27m%20interested%20in%20lip%20filler%20services%20at%20Divaa"
              className="contact-button"
            >
              CONSULT NOW: (832) 992-9422
            </a>
            <p>
              Add volume, shape, and symmetry to your lips with precision lip
              filler techniques designed to enhance your natural beauty.
            </p>
          </div>
          <div className="subhero-hook1-logo">
            <img
              src="pictures/lip-filler.JPG"
              alt="Client receiving Lip Filler at Divaa Beauty"
            />
          </div>
        </div>
    </div>

      <div className="treatment-information">
        <div className="treatment-introduction">
          <div className="treatment-introduction-text">
            <h3>What is Lip Filler?</h3>
            <p>
              Lip filler is a hyaluronic acid-based injectable used to enhance
              lip volume, correct asymmetry, define lip borders, and improve
              overall shape. At Divaa Beauty Clinic, we specialize in achieving
              balanced, elegant results — whether you're looking for a subtle
              enhancement or a fuller pout.
            </p>
          </div>
        </div>

        <div className="treatment-function">
          <div className="treatment-function-text">
            <h3>What can Lip Filler help with?</h3>
            <ul>
              <li>Adds volume to thin or aging lips</li>
              <li>Improves lip symmetry</li>
              <li>Defines lip borders and cupid's bow</li>
              <li>Smooths out lines around the mouth</li>
              <li>Enhances overall facial harmony</li>
            </ul>
          </div>
        </div>

        <div className="treatment-faq">
          <details>
            <summary>Does lip filler hurt?</summary>
            <p>
              Most clients feel only a slight pinch. We apply numbing cream
              before the procedure to ensure your comfort.
            </p>
          </details>
          <details>
            <summary>How long do lip fillers last?</summary>
            <p>
              Lip filler typically lasts 6-12 months depending on your
              metabolism, filler type, and maintenance routine.
            </p>
          </details>
        </div>
    </div>
    </main>
}

export default Page;