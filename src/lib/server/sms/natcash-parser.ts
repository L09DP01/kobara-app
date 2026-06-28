import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

export interface ParsedNatcashSMS {
  amount: number;
  currency: string;
  senderName: string;
  senderPhone: string;
  date: string;
  time: string;
  referenceCode: string | null;
  balance: number;
  transCode: string;
}

export async function parseNatcashSMS(rawMessage: string): Promise<ParsedNatcashSMS | null> {
  try {
    const { object } = await generateObject({
      model: google('gemini-2.5-pro'),
      schema: z.object({
        amount: z.number().describe("Le montant transféré, sans la devise ni les virgules"),
        currency: z.string().describe("La devise, ex: HTG"),
        senderName: z.string().describe("Le nom de l'expéditeur, ex: WILKENS FLEURINORD"),
        senderPhone: z.string().describe("Le numéro de téléphone de l'expéditeur"),
        date: z.string().describe("La date de la transaction au format JJ/MM/AAAA"),
        time: z.string().describe("L'heure de la transaction au format HH:MM"),
        referenceCode: z.string().nullable().describe("Le contenu ou code de référence, ex: 3327 ou KBR7M2X9. Null si non trouvé."),
        balance: z.number().describe("Le nouveau solde du compte après transfert, sans virgules"),
        transCode: z.string().describe("Le code de transaction unique ou TransCode, ex: 26062687621075")
      }),
      prompt: `Extrais les informations de ce SMS de transfert NatCash Haïti. 
      S'il manque des informations non cruciales, essaie de les déduire ou mets null.
      S'il s'agit d'un message qui n'est manifestement pas un reçu de transfert NatCash, lève une erreur.
      
      Message brut :
      "${rawMessage}"`
    });

    return object as ParsedNatcashSMS;
  } catch (error) {
    console.error("Erreur de parsing IA SMS:", error);
    return null;
  }
}
