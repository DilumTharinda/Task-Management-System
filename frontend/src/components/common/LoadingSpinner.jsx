export default function LoadingSpinner({ size = 40, fullScreen = false }) {
  const spinner = (
    <div style={{
      width: size, height: size,
      border: `3px solid var(--border)`,
      borderTop: `3px solid var(--accent)`,
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        display: 'flex', alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-primary)',
        zIndex: 9999
      }}>
        {spinner}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
      {spinner}
    </div>
  );
}