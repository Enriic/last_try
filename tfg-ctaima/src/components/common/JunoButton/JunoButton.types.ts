import { ButtonProps, Switch } from 'antd';

export enum JunoButtonTypes {
    Save = "btnSave",
    Download = "btnDownload",
    Cancel = "btnCancel",
    Add = "btnAdd",
    Ok = "btnOk",
    Link = "btnLink",
    Delete = 'btnDelete',
    Edit = 'btnEdit',
    View = 'btnView',
    LoadMore = 'btnMore',
    Upload = 'btnUpload',
    Reset = 'btnReset',
    Actions = 'btnActions',
    RegiterEntry = 'btnEntry',
    RegisterExit = 'btnExit',
    All = 'btnAll',
    Reload = 'btnReload',
    Switch = 'btnSwitch'
}

export interface JunoButtonProps extends ButtonProps {
    buttonType: JunoButtonTypes | string
}
