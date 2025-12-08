import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { ADMIN_MORE_LINKS } from "@/constant";
import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Dispatch, ReactNode, SetStateAction, JSX } from "react";
import { IconType } from "react-icons/lib";

interface Props {
  isMoreOpen: boolean;
  setIsMoreOpen: Dispatch<SetStateAction<boolean>>;
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
}

export const MoreButton = ({
  isMoreOpen,
  setIsMoreOpen,
  Icon,
  HideOnExpand,
  isExpand,
  label,
}: Props) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleMoreChange = (setitngsHref: string) => {
    router.push(setitngsHref);
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => setIsMoreOpen(!isMoreOpen)}
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
                {ADMIN_MORE_LINKS.map((item) => (
                  <MenubarItem key={item.id}>
                    <button
                      onClick={() => handleMoreChange(item.href)}
                      className={cn(
                        "w-full py-2 px-4 rounded-md text-sm flex items-center gap-2 cursor-pointer",
                        item.href === pathname
                          ? "bg-primary text-white"
                          : "bg-white/5 text-foreground hover:bg-white/10 transition-all"
                      )}
                    >
                      <span className="line-clamp-1">{item.label}</span>
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
            className={cn(isMoreOpen ? "rotate-180" : "rotate-0", "transition")}
          />
        </HideOnExpand>
      </button>
      {/* Settings */}
      <div
        className={cn(
          "pl-4 overflow-y-hidden transition-all overflow-hidden duration-150 ease-in-out",
          isMoreOpen ? "h-[160px]" : "h-0",
          isExpand && "hidden"
        )}
      >
        <div className="w-full bg-transparent border-l border-neutral-800 overflow-y-scroll h-full flex flex-col gap-2 px-3 py-2.5 sidebar-scrollbar">
          {ADMIN_MORE_LINKS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMoreChange(item.href)}
              className={cn(
                "w-full py-2 px-4 rounded-md text-sm flex items-center gap-2 cursor-pointer",
                item.href === pathname
                  ? "bg-primary text-white"
                  : "bg-white/5 text-gray-200 hover:bg-white/10 transition-all"
              )}
            >
              <HideOnExpand isExpand={isExpand}>
                <span className="line-clamp-1">{item.label}</span>
              </HideOnExpand>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
