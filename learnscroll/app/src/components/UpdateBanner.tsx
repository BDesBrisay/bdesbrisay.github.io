import { useState } from 'react';

interface UpdateBannerProps {
  visible: boolean;
  onReload: () => Promise<void>;
}

export const UpdateBanner = ({ visible, onReload }: UpdateBannerProps) => {
  const [updating, setUpdating] = useState(false);

  if (!visible) {
    return null;
  }

  const handleUpdate = async (): Promise<void> => {
    setUpdating(true);
    await onReload();
    setUpdating(false);
  };

  return (
    <aside className="update-banner" aria-live="polite">
      <span>Update ready</span>
      <button type="button" className="btn btn--primary" onClick={handleUpdate} disabled={updating}>
        {updating ? 'Updating...' : 'Refresh'}
      </button>
    </aside>
  );
};
