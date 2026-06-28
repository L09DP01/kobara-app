import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

export interface ParsedNatcashSMS {
  amount: number | null;
  currency: string | null;
  senderName: string | null;
  senderPhone: string | null;
  date: string | null;
  time: string | null;
  referenceCode: string | null;
  balance: number;
  transCode: string;
}

export async function parseNatcashSMS(rawMessage: string): Promise<ParsedNatcashSMS | null> {
  try {
    const { object } = await generateObject({
      model: google('gemini-1.5-pro'),
      schema: z.object({
        amount: z.number().nullable().describe("Le montant transféré, sans la devise ni les virgules"),
        currency: z.string().nullable().describe("La devise, ex: HTG"),
        senderName: z.string().nullable().describe("Le nom de l'expéditeur, ex: WILKENS FLEURINORD"),
        senderPhone: z.string().nullable().describe("Le numéro de téléphone de l'expéditeur"),
        date: z.string().nullable().describe("La date de la transaction au format JJ/MM/AAAA"),
        time: z.string().nullable().describe("L'heure de la transaction au format HH:MM"),
        referenceCode: z.string().nullable().describe("Le contenu ou code de référence, ex: 3327 ou KBR7M2X9. Null si non trouvé."),
        balance: z.number().describe("Le nouveau solde du compte après transfert, sans virgules"),
        transCode: z.string().describe("Le code de transaction unique ou TransCode, ex: 26062687621075")
      }),
      prompt: `Extrais les informations de ce SMS de transfert NatCash Haïti. 
      ATTENTION : Le message peut contenir des erreurs d'encodage (ex: "re??u" au lieu de "reçu", caractères bizarres) ou être tronqué (se terminant par "...").
      Ignore ces erreurs et extrais le maximum de données. S'il manque des informations, mets simplement null.
      S'il s'agit d'un message qui n'a absolument rien à voir avec NatCash, lève une erreur.
      
      Message brut :
      "${rawMessage}"`
    });

    return object as ParsedNatcashSMS;
  } catch (error) {
    console.error("Erreur de parsing IA SMS:", error);
    return null;
  }
}
