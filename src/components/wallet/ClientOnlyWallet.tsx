'use client';

import dynamic from 'next/dynamic';
import { ComponentType, ReactNode } from 'react';

// Client-only wrapper to prevent SSR issues with wallet adapters
const ClientOnlyWrapper = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};

// Dynamic import with no SSR to prevent 'self is not defined' errors
const ClientOnlyWalletWrapper = dynamic(
  () => Promise.resolve(ClientOnlyWrapper),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-4">
        <div className="animate-pulse">Loading wallet...</div>
      </div>
    ),
  }
);

// Higher-order component to wrap wallet-dependent components
export function withClientOnlyWallet<P extends object>(
  Component: ComponentType<P>
) {
  const ClientOnlyComponent = (props: P) => {
    return (
      <ClientOnlyWalletWrapper>
        <Component {...props} />
      </ClientOnlyWalletWrapper>
    );
  };

  ClientOnlyComponent.displayName = `ClientOnly(${
    Component.displayName || Component.name
  })`;

  return ClientOnlyComponent;
}

export default ClientOnlyWalletWrapper; 