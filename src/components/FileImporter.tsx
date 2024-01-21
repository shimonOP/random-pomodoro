import { Button } from "@mui/material";
import { ChangeEvent } from "react";

type FileImporterProps = {
    onChange:(e:ChangeEvent<HTMLInputElement>) => void
    buttonLabel:string
}
const FileImporter = (props: FileImporterProps) => {
    const {buttonLabel ,onChange} = props;
    return (
        <>
            <label>
                <input
                    multiple
                    type="file"
                    onChange={onChange}
                    hidden
                    accept=".json"
                />
                <Button  component="span">
                    {buttonLabel}
                </Button>
            </label>
        </>
    );
}
export default FileImporter