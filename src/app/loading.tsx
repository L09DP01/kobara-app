export default function Loading() {
  return (
    <div className="fixed inset-0 bg-[#020B14] z-[9999] flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center">
        {/* Loader CSS Ring */}
        <div 
          className="absolute"
          style={{
            width: "80px",
            aspectRatio: "1",
            borderRadius: "50%",
            border: "4px solid rgba(255, 74, 28, 0.2)",
            borderRightColor: "#FF4A1C",
            animation: "l2 1s infinite linear"
          }}
        />
        {/* Center Icon */}
        <img 
          src="/Icone.png" 
          alt="Kobara Loading" 
          className="w-10 h-10 object-contain z-10 animate-pulse" 
        />
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes l2 {
          to { transform: rotate(1turn); }
        }
      `}} />
    </div>
  );
}
