import { Dropdown } from "antd";
import React, { Children, cloneElement, ReactElement } from "react";
import { IJunoDropdownProps } from "./JunoDropdownProps";
import JunoButton from "../JunoButton";

const JunoDropdown: React.FC<IJunoDropdownProps> = ({
  children,
  "data-cy": dataCy,
  ...restProps
}) => {
  const child = Children.only(children);
  const clonedChild =
    React.isValidElement(child) && child.type != JunoButton
      ? cloneElement(child as ReactElement, {
          "data-cy": `juno-dropdown-${dataCy}`,
        })
      : child;
  const items = restProps?.menu?.items?.map((item: any) => {
    return {
      ...item,
      label: (
        <span data-cy={`juno-dropdown-item-${item.key}`}>{item?.label}</span>
      ),
    };
  });

  return (
    <Dropdown
      {...restProps}
      menu={{
        ...restProps.menu,
        items,
      }}
    >
      {clonedChild}
    </Dropdown>
  );
};

export default JunoDropdown;
