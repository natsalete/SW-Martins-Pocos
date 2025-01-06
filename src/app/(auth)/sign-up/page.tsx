//sign-up
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { useForm, FormProvider } from "react-hook-form";
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
import { Separator } from "@/components/ui/separator";

const schema = z.object({
  name: z.string().min(1, "Informe seu nome completo"),
  whatsapp: z.string().min(10, "Informe um número de WhatsApp válido"),
  password: z.string().min(8, "Informe a senha, mínimo 8 dígitos"),
});

const Form = FormProvider;
type FormData = z.infer<typeof schema>;

const SignUp = () => {
  const router = useRouter();
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      whatsapp: "",
      password: "",
    },
  });
  
  useEffect(() => {
    const pendingData = sessionStorage.getItem('pendingServiceRequest');
    if (pendingData) {
      const { whatsapp } = JSON.parse(pendingData);
      form.setValue('whatsapp', whatsapp);
    }
  }, [form]);

  const onSubmit = form.handleSubmit(async (formData) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        router.push('/sign-in');
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
    }
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate p-4">
      <p className="text-xl text-blue-700 mb-5">Martins Poços Semi-Artesiano</p>
      <h1 className="text-3xl font-bold mb-2">Crie sua conta</h1>

      <Form {...form}>
        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-4 w-full max-w-md mt-10"
        >
          <Separator className="mt-5 mb-3" />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">Nome Completo</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Martins Poços Silva"
                    {...field}
                    autoComplete="name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
            Cadastrar
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default SignUp;