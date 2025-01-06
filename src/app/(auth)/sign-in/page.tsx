// src/app/(auth)/sign-in.tsx
"use client";

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { useForm, FormProvider } from "react-hook-form";
import Cookies from 'js-cookie';
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const schema = z.object({
  whatsapp: z.string().min(10, "Informe um número de WhatsApp válido"),
  password: z.string().min(8, "Informe a senha, mínimo 8 dígitos"),
});

const Form = FormProvider;
type FormData = z.infer<typeof schema>;

const SignIn = () => {
  const router = useRouter();
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      whatsapp: "",
      password: "",
    },
  });

  const onSubmit = form.handleSubmit(async (formData) => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const { token, role } = await response.json();
        localStorage.setItem('token', token);
        localStorage.setItem('userRole', role);
        
        Cookies.set('token', token, {
          expires: 1,
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });
        
        // Redireciona baseado no papel do usuário
        if (role === 'manager') {
          router.push('/salesControl');
        } else {
          router.push('/dashboard');
        }
      } else {
        const data = await response.json();
        alert(data.error || 'Erro ao fazer login');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      alert('Erro ao fazer login. Tente novamente.');
    }
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate p-4">
      <p className="text-xl text-blue-700 mb-5">Martins Poços Semi-Artesiano</p>
      <h1 className="text-3xl font-bold mb-10">Acesse sua conta</h1>

      <Form {...form}>
        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-4 w-full max-w-md"
        >
          <FormField
            control={form.control}
            name="whatsapp"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">WhatsApp</FormLabel>
                <FormControl>
                  <Input
                    placeholder="(99) 99999-9999"
                    {...field}
                    autoComplete="tel"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">Senha</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="********"
                    {...field}
                    autoComplete="current-password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="bg-blue-700 text-white text-lg font-semibold py-3 rounded-2xl hover:bg-blue-500 transition duration-300"
          >
            Entrar
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default SignIn;