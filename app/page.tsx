type Product = {name:string;description:string;meta:string;status:string;visual:string;href?:string};

const products:Product[] = [
  {
    name: "Custom Name Tag",
    description: "Create a two-colour 3D printed tag with your name, favourite icon or a custom avatar.",
    meta: "",
    href: "/name-tag",
    status: "AVAILABLE",
    visual: "MILO",
  },
  {
    name: "Bag Charm",
    description: "A larger character-led charm format, designed for bags and everyday accessories.",
    meta: "",
    status: "COMING SOON",
    visual: "✦",
  },
  {
    name: "Desk Sign",
    description: "Personalised standing pieces for desks, shelves and small business displays.",
    meta: "",
    status: "COMING SOON",
    visual: "A+",
  },
];

function NameTagProductVisual() {
  const flowerOutlineWidth = 130;
  return <svg className="product-name-tag" viewBox="0 0 620 260" role="img" aria-label="White 3D name tag with a flower icon and the name Milo">
    <defs>
      <path id="product-flower" fillRule="evenodd" d="M183.001 0C227.183 0 263.001 35.817 263.001 80v.183c41.303-11.989 84.95 10.922 98.336 52.121 13.654 42.02-9.343 87.153-51.363 100.806l-.166.052c22.327 35.352 13.65 82.447-20.66 107.375-33.175 24.103-78.655 19.01-105.784-10.424-27.13 29.433-72.609 34.527-105.783 10.424-34.248-24.883-42.956-71.853-20.782-107.183l-.772-.244C14.007 219.457-8.99 174.324 4.664 132.304 18.05 91.105 61.696 68.195 103.002 80.183V80C103.001 35.817 138.818 0 183.001 0Zm0 123c-33.69 0-61 27.311-61 61s27.31 61 61 61c33.689 0 61-27.311 61-61s-27.311-61-61-61Z"/>
    </defs>
    <g className="product-tag-depth" transform="translate(0 13)">
      <circle cx="74" cy="140" r="28" fill="none" stroke="#8b8d8b" strokeWidth="18"/>
      <g fill="#8b8d8b" stroke="#8b8d8b" strokeWidth="34" strokeLinejoin="round">
        <path d="M102 132h31M177 132h36" fill="none" strokeWidth="24" strokeLinecap="round"/>
        <use href="#product-flower" transform="translate(106 93) scale(.22)" strokeWidth={flowerOutlineWidth}/>
        <text x="201" y="174" fontFamily="Sour Gummy, Poppins, sans-serif" fontSize="112" fontWeight="700" letterSpacing="-6">Milo</text>
      </g>
    </g>
    <g className="product-tag-base" fill="#f2f1ed" stroke="#f2f1ed" strokeWidth="34" strokeLinejoin="round">
      <circle cx="74" cy="140" r="28" fill="none" strokeWidth="18"/>
      <use href="#product-flower" transform="translate(106 93) scale(.22)" strokeWidth={flowerOutlineWidth}/>
      <text x="201" y="174" fontFamily="Sour Gummy, Poppins, sans-serif" fontSize="112" fontWeight="700" letterSpacing="-6">Milo</text>
    </g>
    <g className="product-tag-face" fill="#17191a">
      <use href="#product-flower" transform="translate(106 93) scale(.22)"/>
      <text x="201" y="174" fontFamily="Sour Gummy, Poppins, sans-serif" fontSize="112" fontWeight="700" letterSpacing="-6">Milo</text>
    </g>
  </svg>;
}

export default function LandingPage() {
  return <main className="landing">
    <nav>
      <a className="brand" href="/">FORM <i>&</i> FABLE</a>
      <div className="navlinks"><a href="#products">PRODUCTS</a><a href="#about">ABOUT</a></div>
    </nav>

    <header className="landing-hero">
      <div className="landing-copy">
        <p className="eyebrow">MADE IN HONG KONG</p>
        <h1>Make it personal.<br/><em>Print it real.</em></h1>
        <p>Design small, one-of-one objects in your browser.</p>
        <a className="landing-primary" href="#products"><span>SELECT A PRODUCT</span><b>↓</b></a>
      </div>
      <div className="landing-object" aria-hidden="true">
        <div className="landing-product-3d">
          <img className="landing-product-layer landing-product-depth-back" src="/images/01-welcome.svg" alt="" />
          <img className="landing-product-layer landing-product-depth-mid" src="/images/01-welcome.svg" alt="" />
          <img className="landing-product-layer landing-product-face" src="/images/01-welcome.svg" alt="" />
        </div>
      </div>
    </header>

    <section className="product-section" id="products">
      <div className="product-heading">
        <div><p className="eyebrow">SELECT PRODUCT</p><h2>What will you make?</h2></div>
      </div>
      <div className="product-grid">
        {products.map((product,index)=>{
          const content=<>
            <div className="product-card-top"><span>0{index+1}</span><small>{product.status}</small></div>
            <div className={`product-visual product-visual-${index+1}`}>{index===0?<NameTagProductVisual/>:<span>{product.visual}</span>}</div>
            <div className="product-card-copy"><small>{product.meta}</small><h3>{product.name}</h3><p>{product.description}</p><strong>{product.href?"CUSTOMISE NOW →":"NOTIFY ME LATER"}</strong></div>
          </>;
          return product.href
            ? <a className="product-card available" href={product.href} key={product.name}>{content}</a>
            : <article className="product-card coming" key={product.name} aria-disabled="true">{content}</article>;
        })}
      </div>
    </section>

    <section className="landing-about" id="about">
      <p className="eyebrow">HOW IT WORKS</p>
      <div><article><b>01</b><h3>Choose</h3><p>Select the object you want to personalise.</p></article><article><b>02</b><h3>Design</h3><p>See your choices update in a live 3D preview.</p></article><article><b>03</b><h3>Review & print</h3><p>We inspect the model and confirm everything before production.</p></article></div>
    </section>

    <footer><span>FORM & FABLE</span><p>Small objects. Big personality.</p><small>© 2026 · MADE IN HONG KONG</small></footer>
  </main>;
}
