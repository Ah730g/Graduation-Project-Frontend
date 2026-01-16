import React, { useState } from "react";
import ImageKit from "imagekit-javascript";
import { useUserContext } from "../contexts/UserContext";
import AxiosClient from "../AxiosClient";
import { v4 as uuidv4 } from "uuid";
import { usePopup } from "../contexts/PopupContext";

export default function SingleFileUpload({ 
  setFileURL, 
  accept = "image/*,.pdf",
  label = "Choose File",
  folder = "/identity_verifications"
}) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useUserContext();
  const { showToast } = usePopup();

  const imagekit = new ImageKit({
    publicKey: import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY,
    urlEndpoint: import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT,
    authenticationEndpoint: `${
      import.meta.env.VITE_BASE_API_URL || "http://localhost:8000"
    }/api/imagekit/auth`,
  });

  // SELECT FILE
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setPreview(null);
    }
  };

  // UPLOAD FILE
  const handleUpload = async () => {
    if (!file) {
      showToast("Please select a file first", "warning");
      return;
    }

    setUploading(true);

    try {
      // Get fresh ImageKit authentication parameters (with cache-busting)
      // ImageKit tokens can only be used once, so we need a fresh token each time
      const auth = await AxiosClient.get("/imagekit/auth", {
        params: { _t: Date.now() } // Cache-busting parameter
      });

      // Check for ImageKit configuration errors
      if (auth.data.error) {
        throw new Error(auth.data.message || "ImageKit is not configured");
      }

      // Upload file to ImageKit
      const fileName = `user_${user.id}_${uuidv4()}_${file.name}`;

      const res = await imagekit.upload({
        file: file,
        fileName,
        useUniqueFileName: true,
        folder: folder,
        ...auth.data,
      });

      if (res.url) {
        // Send URL to parent component
        setFileURL(res.url);
        showToast("File uploaded successfully!", "success");
      } else {
        throw new Error("Upload failed: No URL returned from ImageKit");
      }
    } catch (err) {
      console.error("ImageKit upload error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Upload failed. Please try again.";
      showToast(errorMessage, "error");
    } finally {
      setUploading(false);
    }
  };

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
      </div>

      <div className="flex gap-4 justify-between">
        <label
          htmlFor={`file-upload-${label.replace(/\s+/g, '-')}`}
          className="cursor-pointer w-1/2 border bg-[#3b82f6] py-3 px-5 text-white 
          rounded-md font-semibold text-center hover:bg-[#135dd3] transition"
        >
          <input
            type="file"
            accept={accept}
            id={`file-upload-${label.replace(/\s+/g, '-')}`}
            onChange={handleFileChange}
            className="hidden"
          />
          {label}
        </label>

        <button
          onClick={handleUpload}
          disabled={uploading || !file}
          className="border bg-[#3b82f6] py-3 px-5 text-white rounded-md font-semibold 
          disabled:bg-[#444] flex-1 hover:bg-[#135dd3] transition"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
}

