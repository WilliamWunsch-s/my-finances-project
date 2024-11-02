import { CurrencyComboBox } from '@/components/CurrencyComboBox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { currentUser } from '@clerk/nextjs/server'
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react'

async function page() {
  
    const user = await currentUser();
    if (!user) {
        redirect("/sign-in")
    } 
  
    return <div className='container flex max-w-2xl flex-col items-center justify-between gap-4'>
        <div>
            <h1 className='text-center text-3xl'>
                Seja bem-vindo, <span className='ml-2 font-bold'>
                    {user.firstName}!
                </span>
            </h1>
            <h2 className='mt-4 text-center text-base text-muted-foreground'>Vamos começar configurando a sua moeda</h2>
            <h3 className='mt-2 text-center text-sm text-muted-foreground'> Você consegue trocar essa configuração a qualquer momento</h3>
        </div>
        <Separator />
        <Card className='w-full'>
            <CardHeader>
                <CardTitle>Moeda</CardTitle>
                <CardDescription>Defina a sua moeda padrão para transações</CardDescription>
            </CardHeader>   
            <CardContent>
                <CurrencyComboBox />
            </CardContent>         
        </Card>
        <Separator />
        <Button className='w-full' asChild>
            <Link href={"/"}>Estou pronto! Me leve para a dashboard</Link>
        </Button>
    </div>
  
}

export default page
