import { FileInput, Label } from "flowbite-react";
import { UploadCloud } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import type { FieldRenderProps } from "react-final-form";
import { Field } from "react-final-form";

interface DropzoneProps {
  name: string;
}

const DropzoneInner = ({
  input: { onChange, ...restInput },
}: FieldRenderProps<File, HTMLInputElement>) => {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onChange(acceptedFiles[0]);
    },
    [onChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    noClick: true,
    accept: {
      "image/*": [".jpeg", ".png", ".jpg", ".gif"],
    },
  });

  const file = restInput.value;

  useEffect(() => {
    if (file && file instanceof File) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    setPreview(null);
  }, [file]);

  return (
    <div
      {...getRootProps()}
      className="mb-8 flex w-full items-center justify-center"
    >
      <Label
        htmlFor="dropzone-file"
        className={`flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-all duration-300 ${isDragActive ? "border-gray-500 bg-gray-100" : "border-gray-300 bg-gray-50 hover:border-gray-400"}`}
      >
        <div className="flex flex-col items-center text-center">
          {preview ? (
            <div className="h-32 w-24 overflow-hidden rounded-lg border border-gray-300 shadow-md">
              <img
                src={preview}
                alt="preview"
                className="h-full w-full object-contain"
              />
            </div>
          ) : (
            <UploadCloud className="mb-2 h-10 w-10 text-[#13559d]" />
          )}

          <p className="mt-4 text-sm text-gray-600">
            {preview ? (
              <>
                <span className="font-semibold text-[#13559d]">
                  Click or drag
                </span>{" "}
                to change the image
              </>
            ) : (
              <>
                <span className="font-semibold text-[#13559d]">
                  Click to upload
                </span>{" "}
                or drag and drop a file
              </>
            )}
          </p>

          {!preview && (
            <p className="text-xs text-gray-400">
              SVG, PNG, JPG or GIF (MAX. 800x400px)
            </p>
          )}
        </div>
        <FileInput
          id="dropzone-file"
          {...getInputProps({ name: restInput.name })}
          className="hidden"
        />
      </Label>
    </div>
  );
};

const Dropzone = ({ name }: DropzoneProps) => {
  return (
    <div className="mb-4">
      <Field<File> name={name}>{(props) => <DropzoneInner {...props} />}</Field>
    </div>
  );
};

export default Dropzone;
