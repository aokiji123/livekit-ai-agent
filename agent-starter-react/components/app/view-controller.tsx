'use client';

import { useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useRoomContext } from '@livekit/components-react';
import { useSession } from '@/components/app/session-provider';
import { SessionView } from '@/components/app/session-view';
import { Sidebar } from '@/components/app/sidebar';
import { WelcomeView } from '@/components/app/welcome-view';

const MotionWelcomeView = motion.create(WelcomeView);
const MotionSessionView = motion.create(SessionView);

const VIEW_MOTION_PROPS = {
  variants: {
    visible: {
      opacity: 1,
    },
    hidden: {
      opacity: 0,
    },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
  transition: {
    duration: 0.5,
    ease: 'linear',
  },
};

export interface ViewControllerProps {
  isAuthenticated: boolean;
}

export function ViewController({ isAuthenticated }: ViewControllerProps) {
  const room = useRoomContext();
  const isSessionActiveRef = useRef(false);
  const { appConfig, isSessionActive, startSession } = useSession();

  isSessionActiveRef.current = isSessionActive;

  const handleAnimationComplete = () => {
    if (!isSessionActiveRef.current && room.state !== 'disconnected') {
      room.disconnect();
    }
  };

  return (
    <div className="flex h-svh overflow-hidden">
      {isAuthenticated && <Sidebar className="w-80 flex-shrink-0" />}

      <main className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {!isSessionActive && (
            // @ts-expect-error - MotionWelcomeView is a valid component
            <MotionWelcomeView
              key="welcome"
              {...VIEW_MOTION_PROPS}
              className="h-full"
              startButtonText={appConfig.startButtonText}
              onStartCall={startSession}
              isAuthenticated={isAuthenticated}
            />
          )}
          {/* Session view */}
          {isSessionActive && (
            // @ts-expect-error - MotionSessionView is a valid component
            <MotionSessionView
              key="session-view"
              {...VIEW_MOTION_PROPS}
              appConfig={appConfig}
              onAnimationComplete={handleAnimationComplete}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
