/**
 * Repository layer. Everything that touches the database goes through here, so moving to
 * Postgres/Supabase only means changing the Prisma datasource and DATABASE_URL.
 */
import { nanoid } from "nanoid";
import { personAnswersSchema, type PersonAnswers } from "../schema";
import { prisma } from "./client";

export interface PersonRecord {
  id: string;
  token: string;
  name: string;
  position: number;
  answers: PersonAnswers | null;
  submittedAt: Date | null;
  updatedAt: Date;
}

export interface GroupRecord {
  id: string;
  name: string | null;
  isDemo: boolean;
  createdAt: Date;
  people: PersonRecord[];
}

function parseAnswers(raw: string | null): PersonAnswers | null {
  if (!raw) return null;
  try {
    const parsed = personAnswersSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

type RawGroup = {
  id: string; name: string | null; isDemo: boolean; createdAt: Date;
  people: { id: string; token: string; name: string; position: number; answers: string | null; submittedAt: Date | null; updatedAt: Date }[];
};

function toRecord(g: RawGroup): GroupRecord {
  return {
    id: g.id,
    name: g.name,
    isDemo: g.isDemo,
    createdAt: g.createdAt,
    people: g.people
      .sort((a, b) => a.position - b.position)
      .map((p) => ({ ...p, answers: parseAnswers(p.answers) })),
  };
}

export interface CreateGroupInput {
  names: string[];
  groupName?: string;
  id?: string;
  isDemo?: boolean;
  tokens?: string[];
  answers?: (PersonAnswers | null)[];
  submitted?: boolean;
}

export async function createGroup(input: CreateGroupInput): Promise<GroupRecord> {
  const id = input.id ?? nanoid(12);
  const now = new Date();
  const g = await prisma.group.create({
    data: {
      id,
      name: input.groupName || null,
      isDemo: input.isDemo ?? false,
      people: {
        create: input.names.map((name, position) => ({
          id: nanoid(12),
          token: input.tokens?.[position] ?? nanoid(21),
          name,
          position,
          answers: input.answers?.[position] ? JSON.stringify(input.answers[position]) : null,
          submittedAt: input.submitted ? now : null,
        })),
      },
    },
    include: { people: true },
  });
  return toRecord(g);
}

export async function getGroup(id: string): Promise<GroupRecord | null> {
  const g = await prisma.group.findUnique({ where: { id }, include: { people: true } });
  return g ? toRecord(g) : null;
}

export async function saveAnswers(personId: string, answers: PersonAnswers): Promise<void> {
  await prisma.person.update({ where: { id: personId }, data: { answers: JSON.stringify(answers) } });
}

export async function markSubmitted(personId: string): Promise<void> {
  await prisma.person.update({ where: { id: personId }, data: { submittedAt: new Date() } });
}

export async function deleteGroup(id: string): Promise<void> {
  await prisma.group.deleteMany({ where: { id } });
}
