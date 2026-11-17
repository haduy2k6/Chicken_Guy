"use client";

import { Button, Dropdown, Label } from "@heroui/react";
import { useRouter } from "@/src/i18n/routing";
import type { MultiOptions, SingleOptions } from "./Menu";

export function MenuMobileOptions({ multi, single }: { multi: MultiOptions; single: SingleOptions[] }) {
  const router = useRouter(); // gọi hook ở đây, ngoài mọi callback

  const go = (key: React.Key) => {
    router.push(String(key)); // chỉ DÙNG router trong callback
  };

  return (
    <nav className="flex md:hidden items-center gap-2 lg:gap-4">
      <Dropdown>
        <Button variant="secondary">Menu</Button>
        <Dropdown.Popover>
          <Dropdown.Menu onAction={go}>
            {single.map((val) => (
              <Dropdown.Item key={val.href} id={val.href} textValue={val.buttonName}>
                <Label>{val.buttonName}</Label>
              </Dropdown.Item>
            ))}

            <Dropdown.SubmenuTrigger>
              <Dropdown.Item id="specialties-submenu" textValue={multi.buttonName}>
                <Label>{multi.buttonName}</Label>
                <Dropdown.SubmenuIndicator />
              </Dropdown.Item>
              <Dropdown.Popover>
                <Dropdown.Menu onAction={go}>
                  {multi.listOptions.map((val) => (
                    <Dropdown.Item key={val.href} id={val.href} textValue={val.buttonChild}>
                      <Label>{val.buttonChild}</Label>
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown.SubmenuTrigger>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
    </nav>
  );
}