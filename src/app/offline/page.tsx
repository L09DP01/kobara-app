import Image from "next/image";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="mb-8 opacity-50 grayscale">
        <Image 
          src="/logo.png" 
          alt="Kobara Logo" 
          width={180} 
          height={60} 
          className="mx-auto"
        />
      </div>
      
      <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-4xl text-text-secondary">wifi_off</span>
      </div>
      
      <h1 className="text-2xl font-bold text-text-primary mb-3">
        Vous êtes hors ligne
      </h1>
      
      <p className="text-text-secondary mb-8 max-w-sm">
        Kobara nécessite une connexion internet pour fonctionner. Veuillez vérifier votre réseau et réessayer.
      </p>
      
      <Link 
        href="/"
        className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
      >
        Réessayer
      </Link>
    </div>
  );
}
