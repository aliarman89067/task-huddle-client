import { Dispatch, JSX, ReactNode, SetStateAction } from "react";
import { cn } from "@/lib/utils";
import { FaQuestion } from "react-icons/fa";
import { ChevronDownIcon, Loader2, PlusIcon, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { IconType } from "react-icons/lib";
import { usePathname, useRouter } from "next/navigation";
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarItem,
  MenubarContent,
} from "@/components/ui/menubar";
import Image from "next/image";
import { organizationStore } from "@/zustand/member.store";

interface Props {
  setIsOrganizationOpen: Dispatch<SetStateAction<boolean>>;
  isOrganizationOpen: boolean;
  Icon: IconType;
  HideOnExpand: ({
    isExpand,
    children,
  }: {
    isExpand: boolean;
    children: ReactNode;
  }) => JSX.Element;
  isExpand: boolean;
  label: string;
  isOrganizationPending: boolean;
  organizationData: any;
}

export const OrganizationButton = ({
  isOrganizationOpen,
  setIsOrganizationOpen,
  HideOnExpand,
  Icon,
  isExpand,
  label,
  isOrganizationPending,
  organizationData,
}: Props) => {
  const router = useRouter();

  const { selectedOrganizationId, setOrganizationId } = organizationStore();

  const handleOrganizationChange = (id: string) => {
    setOrganizationId(id);
    router.push(`/dashboard/organizations/${id}`);
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => setIsOrganizationOpen(!isOrganizationOpen)}
        className={cn(
          "w-full rounded-md bg-transparent hover:bg-white/10 transition-all text-gray-200 cursor-pointer text-sm flex items-center justify-between",
          isExpand ? "py-0 px-0" : "py-2.5 px-4"
        )}
      >
        <div className="flex gap-2">
          <Menubar className="bg-transparent border-none outline-0 p-0 m-0 h-fit">
            <MenubarMenu>
              <MenubarTrigger
                disabled={!isExpand}
                className="flex items-center justify-center bg-transparent p-0 m-0 focus:bg-transparent data-[state=open]:bg-transparent"
              >
                <button className={cn(isExpand ? "py-2.5 px-4" : "py-0 px-0")}>
                  <Icon className="size-5 text-gray-200" />
                </button>
              </MenubarTrigger>
              <MenubarContent className="w-full max-h-[250px] overflow-y-scroll sidebar-scrollbar">
                {organizationData?.map((item: any) => (
                  <MenubarItem key={item.id}>
                    <button
                      onClick={() => handleOrganizationChange(item.id)}
                      className={cn(
                        "w-full py-2 px-4 rounded-md text-sm flex items-center gap-2 cursor-pointer",
                        item.id === selectedOrganizationId
                          ? "bg-primary text-white"
                          : "bg-white/5 text-foreground hover:bg-white/10 transition-all"
                      )}
                    >
                      <Image
                        src={item.imageUrl}
                        alt={`${item.name} image`}
                        width={20}
                        height={20}
                        className="object-contain"
                      />
                      <span className="line-clamp-1">{item.name}</span>
                    </button>
                  </MenubarItem>
                ))}
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
          <HideOnExpand isExpand={isExpand}>{label}</HideOnExpand>
        </div>
        <HideOnExpand isExpand={isExpand}>
          <ChevronDownIcon
            size={16}
            className={cn(
              isOrganizationOpen ? "rotate-180" : "rotate-0",
              "transition"
            )}
          />
        </HideOnExpand>
      </button>
      {/* Organizations */}
      <div
        className={cn(
          "pl-4 overflow-y-hidden transition-all overflow-hidden duration-150 ease-in-out",
          isOrganizationOpen ? "h-[160px]" : "h-0",
          isExpand && "hidden"
        )}
      >
        {isOrganizationPending ? (
          <div className="flex items-center justify-center gap-1">
            <Loader2 className="size-4 text-neutral-500 animate-spin" />
            <span>Loading...</span>
          </div>
        ) : (
          <div className="w-full bg-transparent border-l border-neutral-800 overflow-y-scroll h-full flex flex-col gap-2 px-3 py-2.5 sidebar-scrollbar">
            {organizationData?.length === 0 && (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                <FaQuestion className="size-10 text-gray-400" />
                <p className="text-gray-400 text-sm">
                  you have no <br /> organization.
                </p>
              </div>
            )}
            {organizationData.map((item: any) => (
              <button
                key={item.id}
                onClick={() => handleOrganizationChange(item.id)}
                className={cn(
                  "w-full py-2 px-4 rounded-md text-sm flex items-center gap-2 cursor-pointer",
                  item.id === selectedOrganizationId
                    ? "bg-primary text-white"
                    : "bg-white/5 text-gray-200 hover:bg-white/10 transition-all"
                )}
              >
                <Image
                  src={item.imageUrl}
                  alt={`${item.name} image`}
                  width={20}
                  height={20}
                  className="object-contain"
                />
                <HideOnExpand isExpand={isExpand}>
                  <span className="text-start whitespace-nowrap">
                    {item.name.substring(0, 15)}...
                  </span>
                </HideOnExpand>
              </button>
            ))}
            <Button
              onClick={() => router.push("/dashboard/create-organization")}
              variant="default"
              className="w-full text-xs py-2 mt-auto bg-white hover:bg-white text-foreground"
            >
              Create Organization <PlusIcon size={15} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
