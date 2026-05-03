import { createThirdwebClient } from 'thirdweb';

export const hasThirdwebClientId = Boolean(process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID);

export const thirdwebClient = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID ?? 'demo',
});
