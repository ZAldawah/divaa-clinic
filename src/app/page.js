import Image from "next/image";

export default function Home() {
  return (
    <>
      <main>
        <section id="home" class="hero-section">
          <div class="hero">
            <div class="hero-text">
              <h1 class="hero-text-hook">Your Beauty, Our Expertise</h1>
              <p class="hero-text-hook2">
                Beauty awaits-are you ready to embrace it?
              </p>
              <p class="hero-text-introduction">
                At Divaa Beauty Clinic, we combine artistic precision with the
                latest aesthetic advancements, delivering personalized
                treatments that enhance your natural beauty and confidence.
                Recognized as Houston&apos;s top-rated Med Spa, we specialize in
                Botox, Dermal Fillers, Skin Rejuvenation, and so much more. We
                ensure every experience is tailored uniquely for you—because
                exceptional care should never be a luxury. Schedule your
                complimentary consultation today, and take the first step toward
                revealing your most radiant self.
              </p>
              <a
                href="sms:8329929422?&body=Hi%20I%27m%20interested%20in%20Botox%20services%20at%20Divaa"
                class="contact-button"
              >
                CONSULT NOW: (832) 992-9422
              </a>
            </div>
          </div>
        </section>
        <section class="services-section">
          <div class="container">
            <div class="services">
              <h2 class="section-title">Our Services</h2>
              <div class="service-list">
                <a href="/botox" class="service-link">
                  <div class="service-item service-botox">
                    <h3>Botox and Dysport</h3>
                    <p>
                      Effective wrinkle reduction and youthful skin enhancement.
                    </p>
                  </div>
                </a>
                <a href="/lip-filler" class="service-link">
                  <div class="service-item service-filler-lips">
                    <h3>Lip Filler</h3>
                    <p>
                      Enhance volume and contour for fuller, natural-looking
                      lips.
                    </p>
                  </div>
                </a>
                <a href="/cheek-filler" class="service-link">
                  <div class="service-item service-filler-cheeks">
                    <h3>Cheek Filler</h3>
                    <p>
                      Restore youthful definition and lift through subtle cheek
                      enhancement.
                    </p>
                  </div>
                </a>
                <a href="/undereye-filler" class="service-link">
                  <div class="service-item service-filler-under-eye">
                    <h3>Under-Eye Filler</h3>
                    <p>
                      Reduce hollowness and dark circles for a refreshed look.
                    </p>
                  </div>
                </a>
                <a href="/radiesse" class="service-link">
                  <div class="service-item service-radiesse">
                    <h3>Radiesse</h3>
                    <p>Hydrating injectable treatment for overall skin glow.</p>
                  </div>
                </a>
                <a href="/sculptra" class="service-link">
                  <div class="service-item service-sculptra">
                    <h3>Sculptra</h3>
                    <p>Deep revitalization and skin elasticity improvement.</p>
                  </div>
                </a>
                <a href="/prp" class="service-link">
                  <div class="service-item service-prptreatment">
                    <h3>PRP Treatment</h3>
                    <p>
                      Stimulates skin regeneration and collagen production using
                      your own plasma.
                    </p>
                  </div>
                </a>
                <a href="/rrf" class="service-link">
                  <div class="service-item service-rrf">
                    <h3>Radiofrequency Facial</h3>
                    <p>
                      Tighten and rejuvenate skin using advanced RF technology.
                    </p>
                  </div>
                </a>
                <a href="/facials" class="service-link">
                  <div class="service-item service-facials">
                    <h3>Facials</h3>
                    <p>Product Use</p>
                  </div>
                </a>
                <a href="/hydrofacial" class="service-link">
                  <div class="service-item service-hydrofacial">
                    <h3>Hydrofacial</h3>
                    <p>
                      Deep cleansing, exfoliation, and hydration for radiant
                      skin.
                    </p>
                  </div>
                </a>
                <a href="/microneedling" class="service-link">
                  <div class="service-item service-microneedling">
                    <h3>Microneedling</h3>
                    <p>Product Use</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
