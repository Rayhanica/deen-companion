"use client";

import { FormEvent, useState } from "react";
import { Check, Plus, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { ProgressBar } from "@/components/ui/progress";
import { useUserState } from "@/lib/user-state";
import { percentage, toggleValue } from "@/lib/utils";

const assignments = ["Prayed salah", "Read Quran", "Completed lesson", "Helped at home"];

export function FamilyDashboard() {
  const { state, updateState } = useUserState();
  const [name, setName] = useState("");

  function addMember(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    updateState((current) => ({
      ...current,
      familyMembers: [
        ...(current.familyMembers ?? []),
        {
          id: crypto.randomUUID(),
          name: name.trim(),
          role: "child",
          quranTarget: 10,
          salahTarget: 5,
          completedAssignments: []
        }
      ]
    }));
    setName("");
  }

  function toggleAssignment(memberId: string, assignment: string) {
    updateState((current) => ({
      ...current,
      familyMembers: (current.familyMembers ?? []).map((member) =>
        member.id === memberId
          ? { ...member, completedAssignments: toggleValue(member.completedAssignments, assignment) }
          : member
      )
    }));
  }

  return (
    <div>
      <PageHeader
        eyebrow="Family mode"
        title="Build faith together"
        body="Parent-managed child profiles, worship routines, Quran targets, learning assignments, chores, and shared family goals."
      />

      <section className="grid gap-4 xl:grid-cols-[320px_1fr]">
        <Card>
          <UsersRound className="h-6 w-6 text-reed dark:text-teal-200" aria-hidden="true" />
          <h2 className="mt-3 font-semibold text-ink dark:text-white">Add family member</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Local guest profiles are stored on this device. Signed-in family accounts use the household tables in Supabase.
          </p>
          <form onSubmit={addMember} className="mt-4 space-y-3">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Child or family member name"
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink dark:border-white/10 dark:bg-slate-950 dark:text-white"
            />
            <Button type="submit" className="w-full">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add member
            </Button>
          </form>
        </Card>

        <div className="space-y-3">
          {(state.familyMembers ?? []).length ? (
            (state.familyMembers ?? []).map((member) => {
              const progress = percentage(member.completedAssignments.length, assignments.length);
              return (
                <Card key={member.id}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="font-semibold text-ink dark:text-white">{member.name}</h2>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Quran goal: {member.quranTarget} minutes · Salah goal: {member.salahTarget}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-reed dark:text-teal-200">{progress}%</span>
                  </div>
                  <ProgressBar value={progress} className="mt-3" />
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {assignments.map((assignment) => {
                      const done = member.completedAssignments.includes(assignment);
                      return (
                        <button
                          key={assignment}
                          type="button"
                          onClick={() => toggleAssignment(member.id, assignment)}
                          className="flex min-h-11 items-center justify-between rounded-lg border border-slate-200 px-3 text-left text-sm dark:border-white/10"
                        >
                          <span className={done ? "text-slate-400 line-through" : "text-ink dark:text-white"}>{assignment}</span>
                          <span className={`flex h-5 w-5 items-center justify-center rounded-md border ${done ? "border-reed bg-reed text-white" : "border-slate-300 text-transparent"}`}>
                            <Check className="h-3.5 w-3.5" aria-hidden="true" />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </Card>
              );
            })
          ) : (
            <Card>
              <h2 className="font-semibold text-ink dark:text-white">No family profiles yet</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Add a child or family member to begin shared Quran, salah, learning, and household assignments.
              </p>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
