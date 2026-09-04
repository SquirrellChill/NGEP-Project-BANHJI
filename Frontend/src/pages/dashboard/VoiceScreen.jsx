import { useState } from 'react';
import MobileAppShell from '../../components/dashboard/MobileAppShell';
import ScreenHeader from '../../components/dashboard/ScreenHeader';
import VoiceAssistantPanel from '../../components/dashboard/VoiceAssistantPanel';
import '../DashboardPage.css';

export default function VoiceScreen() {
  const [mode, setMode] = useState('standby');

  return (
    <MobileAppShell activeTab="voice" showBottomNav={false} className="voice-page-bg">
      <ScreenHeader title="Sale Recording" onBack={() => window.history.back()} />
      <VoiceAssistantPanel mode={mode} onModeChange={setMode} />
    </MobileAppShell>
  );
}
