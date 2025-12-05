import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/useSettings";
import { showSuccess, showError } from "@/lib/toast";
import { User, Camera } from "lucide-react";

export function ProfileSettings() {
  const { settings, updateSettings } = useSettings();
  const [isSaving, setIsSaving] = useState(false);
  const [displayName, setDisplayName] = useState(
    settings?.profile?.displayName ?? ""
  );
  const [avatarUrl, setAvatarUrl] = useState(
    settings?.profile?.avatarUrl ?? ""
  );
  const [bio, setBio] = useState(settings?.profile?.bio ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateSettings({
        profile: {
          displayName: displayName || undefined,
          avatarUrl: avatarUrl || undefined,
          bio: bio || undefined,
        },
      });
      showSuccess("Profile saved successfully");
    } catch (error) {
      showError(error instanceof Error ? error.message : "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Convert to data URL for local storage
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const hasChanges =
    displayName !== (settings?.profile?.displayName ?? "") ||
    avatarUrl !== (settings?.profile?.avatarUrl ?? "") ||
    bio !== (settings?.profile?.bio ?? "");

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="flex items-center gap-6">
        <div className="relative">
          <div
            onClick={handleAvatarClick}
            className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center cursor-pointer overflow-hidden hover:opacity-80 transition-opacity border-2 border-gray-300 dark:border-gray-600"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-gray-400 dark:text-gray-500" />
            )}
          </div>
          <button
            onClick={handleAvatarClick}
            className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow-md"
            aria-label="Change avatar"
          >
            <Camera className="w-4 h-4 text-white" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Click the avatar to upload a new image.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Recommended: Square image, at least 200x200 pixels.
          </p>
        </div>
      </div>

      {/* Display Name */}
      <div className="space-y-2">
        <Label htmlFor="displayName">Display Name</Label>
        <Input
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Enter your display name"
          className="max-w-md"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          This name will be shown in the app.
        </p>
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us a bit about yourself..."
          className="max-w-md resize-none"
          rows={3}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          A short description about yourself (optional).
        </p>
      </div>

      {/* Avatar URL (advanced) */}
      <div className="space-y-2">
        <Label htmlFor="avatarUrl">Avatar URL (optional)</Label>
        <Input
          id="avatarUrl"
          value={avatarUrl.startsWith("data:") ? "" : avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://example.com/avatar.png"
          className="max-w-md"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Alternatively, you can provide a URL to an external image.
        </p>
      </div>

      {/* Save Button */}
      <div className="pt-2">
        <Button
          onClick={handleSaveProfile}
          disabled={isSaving || !hasChanges}
          className="min-w-[120px]"
        >
          {isSaving ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </div>
  );
}
