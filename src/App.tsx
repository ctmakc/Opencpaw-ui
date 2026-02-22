import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { Dashboard } from './pages/Dashboard';
import { Field } from './pages/Field';
import { Missions } from './pages/Missions';
import { Agents } from './pages/Agents';
import { Intel } from './pages/Intel';
import { Log } from './pages/Log';
import { useAppStore } from './store/useAppStore';

const PAGE_COMPONENTS = {
  dashboard: Dashboard,
  field:     Field,
  missions:  Missions,
  agents:    Agents,
  intel:     Intel,
  log:       Log,
};

export default function App() {
  const { page } = useAppStore();
  const PageComponent = PAGE_COMPONENTS[page];

  return (
    <div className="flex h-screen overflow-hidden bg-void">
      {/* Subtle scanline overlay across full app */}
      <div
        className="fixed inset-0 pointer-events-none z-50 opacity-20"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)',
        }}
      />

      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />

        <main className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="h-full"
            >
              <PageComponent />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
