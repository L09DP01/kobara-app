"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";

export async function acceptInviteAction(token: string, password?: string) {
  try {
    const supabase = createAdminClient();

    // Verify token
    const { data: member, error } = await supabase
      .from('merchant_members')
      .select('id, email, status, merchant_id')
      .eq('id', token)
      .single();

    if (error || !member) throw new Error("Invitation invalide.");
    if (member.status === 'active') throw new Error("Invitation déjà acceptée.");

    // Check user
    const { data: user } = await supabase.from('users').select('id').eq('email', member.email).maybeSingle();
    let userId = user?.id;

    if (!user) {
      if (!password) throw new Error("Le mot de passe est requis pour créer votre compte.");
      if (password.length < 8) throw new Error("Le mot de passe doit faire au moins 8 caractères.");

      const password_hash = await bcrypt.hash(password, 10);
      
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email: member.email,
          password_hash,
          role: 'user'
        })
        .select('id')
        .single();

      if (createError) throw new Error("Erreur lors de la création du compte.");
      userId = newUser.id;
    }

    // Activate member
    const { error: updateError } = await supabase
      .from('merchant_members')
      .update({
        status: 'active',
        user_id: userId
      })
      .eq('id', token);

    if (updateError) throw new Error("Erreur lors de l'activation du compte.");

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
