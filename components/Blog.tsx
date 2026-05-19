'use client';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import SectionTransition, { fadeUpVariant } from './ui/SectionTransition';
import { blogPosts } from '@/lib/data';

export default function Blog() {
  return (
    <section id="blog" className="section-bg-secondary">
      <div className="container-wide">
        <SectionTransition
          eyebrow="WRITING"
          title={<>Thoughts I&apos;ve <span className="text-grad">Published</span></>}
        >
          <div style={{ display: 'grid', gap: '1.25rem' }}
               className="r-grid-3col">
            {blogPosts.map(post => (
              <motion.a
                key={post.url}
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                variants={fadeUpVariant}
                className="card-base"
                style={{
                  padding: '1.5rem',
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
                whileHover={{ y: -4, boxShadow: 'var(--shadow-hover)' }}
              >
                {/* Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {post.tags.map(tag => (
                    <span key={tag} className="skill-pill" style={{ fontSize: '0.6rem' }}>
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Title */}
                <p style={{
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  lineHeight: 1.45,
                  flex: 1,
                }}>
                  {post.title}
                </p>

                {/* Footer */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 'auto',
                }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {post.date} · {post.readTime}
                  </span>
                  <ArrowUpRight size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                </div>
              </motion.a>
            ))}
          </div>
        </SectionTransition>
      </div>
    </section>
  );
}
