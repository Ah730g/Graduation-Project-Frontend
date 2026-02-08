import React, { useEffect, useMemo, useRef, useState } from "react";
import ImageKit from "imagekit-javascript";
import { useUserContext } from "../contexts/UserContext";
import AxiosClient from "../AxiosClient";
import { v4 as uuidv4 } from "uuid";
import { usePopup } from "../contexts/PopupContext";

export default function SingleFileUpload({ 
  setFileURL,
  onUploadingChange,
  accept = "image/*,.pdf",
  label = "Choose File",
  folder = "/identity_verifications"
}) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const fileRef = useRef(null);
  const { user } = useUserContext();
  const { showToast } = usePopup();
  const inputId = useMemo(() => `file_upload_${uuidv4()}`, []);

  const imagekit = new ImageKit({
    publicKey: import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY,
    urlEndpoint: import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT,
    authenticationEndpoint: `${
      import.meta.env.VITE_BASE_API_URL || "http://localhost:8000"
    }/api/imagekit/auth`,
  });

  const setUploadingSafe = (val) => {
    setUploading(val);
    onUploadingChange?.(val);
  };

  const cleanupPreview = (url) => {
    if (url) URL.revokeObjectURL(url);
  };

  const reset = () => {
    cleanupPreview(preview);
    setPreview(null);
    setFile(null);
    fileRef.current = null;
    setErrorMessage(null);
    setFileURL?.(null);
  };

  const uploadFile = async (f) => {
    if (!f) return;
    setErrorMessage(null);
    setUploadingSafe(true);

    try {
      const auth = await AxiosClient.get("/imagekit/auth", {
        params: { _t: Date.now() },
      });

      if (auth.data?.error) {
        throw new Error(auth.data.message || "ImageKit is not configured");
      }

      const fileName = `user_${user?.id || "anon"}_${uuidv4()}_${f.name}`;
      const res = await imagekit.upload({
        file: f,
        fileName,
        useUniqueFileName: true,
        folder,
        ...auth.data,
      });

      if (!res?.url) {
        throw new Error("Upload failed: No URL returned from ImageKit");
      }

      setFileURL?.(res.url);
    } catch (err) {
      console.error("ImageKit upload error:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Upload failed. Please try again.";
      setErrorMessage(msg);
      showToast(msg, "error");
    } finally {
      setUploadingSafe(false);
    }
  };

  // SELECT -> AUTO UPLOAD
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files?.[0];
    e.target.value = ""; // allow reselecting same file
    if (!selectedFile) return;

    // reset current
    cleanupPreview(preview);
    setErrorMessage(null);

    setFile(selectedFile);
    fileRef.current = selectedFile;

    if (selectedFile.type?.startsWith("image/")) {
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setPreview(null);
    }

    await uploadFile(selectedFile);
  };

  const retry = async () => {
    if (!fileRef.current) {
      showToast("Please select a file first", "warning");
      return;
    }
    await uploadFile(fileRef.current);
  };

  useEffect(() => {
    return () => cleanupPreview(preview);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full">
      <div className="mb-3">
        {preview && (
          <div className="mb-3">
            <img
              src={preview}
              alt="Preview"
              className="w-full max-w-md rounded-md object-cover border border-gray-300"
            />
          </div>
        )}
        {file && !preview && (
          <div className="mb-3 p-3 bg-gray-100 rounded-md border border-gray-300">
            <p className="text-sm text-gray-700">
              <strong>Selected:</strong> {file.name}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}
        {uploading && (
          <div className="mb-3 p-3 bg-blue-50 rounded-md border border-blue-200">
            <p className="text-sm text-blue-800 font-semibold">Uploading...</p>
          </div>
        )}
        {errorMessage && (
          <div className="mb-3 p-3 bg-red-50 rounded-md border border-red-200">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-red-800 font-semibold">Upload failed</p>
              <button
                type="button"
                onClick={retry}
                className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md transition"
                disabled={uploading}
              >
                Retry
              </button>
            </div>
            <p className="text-xs text-red-700 mt-1 break-words">{errorMessage}</p>
          </div>
        )}
      </div>

      <div className="flex gap-4 justify-between">
        <label
          htmlFor={inputId}
          className="cursor-pointer w-1/2 border bg-[#3b82f6] py-3 px-5 text-white 
          rounded-md font-semibold text-center hover:bg-[#135dd3] transition"
        >
          <input
            type="file"
            accept={accept}
            id={inputId}
            onChange={handleFileChange}
            className="hidden"
          />
          {uploading ? "Uploading..." : label}
        </label>

        <button
          type="button"
          onClick={reset}
          disabled={uploading || !file}
          className="border bg-gray-100 py-3 px-5 text-gray-800 rounded-md font-semibold 
          disabled:opacity-50 disabled:cursor-not-allowed flex-1 hover:bg-gray-200 transition"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

