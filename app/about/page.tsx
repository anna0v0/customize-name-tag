export default function AboutPage() {
  return (
    <main className="about-page">
      <nav>
        <a className="brand" href="/">THE <span className="brand-accent">ODDMENT</span> CLUB</a>
        <div className="navlinks">
          <a href="/#products">PRODUCTS</a>
          <a className="active" href="/about">ABOUT</a>
          <a href="/order-status">ORDER STATUS</a>
        </div>
      </nav>

      <section className="about-intro">
        <p className="eyebrow">ABOUT THE ODDMENT CLUB</p>
        <h1>Small objects.<br/><em>Made personal.</em></h1>
        <div className="about-copy">
          <p>The Oddment Club is a Hong Kong–based studio creating playful, made-to-order 3D printed objects.</p>
          <p>Choose a product, make it yours, and we’ll turn your design into something real.</p>
        </div>
        <a className="landing-primary" href="/#products"><span>EXPLORE PRODUCTS</span><b>→</b></a>
      </section>

      <footer><span>THE <span className="brand-accent">ODDMENT</span> CLUB</span><p>Small objects. Big personality.</p><small>© 2026 · MADE IN HONG KONG</small></footer>
    </main>
  );
}
