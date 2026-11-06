import Link from 'next/link';
import {
  ChevronRight,
  ShieldCheck,
  Calendar,
  Clock,
  HelpCircle,
  ArrowRight,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { pageService } from '../../../services/page.service';
import { Header } from '../../../components/Header';
import { Footer } from '../../../components/Footer';
import { formatCmsContent, extractTableOfContents } from '../../../utils/cmsFormatter';
import './cms.css';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  try {
    const res = await pageService.getBySlug(slug);
    if (res?.success && res?.data) {
      const page = res.data;
      return {
        title: `${page.metaTitle || page.seoTitle || page.title} | Pick2Mart`,
        description: page.metaDescription || page.seoDescription || `Read our official ${page.title} on Pick2Mart.`,
      };
    }
  } catch (err) {}
  return {
    title: 'Pick2Mart Legal & Policies',
  };
}

export default async function CMSPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  let page = null;
  let error = null;

  try {
    const res = await pageService.getBySlug(slug);
    if (res?.success && res?.data) {
      page = res.data;
    } else {
      error = 'Page not found';
    }
  } catch (err) {
    error = err.message || 'Error loading page';
  }

  if (error || !page) {
    return (
      <div className="cms-page-wrapper">
        <Header />
        <main style={{ minHeight: '65vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
          <div style={{ textAlign: 'center', maxWidth: '480px', backgroundColor: '#ffffff', padding: '48px 32px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <FileText size={32} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Page Not Found</h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '24px' }}>
              The requested policy or page does not exist or has been temporarily moved.
            </p>
            <Link
              href="/"
              className="primary-button"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', padding: '12px 24px', borderRadius: '10px' }}
            >
              Return to Home
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Format content (handles markdown, structured headings, bullet points, and clean HTML)
  const formattedHtml = formatCmsContent(page.content, page.title);
  const tableOfContents = extractTableOfContents(page.content);

  // Formatted date
  const lastUpdated = page.updatedAt
    ? new Date(page.updatedAt).toLocaleDateString('en-IN', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently Updated';

  // Approximate reading time
  const wordCount = (page.content || '').split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 180));

  return (
    <div className="cms-page-wrapper">
      <Header />

      {/* Hero Header Banner */}
      <section className="cms-hero-banner">
        <div className="cms-hero-content">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="cms-breadcrumbs">
            <Link href="/">Home</Link>
            <ChevronRight size={13} />
            <Link href="/pages">Policies</Link>
            <ChevronRight size={13} />
            <span className="cms-breadcrumbs-current">{page.title}</span>
          </nav>

          {/* Badge */}
          <div className="cms-badge">
            <ShieldCheck size={14} /> Official Policy & Compliance
          </div>

          {/* Title */}
          <h1 className="cms-hero-title">{page.title}</h1>

          {/* Metadata Row */}
          <div className="cms-meta-row">
            <span className="cms-meta-item">
              <Calendar size={15} /> Last Updated: {lastUpdated}
            </span>
            <span className="cms-meta-item">
              <Clock size={15} /> {readingTime} min read
            </span>
            <span className="cms-meta-item" style={{ color: '#34d399' }}>
              <CheckCircle2 size={15} /> Verified Customer Terms
            </span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="cms-main-container">
        <article className="cms-content-card">
          {/* Quick Jump Table of Contents (if there are 3+ sections) */}
          {tableOfContents.length >= 3 && (
            <div className="cms-toc-container">
              <div className="cms-toc-title">
                <FileText size={14} /> Quick Navigation
              </div>
              <div className="cms-toc-list">
                {tableOfContents.map((toc, idx) => (
                  <a key={idx} href={`#${toc.id}`} className="cms-toc-pill">
                    {toc.text}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Rich Content Article */}
          <div
            className="cms-article"
            dangerouslySetInnerHTML={{ __html: formattedHtml }}
          />

          {/* Support / Help Card */}
          <div className="cms-support-card">
            <div className="cms-support-content">
              <div className="cms-support-icon">
                <HelpCircle size={22} />
              </div>
              <div className="cms-support-text">
                <h4>Have questions about this policy?</h4>
                <p>Our customer support team is available 24/7 to assist with your order inquiries.</p>
              </div>
            </div>
            <Link href="/contact" className="cms-support-btn">
              Contact Support <ArrowRight size={15} />
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
