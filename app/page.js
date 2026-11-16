import Link from "next/link";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import "./landing.css";
import { Reveal, Stagger, StaggerItem, Float, ScrollProgress } from "../components/motion/Motion";

const display = Bricolage_Grotesque({ subsets: ["latin"], weight: ["400", "600", "800"], variable: "--cg-display" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--cg-mono" });

const features = [
  ["Full curriculum", "Chapters, lessons and learning goals, tailored to subject, skill level and duration.", "#7dd3fc"],
  ["Matched video lectures", "Each chapter is paired with a relevant YouTube lesson so you can watch, not just read.", "#ff8fc0"],
  ["Code you can copy", "Clear explanations with formatted code snippets and one-click copy.", "#86efac"],
  ["Share and explore", "Publish your course with a link, or browse what other learners have built.", "#c4b5fd"],
];

export default function Home() {
  return (
    <div className={`cg ${display.variable} ${mono.variable}`}>
      <ScrollProgress color="#ff5fa2" />
      <header className="cg-wrap cg-nav">
        <Link href="/" className="cg-brand">CourseGen<sup>AI</sup></Link>
        <nav>
          <a href="#how">How it works</a>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/sign-in" className="cg-chip">Sign in</Link>
        </nav>
      </header>

      <main>
        <section className="cg-wrap cg-hero">
          <div>
            <h1 className="cg-rise">Type a topic.<br />Get a <span className="cg-hl">whole course.</span></h1>
            <p className="cg-lead cg-rise cg-d1">Structured chapters, matched video lectures and code examples, generated in seconds for whatever you want to learn next.</p>
            <Link href="/create-course" className="cg-prompt cg-rise cg-d2">
              <span>&ldquo;Rust for Python developers&rdquo;</span>
              <b>Generate</b>
            </Link>
          </div>
          <div className="cg-stack cg-rise cg-d3" aria-hidden>
            <Float className="cg-fl cg-fl1" distance={12} duration={5}><div className="cg-mod"><small>CHAPTER 01</small><h3>Ownership, explained</h3><div className="cg-vid" /></div></Float>
            <Float className="cg-fl cg-fl2" distance={9} duration={6} delay={0.8}><div className="cg-mod"><small>CHAPTER 02 &middot; CODE</small><h3>Borrowing in practice</h3><code>let s = &amp;name;</code></div></Float>
            <Float className="cg-fl cg-fl3" distance={11} duration={5.5} delay={1.6}><div className="cg-mod"><small>CHAPTER 03</small><h3>Lifetimes, demystified</h3></div></Float>
          </div>
        </section>

        <section id="how" className="cg-band">
          <Stagger className="cg-wrap cg-steps" gap={0.12}>
            {[["1", "Pick a topic", "Anything from guitar theory to Kubernetes."], ["2", "Set the level", "Beginner, intermediate or advanced, and how long."], ["3", "Start learning", "Read, watch and practice, chapter by chapter."]].map(([n, t, d]) => (
              <StaggerItem key={n} className="cg-step">
                <span className="cg-n">{n}</span>
                <div><h3>{t}</h3><p>{d}</p></div>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        <section className="cg-wrap cg-feat">
          <Reveal><h2>Everything a good course needs.<br /><span className="cg-hl">None of the busywork.</span></h2></Reveal>
          <Stagger className="cg-grid" gap={0.1}>
            {features.map(([t, d, c]) => (
              <StaggerItem key={t} className="cg-cell"><div className="cg-card" style={{ background: c }}>
                <h3>{t}</h3>
                <p>{d}</p>
              </div></StaggerItem>
            ))}
          </Stagger>
        </section>

        <section className="cg-wrap cg-cta">
          <Reveal className="cg-cta-box">
            <h2>What do you want to learn?</h2>
            <Link href="/create-course" className="cg-btn">Create a course &rarr;</Link>
          </Reveal>
        </section>
      </main>

      <footer className="cg-wrap cg-foot">
        <span className="cg-brand">CourseGen<sup>AI</sup></span>
        <nav>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/create-course">Create</Link>
          <Link href="/sign-in">Sign in</Link>
        </nav>
        <span>&copy; {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
