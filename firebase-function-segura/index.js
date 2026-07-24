/**
 * getTicketByPublicIdSecure
 * ─────────────────────────
 * Substitui getTicketByPublicId com verificação de código postal no servidor.
 * O cliente nunca recebe dados se o codPostal não bater certo.
 *
 * Deploy:
 *   cd firebase-function-segura
 *   npm install
 *   firebase login
 *   firebase use sistema-fichas-tiempo-real
 *   firebase deploy --only functions:getTicketByPublicIdSecure
 */

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

if (!getApps().length) initializeApp();

function normalizePostal(p) {
  return String(p || "").replace(/[\s\-]/g, "").toUpperCase();
}

exports.getTicketByPublicIdSecure = onCall(
  { region: "us-central1", cors: true },
  async (request) => {
    const { ticketId, codPostal } = request.data || {};

    // Validação básica de input
    if (!ticketId || typeof ticketId !== "string" || ticketId.trim().length < 4) {
      throw new HttpsError("invalid-argument", "ticketId inválido.");
    }
    if (!codPostal || typeof codPostal !== "string" || codPostal.trim().length < 3) {
      throw new HttpsError("invalid-argument", "codPostal inválido.");
    }

    const db = getFirestore();
    const trimmedId = ticketId.trim();

    // Procura tickets com este ID público
    const snap = await db.collection("tickets")
      .where("id", "==", trimmedId)
      .get();

    if (snap.empty) {
      // Resposta vaga - não revela se o ticket existe (RGPD)
      return { found: false };
    }

    const normalizedInput = normalizePostal(codPostal);

    // Filtra pelo código postal - só passa se bater certo
    const verified = snap.docs
      .map(doc => doc.data())
      .filter(ticket => {
        if (!ticket.codPostal) return false; // sem postal = não passa
        return normalizePostal(ticket.codPostal) === normalizedInput;
      });

    if (verified.length === 0) {
      // Código postal errado - mesma resposta que "não encontrado"
      return { found: false };
    }

    if (verified.length === 1) {
      return { found: true, ticket: verified[0] };
    }

    // Múltiplos tickets com mesmo ID (sufixos " 2", " 3", etc.)
    return {
      found: true,
      multiple: true,
      tickets: verified.map(t => ({ ...t, totalRelated: verified.length })),
    };
  }
);
