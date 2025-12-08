import z from "zod";

export const CreateProjectFormSchema = z.object({
  members: z
    .array(z.string({ message: "Member is required!" }))
    .min(1, { message: "At least 1 member is required!" }),
  title: z
    .string({ message: "title is required!" })
    .min(1, { message: "Project title is required!" }),
  description: z.string(),
  tags: z
    .array(z.string({ message: "Tag is required!" }))
    .max(3, { message: "You can't add more than 3 tags!" }),
  deadline: z
    .string({ message: "Dead line is required!" })
    .min(1, { message: "Project deadline is required!" }),
});

export type CreateProjectFormSchemaType = z.infer<
  typeof CreateProjectFormSchema
>;

export const UpdateProjectFormSchema = z.object({
  members: z
    .array(z.string({ message: "Member is required!" }))
    .min(1, { message: "At least 1 member is required!" }),
  title: z
    .string({ message: "title is required!" })
    .min(1, { message: "Project title is required!" }),
  description: z.string(),
  tags: z
    .array(z.string({ message: "Tag is required!" }))
    .max(3, { message: "You can't add more than 3 tags!" }),
  deadline: z
    .string({ message: "Dead line is required!" })
    .min(1, { message: "Project deadline is required!" }),
  status: z
    .string({ message: "Status is required!" })
    .min(1, { message: "Status is required!" }),
  percentage: z
    .number()
    .min(0, { message: "Negative percentage not allowed!" })
    .max(100, {
      message: "Percentage reached to 100. You can't increase more!",
    }),
});

export type UpdateProjectFormSchemaType = z.infer<
  typeof UpdateProjectFormSchema
>;

export const UpdateProjectMemberFormSchema = z.object({
  status: z
    .string({ message: "Status is required!" })
    .min(1, { message: "Status is required!" }),
  percentage: z
    .number()
    .min(0, { message: "Negative percentage not allowed!" })
    .max(100, {
      message: "Percentage reached to 100. You can't increase more!",
    }),
});

export type UpdateProjectMemberFormSchemaType = z.infer<
  typeof UpdateProjectMemberFormSchema
>;

export type Breaks = {
  id: string;
  type: "BreakIn" | "BreakOut";
  breakInTime: Date;
  breakOutTime: Date;
}[];

export type ResponseType = {
  id: string;
  type?: string;
  createdAt: Date;
  checkInTime?: Date | null;
  checkOutTime?: Date | null;
  isCheckInLate?: boolean;
  isCheckOutEarly?: boolean;
  checkInDifference?: number | null;
  checkOutDifference?: number | null;
  checkInMessage?: string | null;
  checkOutMessage?: string | null;
  isGrace?: boolean;
  reason?: string | null;
  leaveDate?: Date | null;
  breaks: Breaks;
  isUpdate: boolean;
  member: {
    id: string;
    email: string;
    name: string;
    image: string | null;
    info: {
      designation: string;
    }[];
  };
};
