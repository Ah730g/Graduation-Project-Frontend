import React, { useState } from "react";
import ImageKit from "imagekit-javascript";
import { useUserContext } from "../contexts/UserContext";
import AxiosClient from "../AxiosClient";
import { v4 as uuidv4 } from "uuid";
import { usePopup } from "../contexts/PopupContext";

export default function UploadWidget({ setAvatarURL, isMultiple = true }) {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState(null);
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

  // SELECT MULTIPLE FILES
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);

    setPreviews(selectedFiles.map((f) => URL.createObjectURL(f)));
  };

  // UPLOAD MULTIPLE FILES
  const handleUpload = async () => {
    if (files.length === 0) {
      showToast("Select at least one image", "warning");
      return;
    }

    setUploading(true);

    try {
      const uploadedURLs = [];

      // Upload each file to ImageKit
      for (let f of files) {
        // Get fresh ImageKit authentication parameters for each file
        // (ImageKit tokens can only be used once)
        const auth = await AxiosClient.get("/imagekit/auth", {
          params: { _t: Date.now() }, // Cache-busting parameter
        });

        // Check for ImageKit configuration errors
        if (auth.data.error) {
          throw new Error(auth.data.message || "ImageKit is not configured");
        }

        const fileName = `user_${user.id}_${uuidv4()}_${f.name}`;

        const res = await imagekit.upload({
          file: f,
          fileName,
          useUniqueFileName: true,
          folder: "/posts",
          ...auth.data,
        });

        if (res.url) {
          uploadedURLs.push(res.url);
        } else {
          throw new Error("Upload failed: No URL returned from ImageKit");
        }
      }

      // send URLs to parent component
      setAvatarURL(uploadedURLs);
      showToast("Images uploaded successfully!", "success");
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
      <div className="flex gap-3 flex-wrap justify-center">
        {previews &&
          previews.map((src, i) => (
            <img
              key={i}
              src={src}
              className="w-[calc(50%-12px)] rounded-md object-cover"
            />
          ))}
        {!isMultiple && !previews && (
          <img
            src={user.avatar || "avatar.png"}
            className="w-[calc(50%-12px)] rounded-md object-cover"
          />
        )}
      </div>

      <div className="flex gap-4 justify-between mt-3">
        <label
          htmlFor="img"
          className="cursor-pointer w-1/2 border bg-[#3b82f6] py-3 px-5 text-white 
          rounded-md font-semibold text-center hover:bg-[#135dd3] transition"
        >
          <input
            type="file"
            accept="image/*"
            id="img"
            multiple={isMultiple}
            onChange={handleFileChange}
            className="hidden"
          />
          Choose Images
        </label>

        <button
          onClick={handleUpload}
          disabled={uploading || files.length === 0}
          className="border bg-[#3b82f6] py-3 px-5 text-white rounded-md font-semibold 
          disabled:bg-[#444] flex-1 hover:bg-[#135dd3] transition"
        >
          {uploading ? "Uploading..." : "Upload Images"}
        </button>
      </div>
    </div>
  );
}
