/**
 * Official contact channels for Phikila / Omix Digital Solutions.
 * Single source of truth — import from here instead of hardcoding.
 *
 * NOTE: There is deliberately no @phikila.app email. All inbound mail
 * goes to omixsystems@gmail.com (general + security).
 */

export const CONTACTS = {
  publisher: "Omix Digital Solutions",
  website: "https://omixsystems.store",

  /** General inquiries AND security reports (one inbox for everything). */
  email: "omixsystems@gmail.com",
  mailto: "mailto:omixsystems@gmail.com",

  /** Local format, as dialled in Kenya. */
  phoneLocal: "0768 213 649",
  /** International format: +254 768 213 649 */
  phoneInternational: "+254 768 213 649",
  /** tel: URI */
  phoneTel: "tel:+254768213649",
  /** WhatsApp deep link (international format, no plus). */
  whatsapp: "https://wa.me/254768213649",
} as const;
