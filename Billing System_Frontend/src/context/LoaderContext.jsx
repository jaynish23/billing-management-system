import { createContext, useContext, useState } from 'react';
import GlobalLoader from '../components/common/GlobalLoader';

const LoaderContext = createContext(null);

export function LoaderProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Processing Request...');

  const showLoader = (text = 'Processing Request...') => {
    setLoadingText(text);
    setIsLoading(true);
  };

  const hideLoader = () => {
    setIsLoading(false);
  };

  return (
    <LoaderContext.Provider value={{ isLoading, loadingText, showLoader, hideLoader }}>
      {children}
      <GlobalLoader show={isLoading} text={loadingText} />
    </LoaderContext.Provider>
  );
}

export function useLoader() {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error('useLoader must be used within a LoaderProvider');
  }
  return context;
}
