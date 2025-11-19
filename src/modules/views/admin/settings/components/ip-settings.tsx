import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { axiosInstance } from "@/lib/axios-instance";
import { cn } from "@/lib/utils";
import { organizationStore } from "@/zustand/member.store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

type ResponseType = {
  ips: string[];
  rules: string[];
  ipRule: "ANYWHERE" | "LIMITED";
};

const formSchema = z.object({
  ips: z.array(z.string()).min(1, { message: "Add atleast 1 IP" }),
  rules: z
    .array(
      z.object({
        label: z.string(),
        rule: z.string(),
      })
    )
    .min(1, { message: "Select atleast 1 rule" }),
});

type FormSchemaType = z.infer<typeof formSchema>;

const rules = [
  {
    label: "Check In/Out",
    rule: "CHECKINOUT",
  },
  {
    label: "Chat Send",
    rule: "CHATSEND",
  },
  {
    label: "Project Update",
    rule: "PROJECTUPDATE",
  },
  {
    label: "Update Member Profile",
    rule: "UPDATEMEMBERPROFILE",
  },
];

export const IPSettings = () => {
  const router = useRouter();
  const { selectedOrganizationId } = organizationStore();

  const [isAnyWhere, setIsAnyWhere] = useState(true);
  const [isAll, setIsAll] = useState(false);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ips: [],
      rules: [],
    },
  });

  // Queries
  const { data } = useQuery({
    queryKey: ["get-ip-settings"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/admin/organizations/ip-settings/${selectedOrganizationId}`
      );
      return res.data as ResponseType;
    },
  });

  useEffect(() => {
    if (data) {
      const formattedRules = rules.filter((item) =>
        data.rules.includes(item.rule)
      );
      setIsAnyWhere(data.ipRule === "ANYWHERE");
      form.setValue("rules", formattedRules);
      form.setValue("ips", data.ips);
      if (formattedRules.length === rules.length) {
        setIsAll(true);
      }
    }
  }, [data, router]);

  //   Mutations
  const currentIPMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      return data.ip;
    },
    onSuccess: (currentIp: string) => {
      const prevIps = form.getValues("ips");
      const isExisting = prevIps.find((ip) => ip === currentIp);
      if (!isExisting) {
        const updatedIPs = [...prevIps, currentIp];
        form.setValue("ips", updatedIPs, { shouldValidate: true });
      }
    },
    onError: () => {
      toast.error("Something went wrong please try again!");
    },
  });
  const anyWhereMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.post(
        "/admin/organizations/allow-anywhere",
        {
          organizationId: selectedOrganizationId,
        }
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success("IP settings updated successfully");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message = error.response?.data.message;
      toast.error(message);
    },
  });
  const ipSettingsMutation = useMutation({
    mutationFn: async (data: FormSchemaType) => {
      const res = await axiosInstance.post("/admin/organizations/ip-rules", {
        ips: data.ips,
        rules: data.rules,
        organizationId: selectedOrganizationId,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("IP settings updated successfully");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message = error.response?.data.message;
      toast.error(message);
    },
  });

  const handleRemoveIP = (index: number) => {
    const updatedIps = form.getValues("ips").filter((_, i) => i !== index);
    form.setValue("ips", updatedIps, {
      shouldValidate: true,
    });
  };

  const handleChangeIP = (value: string, index: number) => {
    const updatedIps = form.getValues("ips").map((item, i) => {
      if (i === index) {
        return value;
      } else {
        return item;
      }
    });
    form.setValue("ips", updatedIps, { shouldValidate: true });
  };

  const isRuleChecked = (rule: string) => {
    return !!form.getValues("rules").find((item) => item.rule === rule);
  };

  const handleRuleChange = (rule: string, label: string) => {
    const rules = form.getValues("rules");
    const isExist = rules.find((item) => item.rule === rule);
    if (isExist) {
      const updatedRules = [...rules.filter((item) => item.rule !== rule)];
      form.setValue("rules", updatedRules, { shouldValidate: true });
    } else {
      const updatedRules = [...rules, { rule, label }];
      form.setValue("rules", updatedRules, { shouldValidate: true });
    }
  };

  const handleChangeAll = () => {
    if (isAll) {
      setIsAll(false);
      form.setValue("rules", [], { shouldValidate: true });
    } else {
      setIsAll(true);
      form.setValue("rules", rules, { shouldValidate: true });
    }
  };

  const onSubmit = (data: FormSchemaType) => {
    ipSettingsMutation.mutate(data);
  };

  return (
    <div className="flex flex-col mt-4 pl-4 pb-10">
      <h1 className="text-neutral-700 font-semibold font-sansitia text-xl">
        Update IP's Settings
      </h1>
      <div className="flex flex-col mt-2 gap-2">
        <label className="flex items-center gap-2 w-fit cursor-pointer">
          <Checkbox
            className="border-neutral-500"
            checked={isAnyWhere}
            onCheckedChange={() => setIsAnyWhere(!isAnyWhere)}
          />
          <span className="text-neutral-700 text-sm">Allow from anywhere</span>
        </label>
        <div className="flex flex-col gap-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
              <div
                className={cn(
                  "flex flex-col gap-2",
                  isAnyWhere
                    ? "pointer-events-none select-none opacity-60 cursor-not-allowed"
                    : "pointer-events-auto select-auto opacity-100"
                )}
              >
                <h1 className="text-neutral-700 font-semibold font-sansitia text-xl">
                  Allowed IP's
                </h1>
                <Button
                  onClick={() => currentIPMutation.mutate()}
                  disabled={currentIPMutation.isPending}
                  type="button"
                  size="sm"
                  className="w-fit bg-green-500 hover:bg-green-600"
                >
                  Add my current IP
                </Button>
                <FormField
                  control={form.control}
                  name="ips"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex flex-col gap-2">
                          {field.value.map((ip, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <Input
                                value={ip}
                                onChange={(e) =>
                                  handleChangeIP(e.target.value, index)
                                }
                              />
                              <Button
                                onClick={() => handleRemoveIP(index)}
                                className="bg-rose-400 hover:bg-rose-500 rounded-sm"
                                size="sm"
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => {
                              field.onChange([...field.value, ""]);
                            }}
                            className="w-fit"
                          >
                            Add one more IP <PlusIcon className="size-3" />
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <h1 className="text-neutral-700 font-semibold font-sansitia text-xl">
                  Restricted Actions
                </h1>
                <FormField
                  control={form.control}
                  name="rules"
                  render={() => (
                    <FormItem>
                      <FormControl>
                        <div className="flex flex-col gap-2">
                          <label className="flex items-center gap-2 w-fit cursor-pointer">
                            <Checkbox
                              className="border-neutral-500"
                              checked={isAll}
                              onCheckedChange={handleChangeAll}
                            />
                            <span className="text-neutral-700 text-sm">
                              All
                            </span>
                          </label>
                          {rules.map((rule, index) => (
                            <label
                              key={index}
                              className="flex items-center gap-2 w-fit cursor-pointer"
                            >
                              <Checkbox
                                className="border-neutral-500"
                                checked={isRuleChecked(rule.rule)}
                                onCheckedChange={() =>
                                  handleRuleChange(rule.rule, rule.label)
                                }
                              />
                              <span className="text-neutral-700 text-sm">
                                {rule.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {isAnyWhere ? (
                <Button type="button" onClick={() => anyWhereMutation.mutate()}>
                  Update
                </Button>
              ) : (
                <Button type="submit">Update</Button>
              )}
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};
