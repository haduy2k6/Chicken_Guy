"use client";

import { Button, Dropdown, Label } from "@heroui/react";
import { Link, useRouter } from "@/src/i18n/routing";
import type { MenuOption, MultiOptions, SingleOptions } from "./Menu";

export function MenuOptions({ data }: { data: MenuOption[] }) {
  return (
    <nav className="hidden md:flex items-center gap-2 lg:gap-4">
      {data.map((obj) =>
        "listOptions" in obj ? (
          <MultiOptionsComponent key={obj.buttonName} {...obj} />
        ) : (
          <SingleOption key={obj.href} {...obj} />
        )
      )}
    </nav>
  );
}

function SingleOption({ href, buttonName }: SingleOptions) {
  return (
    <Link
      href={href}
      className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-stone-100 transition-colors"
    >
      {buttonName}
    </Link>
  );
}

function MultiOptionsComponent({ buttonName, listOptions }: MultiOptions) {
  const router = useRouter(); 

  return (
    <Dropdown>
      <Button variant="secondary">{buttonName}</Button>
      <Dropdown.Popover>
        <Dropdown.Menu onAction={(key) => router.push(String(key))}>
          {listOptions.map((val) => (
            <Dropdown.Item key={val.href} id={val.href} textValue={val.buttonChild}>
              <Label>{val.buttonChild}</Label>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}