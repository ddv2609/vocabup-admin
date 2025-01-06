import React, { ReactNode } from "react";
import { IntlProvider } from "react-intl";
import { useReduxSelector } from "../hooks";

import en from "../translation/en.json";
import vi from "../translation/vi.json";
import MessageUtils, { NestedMessages } from "../utils/MessageUtils";

const messages = {
  en: MessageUtils.flattenMessages(en as NestedMessages),
  vi: MessageUtils.flattenMessages(vi as NestedMessages),
};

type TranslationProviderProps = {
  children: ReactNode;
};

const TranslationProvider: React.FC<TranslationProviderProps> = ({
  children,
}) => {
  const locale = useReduxSelector((state) => state.app.language);

  return (
    <IntlProvider
      locale={locale}
      messages={messages[locale] as unknown as Record<string, string>}
    >
      {children}
    </IntlProvider>
  );
};

export default TranslationProvider;
