"use client";
import { LoadingScreen } from "@/components/loading-screen";
import OrganizationInfo from "@/components/organization-info";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { axiosInstance } from "@/lib/axios-instance";
import { useGetAdminOrganization } from "@/lib/common-query";
import { cn, getServerError } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { NoOrganization, tags } from "@/constant";
import {
  CreateProjectFormSchema,
  CreateProjectFormSchemaType,
} from "@/lib/schema";
import { useRouter, useSearchParams } from "next/navigation";
import { EmptyOrganization } from "@/components/empty-organization";
import { ErrorCard } from "@/components/error-card";

interface Props {
  id: string;
}

export const CreateProjectPageView = ({ id }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState("");
  const { data, error, isPending, isSuccess, refetch } =
    useGetAdminOrganization({
      id,
      isMember: true,
    });
  // Mutations
  const mutation = useMutation({
    mutationFn: async (
      data: CreateProjectFormSchemaType & { organizationId: string }
    ) => {
      const res = await axiosInstance.post("/admin/projects", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Project assigned successfully");
      router.replace("/dashboard/projects");
    },
    onError: (error: any) => {
      getServerError({ error, setServerError });
    },
  });

  const inputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<CreateProjectFormSchemaType>({
    resolver: zodResolver(CreateProjectFormSchema),
    defaultValues: {
      members: [],
      deadline: "",
      tags: [],
      description: "",
      title: "",
    },
  });

  useEffect(() => {
    refetch();
  }, []);

  useEffect(() => {
    const defaultMember = searchParams.get("memberId");
    if (defaultMember) {
      form.reset({
        members: [defaultMember],
      });
    }
  }, [searchParams]);

  const onSubmit = async (data: CreateProjectFormSchemaType) => {
    mutation.mutate({ ...data, organizationId: id });
  };
  // const defaultMember = searchParams.get("memberId");

  if (isPending || !data) {
    return <LoadingScreen />;
  }
  if (error && !isSuccess) {
    if (error === NoOrganization) {
      return <EmptyOrganization />;
    } else {
      return <ErrorCard title="Oops!!" description={error} />;
    }
  }

  return (
    <section className="flex flex-col">
      <OrganizationInfo title={data.name} />
      <div className="w-full mt-5 flex flex-col">
        <div className="max-w-2xl w-full mx-auto">
          <h1 className="text-neutral-800 font-bold font-sansitia text-2xl">
            Assign Project
          </h1>
          <p className="text-base text-neutral-600">
            Assign a project by selecting one or more members, entering a
            project title and description, and choosing a deadline.
          </p>
          <div className="flex flex-col mt-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="members"
                  render={({ field }) => {
                    const [isOpen, setIsOpen] = useState(false);
                    return (
                      <FormItem>
                        <FormLabel>Select Members</FormLabel>
                        <FormControl>
                          <Popover open={isOpen} onOpenChange={setIsOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                className="justify-between text-neutral-500 hover:text-neutral-600"
                              >
                                Select members...
                                <ChevronsUpDown className="opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              align="start"
                              className="w-[300px] p-0"
                            >
                              <Command>
                                <CommandInput
                                  placeholder="Search members..."
                                  className="h-9"
                                />
                                <CommandList>
                                  <CommandEmpty>No member found.</CommandEmpty>
                                  <CommandGroup>
                                    {data?.members?.map(
                                      (member: any, index: number) => (
                                        <CommandItem
                                          key={index}
                                          value={member.member.id}
                                          onSelect={(currentValue) => {
                                            const isInclude = field.value.find(
                                              (item) => item === currentValue
                                            );
                                            if (isInclude) {
                                              const updatedMembers =
                                                field.value.filter(
                                                  (item) =>
                                                    item !== currentValue
                                                );
                                              form.setValue(
                                                "members",
                                                updatedMembers,
                                                {
                                                  shouldValidate: true,
                                                }
                                              );
                                            } else {
                                              const updatedMembers = [
                                                ...field.value,
                                                currentValue,
                                              ];
                                              form.setValue(
                                                "members",
                                                updatedMembers,
                                                {
                                                  shouldValidate: true,
                                                }
                                              );
                                            }
                                            setIsOpen(false);
                                          }}
                                        >
                                          {member.member.name}
                                          <Check
                                            className={cn(
                                              "ml-auto",
                                              field.value.includes(
                                                member.member.id
                                              )
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                          />
                                        </CommandItem>
                                      )
                                    )}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </FormControl>
                        <div className="flex gap-4 flex-wrap">
                          {field.value.map((memberId, index) => {
                            const member = data?.members?.find(
                              (item: any) => item?.member?.id === memberId
                            );
                            if (!member) return;
                            return (
                              <div
                                key={index}
                                className="relative bg-neutral-200 rounded-md px-4 py-2 flex items-center gap-2"
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedMembers = field.value.filter(
                                      (item) => item !== memberId
                                    );
                                    form.setValue("members", updatedMembers, {
                                      shouldValidate: true,
                                    });
                                  }}
                                  className="w-4 h-4 bg-rose-500 flex items-center justify-center rounded-full absolute -top-1 -left-1 cursor-pointer"
                                >
                                  <XIcon className="text-white size-3" />
                                </button>
                                <span className="text-neutral-600 text-sm">
                                  {member.member.name}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => {
                    const [isOpen, setIsOpen] = useState(false);
                    return (
                      <FormItem>
                        <FormLabel>Select Tags (optional)</FormLabel>
                        <FormControl>
                          <Popover open={isOpen} onOpenChange={setIsOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                className="justify-between text-neutral-500 hover:text-neutral-600"
                              >
                                Select tags...
                                <ChevronsUpDown className="opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              align="start"
                              className="w-[300px] p-0"
                            >
                              <Command>
                                <CommandInput
                                  placeholder="Search tags..."
                                  className="h-9"
                                />
                                <CommandList>
                                  <CommandEmpty>No tag found.</CommandEmpty>
                                  <CommandGroup>
                                    {tags.map((tag, index) => (
                                      <CommandItem
                                        key={index}
                                        value={tag}
                                        onSelect={(currentValue) => {
                                          const isInclude = field.value.find(
                                            (item) => item === currentValue
                                          );
                                          if (isInclude) {
                                            const updatedTags =
                                              field.value.filter(
                                                (item) => item !== currentValue
                                              );

                                            form.setValue("tags", updatedTags, {
                                              shouldValidate: true,
                                            });
                                          } else {
                                            if (field.value.length >= 3) {
                                              form.setError("tags", {
                                                message:
                                                  "You can't add more than 3 tags!",
                                              });
                                              return;
                                            }
                                            const updatedTags = [
                                              ...field.value,
                                              currentValue,
                                            ];

                                            form.setValue("tags", updatedTags, {
                                              shouldValidate: true,
                                            });
                                          }
                                          setIsOpen(false);
                                        }}
                                      >
                                        {tag}
                                        <Check
                                          className={cn(
                                            "ml-auto",
                                            field.value.includes(tag)
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </FormControl>
                        <div className="flex gap-4 flex-wrap">
                          {field.value.map((tag, index) => {
                            const member = tags.find((item) => item === tag);
                            if (!member) return;
                            return (
                              <div
                                key={index}
                                className="relative bg-neutral-200 rounded-md px-4 py-2 flex items-center gap-2"
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedTags = field.value.filter(
                                      (item) => item !== tag
                                    );
                                    form.setValue("tags", updatedTags, {
                                      shouldValidate: true,
                                    });
                                  }}
                                  className="w-4 h-4 bg-rose-500 flex items-center justify-center rounded-full absolute -top-1 -left-1 cursor-pointer"
                                >
                                  <XIcon className="text-white size-3" />
                                </button>
                                <span className="text-neutral-600 text-sm">
                                  {tag}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DeadLine</FormLabel>
                      <FormControl>
                        <div
                          onClick={() => inputRef.current?.showPicker?.()}
                          className="relative"
                        >
                          <Input
                            ref={inputRef}
                            type="date"
                            value={field.value}
                            className="cursor-pointer"
                            onChange={field.onChange}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {serverError && (
                  <p className="text-sm text-rose-500 my-1">{serverError}</p>
                )}
                <Button
                  disabled={mutation.isPending}
                  className="bg-green-500 hover:bg-green-600"
                >
                  {mutation.isPending ? "Assigning..." : "Assign"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
};
