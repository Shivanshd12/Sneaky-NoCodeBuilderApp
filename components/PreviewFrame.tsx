import React, { useEffect, useRef } from 'react';

interface PreviewFrameProps {
  htmlContent: string;
}

export const PreviewFrame: React.FC<PreviewFrameProps> = ({ htmlContent }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
      }
    }
  }, [htmlContent]);

  return (
    <div className="w-full h-full bg-white rounded-xl overflow-hidden shadow-2xl shadow-black/50">
      <iframe
        ref={iframeRef}
        title="Preview"
        className="w-full h-full border-0"
        sandbox="allow-scripts" // Allow tailwind CDN to run
      />
    </div>
  );
};