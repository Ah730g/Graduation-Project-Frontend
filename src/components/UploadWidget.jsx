import React, { useEffect, useMemo, useRef, useState } from "react";
import ImageKit from "imagekit-javascript";
import { useUserContext } from "../contexts/UserContext";
import AxiosClient from "../AxiosClient";
import { v4 as uuidv4 } from "uuid";
import { usePopup } from "../contexts/PopupContext";

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value];
}

function uniqUrls(urls) {
  const seen = new Set();
  const out = [];
  for (const u of urls) {
    if (!u) continue;
    if (seen.has(u)) continue;
    seen.add(u);
    out.push(u);
  }
  return out;
}

export default function UploadWidget({
  value,
  onChange,
  onUploadingChange,
  isMultiple = true,
  folder = "/posts",
  accept = "image/*",
  label = "Add photos",
}) {
  const inputId = useMemo(() => `img_${uuidv4()}`, []);
  // items include both already-uploaded URLs and newly-selected local files
  // { id, status: 'uploading'|'uploaded'|'error', url?, file?, preview?, errorMessage?, createdAt }
  const [items, setItems] = useState([]);
  const itemsRef = useRef(items);
  itemsRef.current = items;

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

  const uploadedUrlsFromValue = useMemo(() => uniqUrls(asArray(value)), [value]);

  // Reconcile external value (e.g. edit mode loads existing URLs, or parent removes URLs)
  useEffect(() => {
    setItems((prev) => {
      const valueSet = new Set(uploadedUrlsFromValue);
      const next = prev
        // keep local items (uploading/error) regardless of value
        .filter((it) => it.status !== "uploaded" || !it.url || valueSet.has(it.url));

      const have = new Set(next.filter((it) => it.url).map((it) => it.url));
      for (const url of uploadedUrlsFromValue) {
        if (have.has(url)) continue;
        next.push({
          id: `url:${url}`,
          status: "uploaded",
          url,
          createdAt: 0,
        });
      }
      // keep a stable order: local items first by createdAt desc, then uploaded URLs in parent's order
      const local = next
        .filter((it) => it.status !== "uploaded" || !it.url)
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      const uploaded = uploadedUrlsFromValue
        .map((url) => next.find((it) => it.url === url))
        .filter(Boolean);

      return [...local, ...uploaded];
    });
  }, [uploadedUrlsFromValue]);

  const computeAndEmit = (nextItems) => {
    const urls = uniqUrls(nextItems.filter((it) => it.status === "uploaded" && it.url).map((it) => it.url));
    onChange?.(isMultiple ? urls : urls.slice(0, 1));
  };

  const refreshUploadingFlag = (nextItems) => {
    const isUp = nextItems.some((it) => it.status === "uploading");
    setUploading(isUp);
    onUploadingChange?.(isUp);
  };

  const updateItem = (id, patch) => {
    setItems((prev) => {
      const next = prev.map((it) => (it.id === id ? { ...it, ...patch } : it));
      refreshUploadingFlag(next);
      return next;
    });
  };

  const removeItem = (id) => {
    setItems((prev) => {
      const toRemove = prev.find((it) => it.id === id);
      if (toRemove?.preview) URL.revokeObjectURL(toRemove.preview);
      const next = prev.filter((it) => it.id !== id);
      refreshUploadingFlag(next);
      computeAndEmit(next);
      return next;
    });
  };

  const uploadOne = async (itemId, file) => {
    updateItem(itemId, { status: "uploading", errorMessage: null });

    try {
      // ImageKit tokens can only be used once, so we need a fresh token per upload
      const auth = await AxiosClient.get("/imagekit/auth", {
        params: { _t: Date.now() },
      });

      if (auth.data?.error) {
        throw new Error(auth.data.message || "ImageKit is not configured");
      }

      const fileName = `user_${user?.id || "anon"}_${uuidv4()}_${file.name}`;
      const res = await imagekit.upload({
        file,
        fileName,
        useUniqueFileName: true,
        folder,
        ...auth.data,
      });

      if (!res?.url) {
        throw new Error("Upload failed: No URL returned from ImageKit");
      }

      setItems((prev) => {
        const next = prev.map((it) =>
          it.id === itemId
            ? { ...it, status: "uploaded", url: res.url, file: null, errorMessage: null }
            : it
        );
        refreshUploadingFlag(next);
        computeAndEmit(next);
        return next;
      });
    } catch (err) {
      console.error("ImageKit upload error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Upload failed. Please try again.";
      updateItem(itemId, { status: "error", errorMessage });
    }
  };

  // AUTO UPLOAD on selection
  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    e.target.value = ""; // allow selecting the same files again

    if (selectedFiles.length === 0) return;

    const now = Date.now();
    const limitedFiles = isMultiple ? selectedFiles : selectedFiles.slice(0, 1);

    const newItems = limitedFiles.map((f, idx) => {
      const id = `local:${now}:${idx}:${uuidv4()}`;
      return {
        id,
        status: "uploading",
        file: f,
        preview: f.type?.startsWith("image/") ? URL.createObjectURL(f) : null,
        createdAt: now + idx,
      };
    });

    setItems((prev) => {
      // if single mode, replace everything with the new selection
      const base = isMultiple ? prev : prev.filter((it) => {
        if (it.preview) URL.revokeObjectURL(it.preview);
        return it.status === "uploaded" && it.url; // keep uploaded URL if parent wants it? we'll replace anyway via onChange below after upload
      });
      const next = [...newItems, ...base];
      refreshUploadingFlag(next);
      return next;
    });

    // sequential uploads (keeps auth token usage safe and UX predictable)
    for (const it of newItems) {
      await uploadOne(it.id, it.file);
    }
  };

  const retryUpload = async (id) => {
    const it = itemsRef.current.find((x) => x.id === id);
    if (!it?.file) return;
    await uploadOne(id, it.file);
  };

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      for (const it of itemsRef.current) {
        if (it.preview) URL.revokeObjectURL(it.preview);
      }
    };
  }, []);

  const uploadingCount = items.filter((it) => it.status === "uploading").length;
  const errorCount = items.filter((it) => it.status === "error").length;

  return (
    <div className="w-full">
      <div className="mb-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-gray-600">
            Images upload automatically after selection.
          </p>
          {(uploadingCount > 0 || errorCount > 0) && (
            <p className="text-sm text-gray-700">
              {uploadingCount > 0 ? `Uploading ${uploadingCount}...` : ""}
              {uploadingCount > 0 && errorCount > 0 ? " • " : ""}
              {errorCount > 0 ? `${errorCount} failed` : ""}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-3 flex-wrap justify-center">
        {items.length === 0 && !isMultiple && (
          <img
            src={user?.avatar || "avatar.png"}
            className="w-[calc(50%-12px)] rounded-md object-cover"
          />
        )}

        {items.map((it) => {
          const src = it.preview || it.url;
          return (
            <div
              key={it.id}
              className="relative w-[calc(50%-12px)] rounded-md overflow-hidden border border-gray-200 bg-white"
            >
              {src ? (
                <img
                  src={src}
                  className={`w-full h-40 object-cover ${it.status === "uploading" ? "opacity-60" : ""}`}
                />
              ) : (
                <div className="w-full h-40 flex items-center justify-center text-sm text-gray-500">
                  Preview unavailable
                </div>
              )}

              <button
                type="button"
                onClick={() => removeItem(it.id)}
                className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded"
                aria-label="Remove"
                title="Remove"
              >
                Remove
              </button>

              {it.status === "uploading" && (
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  Uploading...
                </div>
              )}

              {it.status === "uploaded" && (
                <div className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                  Uploaded
                </div>
              )}

              {it.status === "error" && (
                <div className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                  <span className="truncate" title={it.errorMessage || "Upload failed"}>
                    Failed
                  </span>
                  <button
                    type="button"
                    onClick={() => retryUpload(it.id)}
                    className="bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-4 justify-between mt-4">
        <label
          htmlFor={inputId}
          className="cursor-pointer w-full border bg-[#3b82f6] py-3 px-5 text-white 
          rounded-md font-semibold text-center hover:bg-[#135dd3] transition"
        >
          <input
            type="file"
            accept={accept}
            id={inputId}
            multiple={isMultiple}
            onChange={handleFileChange}
            className="hidden"
          />
          {uploading ? "Uploading..." : label}
        </label>
      </div>
    </div>
  );
}
