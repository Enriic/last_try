import React, { Key } from "react";
import { Checkbox } from "antd";
import { IJunoCheckboxGroupProps } from "./JunoCheckboxGroupProps";
import JunoCheckbox from "../JunoCheckbox/JunoCheckbox";
import { IJunoCheckboxOptionType } from "../JunoCheckbox/JunoCheckboxProps";

const JunoCheckboxGroup: React.FC<IJunoCheckboxGroupProps> = ({
    dataCy,
    options = [],
    ...restProps
}) => {
    return (
        <Checkbox.Group {...restProps}>
            {options.map((option: IJunoCheckboxOptionType, index) => {
                return (
                    <JunoCheckbox
                        dataCy={`juno-checkbox-${dataCy}-${option.dataCy ?? index}`}
                        key={option.value as Key}
                        value={option.value}
                        disabled={option.disabled}
                        style={{ margin: 0, marginRight: "8px" }}
                    >
                        {option.label}
                    </JunoCheckbox>
                );
            })}
        </Checkbox.Group>
    );
};

export default JunoCheckboxGroup;
