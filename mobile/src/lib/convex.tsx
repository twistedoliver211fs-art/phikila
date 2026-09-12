import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { ReactNode } from 'react';

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL || 'https://third-snail-415.convex.cloud';
const convex = new ConvexReactClient(convexUrl, { unsavedChangesWarning: false });

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProvider client={convex}>
      {children}
    </ConvexProvider>
  );
}

export { convex };
