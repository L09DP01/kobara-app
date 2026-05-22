'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';

export function DocsClient({ 
  testPublicKey, 
  testSecretKey,
  livePublicKey,
  isAuthenticated,
  markdownContent
}: { 
  testPublicKey: string, 
  testSecretKey: string,
  livePublicKey: string,
  isAuthenticated: boolean,
  markdownContent: string
}) {
  const [activeSection, setActiveSection] = useState('quickstart');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Intersection Observer for highlighting the active section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -80% 0px' }
    );

    const sections = document.querySelectorAll('h1[id], h2[id], h3[id]');
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, [markdownContent]);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const NavItem = ({ id, label, isSubItem = false }: { id: string, label: string, isSubItem?: boolean }) => {
    const isActive = activeSection === id;
    return (
      <button 
        onClick={() => scrollToSection(id)}
        className={clsx(
          "w-full text-left py-2 px-4 transition-colors text-sm rounded-lg flex items-center gap-3",
          isActive
            ? "text-secondary dark:text-secondary-fixed-dim bg-secondary-fixed/10 border-l-4 border-secondary dark:border-secondary-fixed-dim font-semibold rounded-l-none"
            : "text-on-surface-variant dark:text-on-primary-container hover:bg-surface-container dark:hover:bg-primary-fixed-dim/10 transition-colors hover:bg-surface-container-high dark:hover:bg-primary-container",
          isSubItem && "pl-8"
        )}
      >
        <span>{label}</span>
      </button>
    );
  };

  const SidebarContent = () => (
    <div className="py-6 space-y-8">
      <div className="flex flex-col gap-1">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-text-secondary px-4 mb-2">Getting Started</h3>
        <NavItem id="api-keys" label="API Keys" />
        <NavItem id="authentication" label="Authentication" />
      </div>
      
      <div className="flex flex-col gap-1">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-text-secondary px-4 mb-2">SDKs & Libraries</h3>
        <NavItem id="javascript-sdk" label="JavaScript SDK" />
        <NavItem id="nodejs-sdk" label="Node.js SDK" />
        <NavItem id="python-sdk" label="Python SDK" />
        <NavItem id="php-sdk" label="PHP SDK" />
      </div>
      
      <div className="flex flex-col gap-1">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-text-secondary px-4 mb-2">Integrations</h3>
        <NavItem id="wordpress-plugin" label="WordPress Plugin" />
        <NavItem id="ai-integration" label="AI Integration" />
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-text-secondary px-4 mb-2">Core API</h3>
        <NavItem id="payments-api" label="Payments" />
        <NavItem id="payment-links-api" label="Payment Links" />
        <NavItem id="webhooks" label="Webhooks" />
        <NavItem id="withdrawals-api" label="Withdrawals" />
        <NavItem id="metadata-expansion" label="Metadata & Expansion" />
        <NavItem id="errors-api" label="Errors" />
      </div>
    </div>
  );

  const CodeBlock = ({ title, code, language = 'terminal' }: { title?: string, code: string, language?: string }) => {
    const displayTitle = title || (language === 'txt' || language === 'terminal' ? 'Terminal' : language.toUpperCase());
    
    return (
      <div className="bg-[#0B101E] rounded-xl overflow-hidden shadow-xl shadow-black/10 my-6 border border-border-subtle relative group">
        <div className="bg-white/5 px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
            </div>
            <span className="text-white/40 text-[11px] font-mono-code ml-1 font-medium tracking-wider uppercase">{displayTitle}</span>
          </div>
          <button 
            onClick={() => navigator.clipboard.writeText(code)}
            className="text-white/60 hover:text-white transition-colors flex items-center justify-center p-1"
            title="Copier le code"
          >
            <span className="material-symbols-outlined text-[16px]">content_copy</span>
          </button>
        </div>
        <pre className="p-5 text-[13px] font-mono-code text-white/90 overflow-x-auto leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    );
  };

  return (
    <div className="bg-background-main font-body-base text-body-base text-on-surface antialiased min-h-screen flex selection:bg-primary/20">
      
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        "fixed flex flex-col z-40 bg-surface-container-lowest dark:bg-primary-container text-primary dark:text-on-primary font-body-base text-body-base docked w-[280px] left-0 top-0 bottom-0 border-r border-border-subtle dark:border-outline-variant flat transition-transform duration-300 ease-in-out md:translate-x-0 md:flex shadow-2xl md:shadow-none",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header inside Sidebar */}
        <div className="px-6 py-6 border-b border-border-subtle/50 flex justify-between items-center">
          <Link href="/" className="font-bold text-xl flex items-center gap-3 text-primary dark:text-on-primary">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-md shadow-primary/20">
              <span className="material-symbols-outlined text-[18px]">payments</span>
            </div>
            Kobara <span className="text-text-secondary font-normal">Docs</span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-surface-container-high text-text-secondary hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-2 space-y-4 py-4">
          <SidebarContent />
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen ml-0 md:ml-[280px] w-full md:w-[calc(100%-280px)]">
        
        {/* Top Nav */}
        <header className="bg-surface/80 backdrop-blur-xl dark:bg-primary/80 text-primary dark:text-on-primary font-headline-md text-headline-md docked full-width top-0 sticky border-b border-border-subtle dark:border-outline-variant flat flex justify-between items-center h-16 sm:h-20 px-4 sm:px-8 z-30 transition-all duration-200 ease-in-out shadow-sm md:shadow-none">
          <div className="flex items-center gap-3 sm:gap-6">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-surface-container hover:bg-surface-container-high text-text-primary transition-colors shadow-sm border border-border-subtle"
            >
              <span className="material-symbols-outlined text-[20px]">{isMobileMenuOpen ? 'close' : 'menu_open'}</span>
            </button>
            <div className="flex flex-col">
              <h2 className="font-headline-sm sm:font-headline-lg text-text-primary tracking-tight font-bold">
                <span className="md:hidden">Docs API</span>
                <span className="hidden md:inline">Documentation API</span>
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4">
            <a href={process.env.NEXT_PUBLIC_KOBARA_API_URL || 'https://api.kobara.app'} target="_blank" rel="noreferrer" className="hidden sm:flex text-sm text-text-secondary hover:text-text-primary items-center gap-1.5 transition-colors bg-surface-container px-3 py-1.5 rounded-full border border-border-subtle">
              <span className="w-2 h-2 rounded-full bg-status-success animate-pulse"></span>
              API Status
            </a>
            <div className="w-px h-4 bg-border-subtle hidden sm:block mx-1"></div>
            {isAuthenticated ? (
              <Link href="/dashboard" className="bg-primary hover:bg-primary/90 text-on-primary px-3 sm:px-4 py-2 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2 shadow-md shadow-primary/20">
                <span className="material-symbols-outlined text-[18px]">dashboard</span>
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            ) : (
              <Link href="/" className="bg-surface-container hover:bg-surface-container-high text-text-primary px-3 sm:px-4 py-2 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2 border border-border-subtle shadow-sm">
                <span className="material-symbols-outlined text-[18px]">home</span>
                <span className="hidden sm:inline">Accueil</span>
              </Link>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-container-padding flex flex-col gap-6 max-w-[840px] mx-auto w-full py-8 min-w-0">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]} 
            rehypePlugins={[rehypeSlug]}
            components={{
              h1: ({node, ...props}: any) => <h1 className="text-3xl font-bold mt-8 mb-4 tracking-tight scroll-mt-24" {...props} />,
              h2: ({node, ...props}: any) => <h2 className="text-2xl font-bold mt-10 mb-3 scroll-mt-24 border-b border-border-subtle pb-1" {...props} />,
              h3: ({node, ...props}: any) => <h3 className="text-xl font-bold mt-6 mb-2 scroll-mt-24 text-text-primary" {...props} />,
              h4: ({node, ...props}: any) => <h4 className="text-lg font-semibold mt-4 mb-2 scroll-mt-24 text-text-primary" {...props} />,
              p: ({node, ...props}: any) => <p className="text-text-secondary text-base mb-3 leading-relaxed" {...props} />,
              a: ({node, ...props}: any) => <a className="text-primary hover:underline font-medium" {...props} />,
              ul: ({node, ...props}: any) => <ul className="list-disc list-outside ml-5 space-y-1 text-text-secondary text-base mb-4 flex flex-col" {...props} />,
              li: ({node, ...props}: any) => <li className="pl-1" {...props} />,
              hr: ({node, ...props}: any) => <hr className="hidden" {...props} />,
              table: ({node, ...props}: any) => (
                <div className="bg-surface-card border border-border-subtle rounded-xl overflow-hidden shadow-sm mb-6 w-full overflow-x-auto">
                  <table className="w-full text-left text-sm" {...props} />
                </div>
              ),
              th: ({node, ...props}: any) => <th className="p-4 font-semibold text-text-primary border-b border-border-subtle bg-surface-container-lowest" {...props} />,
              td: ({node, ...props}: any) => <td className="p-4 border-b border-border-subtle text-text-secondary" {...props} />,
              code({node, inline, className, children, ...props}: any) {
                const match = /language-(\w+)/.exec(className || '')
                if (!inline && match) {
                  return (
                    <CodeBlock 
                      language={match[1]}
                      code={String(children).replace(/\n$/, '')} 
                    />
                  )
                }
                return <code className="bg-surface-container px-1.5 py-0.5 rounded text-sm text-primary font-mono-code" {...props}>{children}</code>
              }
            }}
          >
            {markdownContent}
          </ReactMarkdown>
        </main>
      </div>
    </div>
  );
}
