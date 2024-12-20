import React from "react";
import { Button } from "antd";
import { JunoButtonProps } from "./JunoButton.types";

const JunoButton = React.forwardRef<HTMLButtonElement, JunoButtonProps>(
    ({ buttonType, ...restProps }, ref) => {
        return (
            <Button {...restProps} ref={ref} data-cy={`juno-button-${buttonType}`} />
        );
    }
);

export default JunoButton;
