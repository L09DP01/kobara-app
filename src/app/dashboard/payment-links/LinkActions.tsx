'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function LinkActions({ linkId, linkUrl }: { linkId: string, linkUrl: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(linkUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button 
        onClick={handleCopy}
        className={`p-1.5 rounded transition-colors ${copied ? 'text-status-success bg-status-success/10' : 'text-text-secondary hover:text-text-primary hover:bg-surface-container-high'}`}
        title={copied ? "Copié !" : "Copier le lien"}
      >
        <span className="material-symbols-outlined text-[18px]">
          {copied ? "check" : "content_copy"}
        </span>
      </button>
      <Link 
        href={`/dashboard/payment-links/edit/${linkId}`}
        className="p-1.5 text-text-secondary hover:text-text-primary rounded hover:bg-surface-container-high transition-colors inline-flex" 
        title="Modifier"
      >
        <span className="material-symbols-outlined text-[18px]">edit</span>
      </Link>
    </div>
  );
}
