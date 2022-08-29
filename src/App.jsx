import { useState, useCallback } from "react";
import { FormContainer, SliderElement, RadioButtonGroup, SwitchElement } from "react-hook-form-mui";
import { Box, Button, Stack } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { useDropzone } from "react-dropzone";
import "./App.css";
import AnimationCanvas from "./AnimationCanvas";

function App() {
    const [config, setConfig] = useState();
    const [uploadedFile, setUploadedFile] = useState();
    const [exportProgress, setExportProgress] = useState(0);
    const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
        multiple: false,
        useFsAccessApi: false,
        accept: {
            "model/x3d-vrml": [".wrl"],
        },
        onDropAccepted: (files, event) => setUploadedFile(files[0]),
    });
    return (
        <div className="App">
            <Box
                sx={{
                    maxWidth: 300,
                    margin: "30px auto 0 auto",
                }}
            >
                {config ? (
                    <>
                        <CircularProgress />
                        {exportProgress ? (
                            <Typography variant="subtitle2" color="primary">
                                Exporting animation {exportProgress}%
                            </Typography>
                        ) : (
                            <Typography variant="subtitle2" color="primary">
                                Generating animation
                            </Typography>
                        )}
                        <AnimationCanvas
                            config={config}
                            onExportProgress={(progress) => setExportProgress((progress * 100).toFixed())}
                            onExportFinish={() => {
                                setConfig(null);
                                setExportProgress(null);
                                setUploadedFile(null);
                            }}
                        />
                    </>
                ) : (
                    <FormContainer
                        defaultValues={{ speed: 5, direction: "left", format: "webm", fixColors: false }}
                        onSuccess={(data) => {
                            setConfig({
                                ...data,
                                file: uploadedFile,
                            });
                        }}
                    >
                        <Stack direction={"column"} spacing={2}>
                            <div {...getRootProps({ className: "dropzone" })}>
                                <input {...getInputProps()} />
                                <Typography variant="subtitle2" color="primary">
                                    Drag 'n' drop your .wrl model here or click
                                </Typography>
                            </div>
                            <aside>
                                {uploadedFile && (
                                    <Typography variant="subtitle2" color="primary">
                                        {uploadedFile.path}
                                    </Typography>
                                )}
                            </aside>
                            <SliderElement label="Animation speed" marks required max={10} min={1} name="speed" />
                            <RadioButtonGroup
                                label="Direction"
                                name="direction"
                                required
                                options={[
                                    {
                                        id: "left",
                                        label: "Left",
                                    },
                                    {
                                        id: "right",
                                        label: "Right",
                                    },
                                ]}
                                row
                            />
                            <RadioButtonGroup
                                label="Output format"
                                name="format"
                                options={[
                                    {
                                        id: "webm",
                                        label: "webm",
                                    },
                                    {
                                        id: "gif",
                                        label: "GIF",
                                    },
                                ]}
                                required
                                row
                            />
                            <SwitchElement label="Fix colors" labelPlacement="top" name="fixColors" />
                            <Button type={"submit"} color={"primary"} variant={"contained"} disabled={!uploadedFile}>
                                Generate
                            </Button>
                        </Stack>
                    </FormContainer>
                )}
            </Box>
        </div>
    );
}

export default App;
