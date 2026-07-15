import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../api/projects.api';
import { usersApi } from '../api/users.api';
import { queryKeys } from '../api/queryKeys';
import { useAppSelector } from '../app/hooks';
import { Card } from './ui/Card';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { ErrorBanner } from './ui/ErrorBanner';
import type { ApiErrorShape } from '../api/client';
import type { ProjectMember, ProjectRole } from '../types';

const ROLE_OPTIONS = [
  { value: 'viewer', label: 'Viewer' },
  { value: 'member', label: 'Member' },
  { value: 'owner', label: 'Owner' },
];

export function ProjectMembers({ projectId, members }: { projectId: string; members: ProjectMember[] }) {
  const currentUser = useAppSelector((state) => state.auth.user);
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState('');
  const [role, setRole] = useState<ProjectRole>('member');
  const [isInviting, setIsInviting] = useState(false);

  const myMembership = members.find((m) => typeof m.userId !== 'string' && m.userId._id === currentUser?._id);
  const canManage = currentUser?.role === 'admin' || myMembership?.role === 'owner';

  const usersQuery = useQuery({
    queryKey: queryKeys.users,
    queryFn: usersApi.list,
    enabled: canManage,
  });

  const memberUserIds = new Set(members.map((m) => (typeof m.userId === 'string' ? m.userId : m.userId._id)));
  const invitableUsers = (usersQuery.data ?? []).filter((u) => !memberUserIds.has(u._id));

  const addMutation = useMutation({
    mutationFn: () => projectsApi.addMember(projectId, { userId: selectedUserId, role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) });
      setSelectedUserId('');
      setRole('member');
      setIsInviting(false);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) => projectsApi.removeMember(projectId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) });
    },
  });

  function handleAdd(event: FormEvent) {
    event.preventDefault();
    if (!selectedUserId) return;
    addMutation.mutate();
  }

  const addError = addMutation.error as ApiErrorShape | null;
  const removeError = removeMutation.error as ApiErrorShape | null;

  return (
    <Card className="members-card">
      <div className="members-header">
        <h3>Members</h3>
        {canManage && !isInviting && (
          <button type="button" className="btn btn-secondary" onClick={() => setIsInviting(true)}>
            Invite member
          </button>
        )}
      </div>
      <ul className="member-list">
        {members.map((member) => {
          const memberUser = typeof member.userId === 'string' ? null : member.userId;
          const isSelf = memberUser?._id === currentUser?._id;
          return (
            <li key={member._id} className="member-row">
              <span className="member-name">
                {memberUser?.name ?? 'Unknown user'}
                {isSelf && ' (you)'}
              </span>
              <span className={`badge badge-role-${member.role}`}>{member.role}</span>
              {canManage && !isSelf && memberUser && (
                <button
                  type="button"
                  className="btn btn-ghost member-remove"
                  onClick={() => removeMutation.mutate(memberUser._id)}
                  disabled={removeMutation.isPending}
                >
                  Remove
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {canManage && isInviting && (
        <form className="inline-form member-form" onSubmit={handleAdd}>
          <Select
            label="Add member"
            options={[
              { value: '', label: invitableUsers.length ? 'Select a user' : 'No users to invite' },
              ...invitableUsers.map((u) => ({ value: u._id, label: `${u.name} (${u.email})` })),
            ]}
            value={selectedUserId}
            onChange={(event) => setSelectedUserId(event.target.value)}
          />
          <Select
            label="Role"
            options={ROLE_OPTIONS}
            value={role}
            onChange={(event) => setRole(event.target.value as ProjectRole)}
          />
          <div className="field field-submit">
            <span className="field-spacer-label" aria-hidden="true">
              &nbsp;
            </span>
            <div className="member-form-actions">
              <Button type="submit" isLoading={addMutation.isPending} disabled={!selectedUserId}>
                Invite
              </Button>
              <Button type="button" variant="ghost" onClick={() => setIsInviting(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </form>
      )}
      {addError && <ErrorBanner message={addError.message} details={addError.details} />}
      {removeError && <ErrorBanner message={removeError.message} details={removeError.details} />}
    </Card>
  );
}
