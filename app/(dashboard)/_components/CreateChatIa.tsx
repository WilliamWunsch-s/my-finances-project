"use client"

import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TransactionType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ReactNode, useCallback, useState } from "react"

interface Props {
    trigger: ReactNode;
    type: TransactionType;
}

import React from 'react'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateTransactionSchema, CreateTransactionSchemaType } from "@/schema/transaction";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import CategoryPicker from "./CategoryPicker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Loader2, PencilRuler } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateTransaction } from "../_actions/transactions";
import { toast } from "sonner";
import { DateToUTCDate } from "@/lib/helpers";

function CreateChatIa({ trigger, type }: Props) {
    const form = useForm<CreateTransactionSchemaType>({
        resolver: zodResolver(CreateTransactionSchema),
        defaultValues: {
            type,
            date: new Date(),
        },
    });
    const [open, setOpen] = useState(false);
    const handleCategoryChange = useCallback(
        (value: string) => {
            form.setValue("category", value);
        },
        [form]
    );

    const queryClient = useQueryClient();

    const { mutate, isPending } = useMutation({
        mutationFn: CreateTransaction,
        onSuccess: () => {
            toast.success("Transação criada com sucesso! 🎉", {
                id: "create-transaction",
            });

            form.reset({
                type,
                description: "",
                amount: 0,
                date: new Date(),
                category: undefined,
            });

            // After creating a transaction, we need to invalidate the overview query which will refetch data in the homepage
            queryClient.invalidateQueries({
                queryKey: ["overview"],
            });

            setOpen((prev) => !prev);
        },
    });

    const onSubmit = useCallback(
        (values: CreateTransactionSchemaType) => {
            toast.loading("Criando transição...", { id: "create-transaction" });

            mutate({
                ...values,
                date: DateToUTCDate(values.date),
            });
        },
        [mutate]
    );

    return <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            {trigger}
        </DialogTrigger>
        <DialogContent>
            <div className="flex justify-center items-center gap-2">
                <span>Em criação</span><PencilRuler size={16} strokeWidth={2} />
            </div>
            {/* <DialogHeader>
                <DialogTitle>
                    Crie uma nova transação de{""}
                    <span
                        className={cn(
                            "m-1",
                            type === "income" ? "text-emerald-500" : "text-red-500"
                        )}
                    >
                        {type === "income" ? 'renda' : 'despesa'}
                    </span>
                </DialogTitle>
            </DialogHeader>
            <Form {...form}>
                <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Descrição da transação</FormLabel>
                                <FormControl>
                                    <Input defaultValue={""} {...field} />
                                </FormControl>
                                <FormDescription>
                                    Descrição da transação
                                </FormDescription>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Valor</FormLabel>
                                <FormControl>
                                    <Input defaultValue={0} type="number" {...field} />
                                </FormControl>
                                <FormDescription>
                                    Valor da transação<span className="text-red-500">*</span>
                                </FormDescription>
                            </FormItem>
                        )}
                    />

                    <div className="flex items-center justify-between gap-2">
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Categoria</FormLabel>
                                    <FormControl>
                                        <CategoryPicker
                                            type={type}
                                            onChange={handleCategoryChange}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Selecione a categoria da transação<span className="text-red-500">*</span>
                                    </FormDescription>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Data</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-[200px] pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={(value) => {
                                                    if (!value) return;
                                                    field.onChange(value);
                                                }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormDescription>Selecione a data da transação<hr/><span className="text-[9px] font-bold">(como padrão selecionada a data atual)</span></FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>


                </form>
            </Form>
            <DialogFooter>
                <DialogClose asChild>
                    <Button
                        type="button"
                        variant={"secondary"}
                        onClick={() => {
                            form.reset();
                        }}
                    >
                        Cancelar
                    </Button>
                </DialogClose>
                <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
                    {!isPending && "Criar"}
                    {isPending && <Loader2 className="animate-spin" />}
                </Button>
            </DialogFooter> */}
        </DialogContent>
    </Dialog>
}

export default CreateChatIa
