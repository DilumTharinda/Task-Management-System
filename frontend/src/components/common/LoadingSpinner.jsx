/* ----------------------------------------------------------------------- */
/*  Spinner core                                                           */
/* ----------------------------------------------------------------------- */

function SpinnerRing({ size }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: `3px solid var(--border)`,
        borderTop: `3px solid var(--accent)`,
        borderRadius: '50%',
        animation: 'tms-spin 0.8s linear infinite',
        flexShrink: 0,
        background: 'transparent',
        boxSizing: 'border-box',
        display: 'inline-block',
      }}
    >
      <style>{`
        @keyframes tms-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/*  Layout variants                                                         */
/* ----------------------------------------------------------------------- */

function FullScreenSpinner({ size }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-primary)',
        zIndex: 9999,
      }}
    >
      <SpinnerRing size={size} />
    </div>
  );
}

function CenteredSpinner({ size }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 0' }}>
      <SpinnerRing size={size} />
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/*  Main component                                                          */
/* ----------------------------------------------------------------------- */

export default function LoadingSpinner({ size = 40, fullScreen = false, inline = false }) {
  if (fullScreen) return <FullScreenSpinner size={size} />;
  if (inline) return <SpinnerRing size={size} />;
  return <CenteredSpinner size={size} />;
}
