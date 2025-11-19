import { Dispatch, JSX, SetStateAction } from "react";
import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode } from "react";
import { IconType } from "react-icons/lib";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { ADMIN_SETTINGS_LINKS } from "@/constant";

interface Props {
  setIsSettingsOpen: Dispatch<SetStateAction<boolean>>;
  isSettingsOpen: boolean;
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

export const SettingsButton = ({
  setIsSettingsOpen,
  isSettingsOpen,
  Icon,
  HideOnExpand,
  isExpand,
  label,
}: Props) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleSettingChange = (setitngsHref: string) => {
    router.push(setitngsHref);
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
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
                {ADMIN_SETTINGS_LINKS.map((item) => (
                  <MenubarItem key={item.id}>
                    <button
                      onClick={() => handleSettingChange(item.href)}
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
            className={cn(
              isSettingsOpen ? "rotate-180" : "rotate-0",
              "transition"
            )}
          />
        </HideOnExpand>
      </button>
      {/* Settings */}
      <div
        className={cn(
          "pl-4 overflow-y-hidden transition-all overflow-hidden duration-150 ease-in-out",
          isSettingsOpen ? "h-[160px]" : "h-0",
          isExpand && "hidden"
        )}
      >
        <div className="w-full bg-transparent border-l border-neutral-800 overflow-y-scroll h-full flex flex-col gap-2 px-3 py-2.5 sidebar-scrollbar">
          {ADMIN_SETTINGS_LINKS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSettingChange(item.href)}
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
