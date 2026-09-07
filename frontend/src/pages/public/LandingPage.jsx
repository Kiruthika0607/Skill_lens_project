import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, TrendingUp, GitPullRequest, Award, ArrowRight, CheckCircle2, Shield, Users } from 'lucide-react';

const LandingPage = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Hero Section */}
      <section style={{
        padding: '6rem 2rem 4rem',
        textAlign: 'center',
        background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.25), transparent)',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        <div style={{ display: 'inline-flex', marginBottom: '1.5rem' }}>
          <span className="badge badge-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
            <Compass size={14} /> Career Intelligence for Engineering Graduates
          </span>
        </div>

        <h1 style={{
          fontSize: '3.5rem',
          lineHeight: '1.15',
          fontWeight: '800',
          marginBottom: '1.5rem',
          letterSpacing: '-0.03em'
        }}>
          Bridge the Gap Between <br />
          <span style={{
            background: 'var(--accent-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Campus Skills & Industry Demand
          </span>
        </h1>

        <p style={{
          fontSize: '1.2rem',
          color: 'var(--text-secondary)',
          maxWidth: '750px',
          margin: '0 auto 2.5rem',
          lineHeight: '1.6'
        }}>
          SkillLens aggregates verified job market requirements, computes your deterministic career readiness score, pinpoints exact skill gaps, and maps an automated 4-phase learning roadmap.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn btn-primary" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }} id="hero-get-started-btn">
            Get Started Free <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn btn-secondary" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }} id="hero-explore-btn">
            Explore Careers
          </Link>
        </div>
      </section>

      {/* Core Workflow Pillars */}
      <section style={{ maxWidth: '1200px', margin: '3rem auto 6rem', padding: '0 2rem', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>Explainable, Deterministic Career Mapping</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Zero hallucinations. Grounded in actual job market analytics and relational taxonomy.</p>
        </div>

        <div className="grid-3">
          <div className="card">
            <div style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }}>
              <TrendingUp size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>1. Real-Time Demand Aggregator</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Calculates live demand percentages for 50+ normalized skills across hundreds of verified job postings from top tech employers.
            </p>
          </div>

          <div className="card">
            <div style={{ color: 'var(--accent-secondary)', marginBottom: '1rem' }}>
              <GitPullRequest size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>2. Precision Skill Gap Matrix</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Weights core prerequisites vs optional skills. Categorizes missing skills into High, Medium, and Low priorities with clear rationales.
            </p>
          </div>

          <div className="card">
            <div style={{ color: 'var(--success)', marginBottom: '1rem' }}>
              <Award size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>3. Actionable Career Roadmaps</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Generates sequenced 4-phase roadmaps connected to vetted courses, open-source portfolio projects, and industry certifications.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-subtle)',
        padding: '2.5rem 2rem',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.85rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>© 2026 SkillLens Platform. Engineering Career Intelligence.</div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link to="/login" style={{ color: 'var(--text-secondary)' }}>Student Portal</Link>
            <Link to="/login" style={{ color: 'var(--text-secondary)' }}>Admin Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
