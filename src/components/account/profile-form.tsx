"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar } from "@/components/ui/avatar";
import { Alert } from "@/components/ui/alert";
import { profileUpdateSchema } from "@/lib/validation/schemas";
import { updateProfile } from "@/app/account/actions";

export interface ProfileFormProps {
  initialFullName: string;
  initialAvatarUrl: string;
  email: string | null;
}

export function ProfileForm({
  initialFullName,
  initialAvatarUrl,
  email,
}: ProfileFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = React.useState(initialFullName);
  const [avatarUrl, setAvatarUrl] = React.useState(initialAvatarUrl);
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  const dirty =
    fullName !== initialFullName || avatarUrl !== initialAvatarUrl;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    const parsed = profileUpdateSchema.safeParse({ fullName, avatarUrl });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your input.");
      return;
    }

    startTransition(async () => {
      const result = await updateProfile({ fullName, avatarUrl });
      if (!result.ok) {
        setError(result.error ?? "Could not save your profile.");
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center gap-4">
        <Avatar name={fullName} src={avatarUrl || null} size={56} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {fullName || "Your name"}
          </p>
          {email ? (
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          ) : null}
        </div>
      </div>

      {error ? <Alert variant="danger">{error}</Alert> : null}
      {saved && !dirty ? (
        <Alert variant="success">Profile updated.</Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          name="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          maxLength={120}
          required
          placeholder="Ada Lovelace"
          autoComplete="name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="avatarUrl">Avatar URL</Label>
        <Input
          id="avatarUrl"
          name="avatarUrl"
          type="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://…"
          autoComplete="off"
        />
        <p className="text-xs text-muted-foreground">
          Link to an image. Leave empty to use your initials.
        </p>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending || !dirty}>
          {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          Save changes
        </Button>
      </div>
    </form>
  );
}
