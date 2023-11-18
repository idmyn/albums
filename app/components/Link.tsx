import { Link as RadixLink } from "@radix-ui/themes";
import { Link as RemixLink } from "@remix-run/react";
import { ComponentProps } from "react";

type LinkProps = ComponentProps<typeof RadixLink> & {
  to: string;
};

export const Link = ({ to, children, ...rest }: LinkProps) => {
  return (
    <RadixLink {...rest} asChild>
      <RemixLink to={to}>{children}</RemixLink>
    </RadixLink>
  );
};
