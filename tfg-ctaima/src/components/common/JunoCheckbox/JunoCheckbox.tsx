import { Checkbox } from "antd";
import { IJunoCheckboxProps } from "./JunoCheckboxProps";
import React from "react";

const JunoCheckbox: React.FC<IJunoCheckboxProps> = ({
    dataCy,
    ...restProps
}) => {
    return (
        <Checkbox {...restProps} data-cy={`juno-checkbox-${dataCy}`}></Checkbox>
    );
};

export default JunoCheckbox;
