export type Tutorial = {
  slug: string;
  title: string;
  description: string;
  category: string;
  updatedAt: string;
  content: string[];
};

export const tutorials: Tutorial[] = [
  {
    slug: "windows-activation-guide",
    title: "Windows Activation Guide",
    description: "Step-by-step guide to activate Windows after purchase.",
    category: "Windows",
    updatedAt: "2026-05-24",
    content: [
      "Open Settings on your Windows device.",
      "Go to System > Activation.",
      "Click Change product key.",
      "Enter the license key you received from SoftDealsHub.",
      "If activation fails, take a screenshot and contact support.",
    ],
  },
  {
    slug: "office-installation-guide",
    title: "Microsoft Office Installation Guide",
    description: "How to install and set up Microsoft Office products.",
    category: "Office",
    updatedAt: "2026-05-24",
    content: [
      "Download the official Office installer.",
      "Install Office on your device.",
      "Sign in or enter the license information provided.",
      "Open Word or Excel to check activation status.",
      "If you see an error, contact support with your order ID.",
    ],
  },
  {
    slug: "office-phone-activation",
    title: "Office Phone Activation Guide",
    description: "What to do when Office requires phone activation.",
    category: "Office",
    updatedAt: "2026-05-24",
    content: [
      "Open any Office app such as Word.",
      "Choose phone activation if online activation fails.",
      "Copy the Installation ID shown on your screen.",
      "Submit the Installation ID through Track Order or contact support.",
      "Wait for Confirmation ID from support.",
    ],
  },
  {
    slug: "autodesk-account-guide",
    title: "Autodesk Account Usage Guide",
    description: "How to use Autodesk account-based products.",
    category: "Autodesk",
    updatedAt: "2026-05-24",
    content: [
      "Use the account information provided after purchase.",
      "Go to Autodesk official website.",
      "Sign in with the provided account.",
      "Download the required Autodesk software.",
      "Do not change account information without contacting support.",
    ],
  },
  {
    slug: "usdt-trc20-payment-guide",
    title: "USDT TRC20 Payment Guide",
    description: "How to pay using USDT TRC20 safely.",
    category: "Payment",
    updatedAt: "2026-05-24",
    content: [
      "Choose USDT TRC20 payment at checkout.",
      "Send the exact amount shown on the payment page.",
      "Only use TRC20 network.",
      "Do not use ERC20, BEP20, or other networks.",
      "After payment, wait for confirmation or contact support.",
    ],
  },
];

export function getTutorialBySlug(slug: string) {
  return tutorials.find((item) => item.slug === slug);
}
