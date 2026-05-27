"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { History, LogOut, Plus, Save, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormError } from "@/components/ui/FormError";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Badge } from "@/components/ui/Badge";
import type { UserProfile } from "@/types/user";
import type { StoredEmergencyContact } from "@/types/user";

interface ProfileClientProps {
  initialUser: UserProfile | null;
}

export function ProfileClient({ initialUser }: ProfileClientProps) {
  const [user, setUser] = useState<UserProfile | null>(initialUser);
  const [name, setName] = useState(initialUser?.name ?? "");
  const [email, setEmail] = useState(initialUser?.email ?? "");
  const [age, setAge] = useState(initialUser?.age?.toString() ?? "");
  const [gender, setGender] = useState(initialUser?.gender ?? "prefer not to say");
  const [contacts, setContacts] = useState<StoredEmergencyContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadContacts = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/user/contacts", { credentials: "include" });
      const data = (await res.json()) as { contacts: StoredEmergencyContact[] };
      setContacts(data.contacts ?? []);
    } catch {
      /* ignore */
    }
  }, [user]);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/user", { credentials: "include", cache: "no-store" });
        const data = (await res.json()) as { user: UserProfile | null };
        if (data.user) {
          setUser(data.user);
          setName(data.user.name);
          setEmail(data.user.email);
          setAge(data.user.age?.toString() ?? "");
          setGender(data.user.gender ?? "prefer not to say");
        }
      } catch {
        /* ignore */
      }
    }

    if (!initialUser) {
      void loadUser();
    }
  }, [initialUser]);

  useEffect(() => {
    if (user) loadContacts();
  }, [user, loadContacts]);

  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        age: age ? Number(age) : undefined,
        gender: gender || undefined,
      };

      const res = await fetch("/api/user", {
        method: user ? "PATCH" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as { user?: UserProfile; error?: string };

      if (!res.ok) {
        setError(data.error ?? "Failed to save profile");
        return;
      }

      setUser(data.user ?? null);
      setSuccess(user ? "Profile updated." : "Profile created — history will now save automatically.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveContacts() {
    setContactsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/user/contacts", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Failed to save contacts");
        return;
      }

      setSuccess("Emergency contacts saved.");
    } catch {
      setError("Network error saving contacts.");
    } finally {
      setContactsLoading(false);
    }
  }

  async function handleSignOut() {
    await fetch("/api/user", { method: "DELETE", credentials: "include" });
    setUser(null);
    setContacts([]);
    setName("");
    setEmail("");
    setAge("");
    setGender("prefer not to say");
    setSuccess("Signed out. Create a new profile to continue saving history.");
  }

  function addContact() {
    setContacts((prev) => [
      ...prev,
      {
        id: `new_${Date.now()}`,
        name: "",
        relation: "",
        phone: "",
        email: "",
      },
    ]);
  }

  function updateContact(index: number, field: keyof StoredEmergencyContact, value: string) {
    setContacts((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  }

  function removeContact(index: number) {
    setContacts((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      <Card>
        <section className="mb-4 flex items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
            {user?.avatarInitials ?? <User className="h-6 w-6" />}
          </span>
          <div>
            <h2 className="text-lg font-semibold">
              {user ? user.name : "Create your profile"}
            </h2>
            <p className="text-sm text-muted">
              {user
                ? "Demo account — no password required."
                : "Set up a profile to save symptom, OCR, and barcode history."}
            </p>
          </div>
        </section>

        <form onSubmit={handleProfileSubmit} className="space-y-4" noValidate>
          <Input
            label="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
            placeholder="Alex Rivera"
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            placeholder="alex@email.com"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Age (optional)"
              type="number"
              min={1}
              max={120}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              disabled={loading}
            />
            <Select
              label="Gender (optional)"
              id="profile-gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              disabled={loading}
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="non-binary">Non-binary</option>
              <option value="prefer not to say">Prefer not to say</option>
            </Select>
          </div>

          {error && <FormError message={error} />}
          {success && (
            <p className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
              {success}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {user ? "Update profile" : "Create profile"}
                </>
              )}
            </Button>
            {user && (
              <>
                <Link href="/history">
                  <Button type="button" variant="outline">
                    <History className="h-4 w-4" />
                    View history
                  </Button>
                </Link>
                <Button type="button" variant="outline" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </>
            )}
          </div>
        </form>
      </Card>

      <Card>
        <section className="mb-4 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold">Emergency contacts</h2>
            <p className="text-sm text-muted">
              Used by the SOS simulation when a profile exists.
            </p>
          </div>
          <Badge variant="outline">Demo</Badge>
        </section>

        {!user ? (
          <p className="text-sm text-muted">
            Create a profile first to manage your caretaker list.
          </p>
        ) : (
          <div className="space-y-4">
            {contacts.length === 0 && (
              <p className="text-sm text-muted">
                No contacts yet. Add a caretaker or physician for the emergency demo.
              </p>
            )}

            {contacts.map((contact, index) => (
              <div
                key={contact.id}
                className="space-y-3 rounded-xl border border-border p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted">
                    Contact {index + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeContact(index)}
                    aria-label={`Remove contact ${index + 1}`}
                  >
                    <Trash2 className="h-4 w-4 text-danger" />
                  </Button>
                </div>
                <Input
                  label="Name"
                  value={contact.name}
                  onChange={(e) => updateContact(index, "name", e.target.value)}
                />
                <Input
                  label="Relation"
                  value={contact.relation}
                  onChange={(e) => updateContact(index, "relation", e.target.value)}
                  placeholder="Spouse, physician..."
                />
                <Input
                  label="Phone"
                  value={contact.phone}
                  onChange={(e) => updateContact(index, "phone", e.target.value)}
                />
                <Input
                  label="Email (optional)"
                  type="email"
                  value={contact.email ?? ""}
                  onChange={(e) => updateContact(index, "email", e.target.value)}
                />
              </div>
            ))}

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={addContact}>
                <Plus className="h-4 w-4" />
                Add contact
              </Button>
              {contacts.length > 0 && (
                <Button
                  type="button"
                  onClick={handleSaveContacts}
                  disabled={contactsLoading}
                >
                  {contactsLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save contacts
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
