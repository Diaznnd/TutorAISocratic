// Test modal sederhana untuk debug
export function PreTestModalTest({ isOpen, onClose }) {
  if (!isOpen) return null;

  console.log('PreTestModalTest rendering...');

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl p-8 max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">Test Modal Pre-Test</h2>
        <p className="mb-4">Jika Anda bisa melihat ini, berarti modal bisa render!</p>
        <button
          onClick={onClose}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}
