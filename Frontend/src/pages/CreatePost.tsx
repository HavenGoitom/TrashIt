import { useState, useEffect, useRef } from "react";
import { useRouter } from "../context";
import { useAuth } from "../context";
import { Button, Input, Textarea, useToast } from "../components/ui";
import { BackButton } from "../components/Layout";
import { DoodleBox, DoodleStar } from "../components/Doodles";
import { api, uploadImages } from "../api";
import type { Post } from "../types";

type PostType = "sell" | "buy";
type PriceMode = "fixed" | "range";

export default function CreatePost() {
  const { params, navigate } = useRouter();
  const { token } = useAuth();
  const { showToast, ToastComponent } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!params.postId;
  const [editPost, setEditPost] = useState<Post | null>(null);

  const [type, setType] = useState<PostType>("sell");
  const [priceMode, setPriceMode] = useState<PriceMode>("fixed");
  const [qtyMode, setQtyMode] = useState<PriceMode>("fixed");
  const [step, setStep] = useState(isEditing ? 2 : 1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    priceFixed: "",
    priceMin: "",
    priceMax: "",
    qtyFixed: "",
    qtyMin: "",
    qtyMax: "",
  });

  useEffect(() => {
    if (isEditing && params.postId) {
      api.posts.getOne(params.postId).then((res) => {
        const found = res.post;
        setEditPost(found);
        setType(found.type);
        setForm({
          title: found.title,
          description: found.description,
          location: found.location || "",
          priceFixed: found.price.fixed !== undefined ? String(found.price.fixed) : "",
          priceMin: found.price.min !== undefined ? String(found.price.min) : "",
          priceMax: found.price.max !== undefined ? String(found.price.max) : "",
          qtyFixed: found.quantity.fixed !== undefined ? String(found.quantity.fixed) : "",
          qtyMin: found.quantity.min !== undefined ? String(found.quantity.min) : "",
          qtyMax: found.quantity.max !== undefined ? String(found.quantity.max) : "",
        });
        setPriceMode(found.price.fixed !== undefined ? "fixed" : "range");
        setQtyMode(found.quantity.fixed !== undefined ? "fixed" : "range");
        if (found.images.length > 0) {
          setImagePreviews(found.images);
        }
      }).catch(() => {
        showToast("Failed to load post for editing", "error");
        navigate("my-posts");
      });
    }
  }, [isEditing, params.postId]);

  function setField(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const fileArray = Array.from(files).slice(0, 5 - imageFiles.length);
    const newFiles = [...imageFiles, ...fileArray].slice(0, 5);
    setImageFiles(newFiles);
    const previews = newFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => {
      prev.forEach(url => URL.revokeObjectURL(url));
      return previews;
    });
  }

  function removeImage(index: number) {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (form.title.length > 100) e.title = "Title too long (max 100 chars)";
    if (!form.description.trim()) e.description = "Description is required";
    if (priceMode === "fixed" && !form.priceFixed) e.price = "Price is required";
    if (priceMode === "range" && (!form.priceMin || !form.priceMax)) e.price = "Both min and max price are required";
    if (priceMode === "range" && Number(form.priceMin) > Number(form.priceMax)) e.price = "Min price cannot exceed max price";
    if (qtyMode === "fixed" && !form.qtyFixed) e.qty = "Quantity is required";
    if (qtyMode === "range" && (!form.qtyMin || !form.qtyMax)) e.qty = "Both min and max quantity are required";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    if (!token) { navigate("login"); return; }

    setErrors({});
    setLoading(true);

    const price = priceMode === "fixed"
      ? { fixed: Number(form.priceFixed) }
      : { min: Number(form.priceMin), max: Number(form.priceMax) };

    const quantity = qtyMode === "fixed"
      ? { fixed: Number(form.qtyFixed) }
      : { min: Number(form.qtyMin), max: Number(form.qtyMax) };

    let images = imagePreviews;
    if (imageFiles.length > 0) {
      setUploadingImages(true);
      try {
        images = await uploadImages(imageFiles, token);
      } catch (uploadErr: unknown) {
        showToast(uploadErr instanceof Error ? uploadErr.message : "Image upload failed", "error");
        setUploadingImages(false);
        setLoading(false);
        return;
      }
      setUploadingImages(false);
    }

    const postData = {
      title: form.title,
      description: form.description,
      type,
      price,
      quantity,
      location: form.location,
      images,
    };

    try {
      if (isEditing && editPost) {
        await api.posts.update(editPost._id, postData, token);
        showToast("Post updated successfully!", "success");
      } else {
        await api.posts.create(postData, token);
        showToast("Post created successfully!", "success");
      }
      setTimeout(() => navigate("my-posts"), 800);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to save post", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      {ToastComponent}
      <BackButton />

      <h1 className="font-display text-3xl font-semibold text-brown-900 mb-1">
        {isEditing ? "Edit post" : "Create a post"}
      </h1>
      <p className="text-brown-400 text-sm mb-8">
        {isEditing ? "Update your listing details." : "Give something a second chance. Tell the community what you have or need."}
      </p>

      {/* Step 1 — Choose type */}
      {!isEditing && step === 1 && (
        <div className="animate-fade-up">
          <div className="bg-warm-white rounded-2xl border border-cream-200 p-6 mb-6">
            <h2 className="font-display text-xl font-semibold text-brown-800 mb-6">
              What are you posting?
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => { setType("sell"); setStep(2); }}
                className={`relative group p-6 rounded-2xl border-2 transition-all text-left ${
                  type === "sell"
                    ? "border-orange-500 bg-orange-500/5"
                    : "border-cream-200 hover:border-orange-300 bg-cream-50"
                }`}
              >
                <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-orange-500/20 transition-colors">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c4622d" strokeWidth="2">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                </div>
                <div className="mb-1 px-2 py-0.5 inline-block rounded-full bg-orange-500/10 text-orange-500 text-xs font-bold uppercase">Sell</div>
                <h3 className="font-semibold text-brown-800 mt-2 mb-1">I have something</h3>
                <p className="text-xs text-brown-400 leading-relaxed">I have a material or item that someone might need.</p>
              </button>

              <button
                onClick={() => { setType("buy"); setStep(2); }}
                className={`relative group p-6 rounded-2xl border-2 transition-all text-left ${
                  type === "buy"
                    ? "border-blue-400 bg-blue-50"
                    : "border-cream-200 hover:border-blue-300 bg-cream-50"
                }`}
              >
                <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                  </svg>
                </div>
                <div className="mb-1 px-2 py-0.5 inline-block rounded-full bg-blue-500/10 text-blue-600 text-xs font-bold uppercase">Buy</div>
                <h3 className="font-semibold text-brown-800 mt-2 mb-1">I'm looking for something</h3>
                <p className="text-xs text-brown-400 leading-relaxed">I need a specific material or item from the community.</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2 — Post form */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="animate-fade-up space-y-6">
          {/* Type indicator */}
          {!isEditing && (
            <div className="flex items-center gap-3 p-4 bg-cream-100 rounded-2xl">
              <div className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase ${type === "sell" ? "bg-orange-500/15 text-orange-600" : "bg-blue-500/15 text-blue-600"}`}>
                {type === "sell" ? "● Selling" : "○ Looking for"}
              </div>
              <span className="text-sm text-brown-500">
                {type === "sell" ? "You have something to offer." : "You're looking for something specific."}
              </span>
              <button type="button" onClick={() => setStep(1)} className="ml-auto text-xs text-orange-500 font-semibold hover:underline">
                Change
              </button>
            </div>
          )}

          {/* Basic info */}
          <div className="bg-warm-white rounded-2xl border border-cream-200 p-6 space-y-4">
            <h3 className="font-semibold text-brown-800">Post details</h3>
            <Input
              label="Title"
              value={form.title}
              onChange={setField("title")}
              error={errors.title}
              placeholder={type === "sell" ? "What are you selling? (e.g. Clean Plastic Bottles)" : "What do you need? (e.g. Looking for Cardboard Boxes)"}
              hint={`${form.title.length}/100 characters`}
            />
            <Textarea
              label="Description"
              value={form.description}
              onChange={setField("description")}
              error={errors.description}
              placeholder={type === "sell" ? "Describe the condition, quantity details, how you got it..." : "Describe what you need, what you'll use it for..."}
              rows={4}
            />
            <Input
              label="Location (optional)"
              value={form.location}
              onChange={setField("location")}
              placeholder="City or neighborhood"
              leftIcon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>}
            />
          </div>

          {/* Images */}
          <div className="bg-warm-white rounded-2xl border border-cream-200 p-6">
            <h3 className="font-semibold text-brown-800 mb-3">Images (optional)</h3>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />
            {imagePreviews.length > 0 && (
              <div className="flex gap-3 mb-4 flex-wrap">
                {imagePreviews.map((preview, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-cream-200">
                    <img src={preview} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-400 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-500"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            {imagePreviews.length < 5 && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-cream-300 rounded-2xl p-10 text-center hover:border-orange-300 transition-colors cursor-pointer relative group"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-bounce-gentle">
                    <DoodleBox size={40} color="#b89672" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-brown-600">Drop images here or click to upload</p>
                    <p className="text-xs text-brown-400 mt-1">PNG, JPG up to 5MB each · Max 5 images {uploadingImages && "· Uploading..."}</p>
                  </div>
                </div>
                <div className="absolute top-3 right-4 animate-wiggle opacity-50">
                  <DoodleStar size={18} color="#e8b84b" />
                </div>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="bg-warm-white rounded-2xl border border-cream-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-brown-800">Price (birr)</h3>
              <div className="flex gap-1 bg-cream-100 p-1 rounded-xl">
                {(["fixed", "range"] as PriceMode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPriceMode(m)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${priceMode === m ? "bg-warm-white text-brown-800 shadow-sm" : "text-brown-500"}`}
                  >
                    {m === "fixed" ? "Fixed" : "Range"}
                  </button>
                ))}
              </div>
            </div>
            {priceMode === "fixed" ? (
              <Input
                value={form.priceFixed}
                onChange={setField("priceFixed")}
                error={errors.price}
                type="number"
                placeholder="e.g. 500"
                min="0"
                leftIcon={<span className="text-brown-400 text-sm font-semibold">birr</span>}
              />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Input value={form.priceMin} onChange={setField("priceMin")} type="number" placeholder="Min price" label="Minimum" min="0" error={errors.price} />
                <Input value={form.priceMax} onChange={setField("priceMax")} type="number" placeholder="Max price" label="Maximum" min="0" />
              </div>
            )}
          </div>

          {/* Quantity */}
          <div className="bg-warm-white rounded-2xl border border-cream-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-brown-800">Quantity</h3>
              <div className="flex gap-1 bg-cream-100 p-1 rounded-xl">
                {(["fixed", "range"] as PriceMode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setQtyMode(m)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${qtyMode === m ? "bg-warm-white text-brown-800 shadow-sm" : "text-brown-500"}`}
                  >
                    {m === "fixed" ? "Fixed" : "Range"}
                  </button>
                ))}
              </div>
            </div>
            {qtyMode === "fixed" ? (
              <Input
                value={form.qtyFixed}
                onChange={setField("qtyFixed")}
                error={errors.qty}
                type="number"
                placeholder="e.g. 10"
                min="1"
              />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Input value={form.qtyMin} onChange={setField("qtyMin")} type="number" placeholder="Min qty" label="Minimum" min="1" error={errors.qty} />
                <Input value={form.qtyMax} onChange={setField("qtyMax")} type="number" placeholder="Max qty" label="Maximum" min="1" />
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => isEditing ? navigate("my-posts") : setStep(1)} className="flex-1">
              {isEditing ? "Cancel" : "Back"}
            </Button>
            <Button type="submit" variant="secondary" size="lg" loading={loading} className="flex-1">
              {isEditing ? "Save changes" : type === "sell" ? "Post for sale" : "Post request"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}