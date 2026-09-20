import * as React from "react";

import { Input } from "@/components/ui/input";

export type InputTextProps = React.ComponentPropsWithoutRef<"input">;

const InputText = React.forwardRef<HTMLInputElement, InputTextProps>(
  function InputText(props, ref) {
    return <Input ref={ref} {...props} />;
  },
);

export { InputText };
