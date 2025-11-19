export type UserPros = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: "admin" | "member";
  createdAt: Date;
};
