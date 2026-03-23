export type VapiPhoneNumber = {
  id: string;
  number: string | null;
  name: string | null;
  status: string | null;
  assistantId: string | null;
};

export type VapiAssistant = {
  id: string;
  name: string;
  firstMessage: string | null;
  modelProvider: string | null;
};
