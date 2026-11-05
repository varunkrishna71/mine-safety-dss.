import React, { useState } from 'react';
import { AndroidDeviceShell } from './android-ui/AndroidDeviceShell';
import { CodeInspectorDrawer } from './android-ui/components/CodeInspectorDrawer';

export const App: React.FC = () => {
  const [isCodeInspectorOpen, setIsCodeInspectorOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
      {/* Android Device Shell & Emulator */}
      <AndroidDeviceShell
        onOpenCodeInspector={() => setIsCodeInspectorOpen(true)}
      />

      {/* Code Inspector Modal / Drawer */}
      <CodeInspectorDrawer
        isOpen={isCodeInspectorOpen}
        onClose={() => setIsCodeInspectorOpen(false)}
      />
    </div>
  );
};

export default App;
