"use server"

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function login(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect('/login?error=' + error.message)
  }

  revalidatePath('/dashboard', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const businessName = formData.get('business_name') as string

  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        business_name: businessName,
      }
    }
  })

  if (signUpError) {
    redirect('/register?error=' + signUpError.message)
  }

  if (authData.user) {
    // Generate a unique slug
    const slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000)
    
    const { error: merchantError } = await supabase.from('merchants').insert({
      user_id: authData.user.id,
      business_name: businessName,
      business_slug: slug,
      email: email,
    })

    if (merchantError) {
      console.error("Merchant Creation Error:", merchantError)
      redirect('/register?error=Account created but merchant profile failed')
    }
  }

  revalidatePath('/dashboard', 'layout')
  redirect('/dashboard')
}

export async function logout() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  await supabase.auth.signOut()
  redirect('/login')
}
